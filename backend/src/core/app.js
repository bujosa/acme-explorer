import express, { Router } from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createClient } from 'redis';
import { StatusCodes } from 'http-status-codes';
import { Auth } from './authorization.js';
import { InvalidToken, ExpiredToken, UserForbidden } from './exceptions.js';

class App {
  constructor ({ server, apps, env, logger, router, storage, redis }) {
    this.server = server;
    this.apps = apps;
    this.env = env;
    this.logger = logger;
    this.router = router;
    this.storage = storage;
    this.redis = redis;
  }

  static create (params) {
    const env = process.env;
    const apps = params.apps ?? {};
    const server = params.express ?? express();
    const source = params.mongoose ?? mongoose;
    const redis = params.redis ?? createClient({ url: env.REDIS_URI });
    return new this({
      server: server,
      apps: apps,
      env: env,
      logger: console,
      router: new RouteManager(server),
      storage: new StorageManager({
        source, env
      }),
      redis: new RedisManager({
        redis, env
      })
    });
  }

  async start (params = {}) {
    params.views = params.views ?? this.getAllViews();

    try {
      await this._loadDependencies(params);
      await this._startServer();
      await this._startSubscriptions(params);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async close () {
    if (this.instance) {
      await this.instance.close();
    }
    await this.storage.close();
    await this.redis.close();
  }

  getAppName () {
    const name = this.env.NAME ?? '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getSwaggerOptions () {
    return {
      name: this.env.NAME,
      definition: {
        info: {
          title: 'Acme explorer default api title',
          description: 'Acme explorer default api description'
        }
      },
      apis: ['./src/views.js']
    };
  }

  getAllViews () {
    return this._getAllFromApps('views').flat();
  }

  getAllSwagger () {
    return Object.assign({}, ...this._getAllFromApps('SwaggerSchemas'));
  }

  _getAllFromApps (property) {
    return Object.keys(this.apps).map(name => this.apps[name][property]);
  }

  async _startServer () {
    this.instance = await this.server.listen(this.env.PORT);
    this.instance.setTimeout(parseInt(this.env.SERVER_TIMEOUT));
    this.logger.info(`Service ${this.env.NAME} started successfully on port ${this.env.PORT}`);
  }

  async _loadDependencies ({ views }) {
    this.router.addSwaggerMiddleware(this.getSwaggerOptions());
    this.router.addPublishMiddleware(this.redis.publish.bind(this.redis));
    this.router.load(views);
    await this.storage.start();
    this.logger.info(`Database ${this.env.NAME} started successfully`);
  }

  async _startSubscriptions ({ subscriptions }) {
    await this.redis.start();
    await this.redis.load(subscriptions);
    this.logger.info(`Redis ${this.env.NAME} started successfully`);
  }
}

class RouteManager {
  constructor (server) {
    this.server = server;
    this.base = '/api';
    this.version = 'v1';
    this.url = this.getBaseRoute();
  }

  load (views) {
    const self = this;
    this.server.locals.apiRoute = this.url;
    this.server.use(morgan('combined'));
    this.server.use(bodyParser.urlencoded({ extended: false }));
    this.server.use(bodyParser.json());
    this.server.use(fileUpload());

    views.forEach((view) => {
      if ('url' in view) {
        const url = self.getBaseRoute(view.version);
        this.server.use(`${url}${view.url}`, self._loadParentView(view));
      }
    });
    this.server.use((err, req, res, next) => {
      if (err.code) {
        res.status(err.code).json(err.toClient());
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err.message);
      }
    });
    this.server.use((req, res) => {
      res.sendStatus(StatusCodes.NOT_FOUND);
    });
  }

  getBaseRoute (version) {
    return `${this.base}/${version ?? this.version}`;
  }

  getAuthMiddleware ({ access, roles }) {
    return async (req, res, next) => {
      const method = req.method.toLowerCase();
      if ((access === 'public' || typeof access === 'object') && method in access && access[method] === 'public') {
        return next();
      } else {
        let token = req.session && req.session.token;
        if (!token && req.headers.authorization) {
          token = req.headers.authorization.substring(7);
        }
        try {
          const valid = await Auth.verify(token);
          this.server.locals.user = valid;
          if (roles) {
            return ((Array.isArray(roles) && roles.includes(valid.role)) ||
            (typeof roles === 'object' && method in roles && roles[method].includes(valid.role)))
              ? next()
              : next(new UserForbidden());
          } else {
            return next();
          }
        } catch (err) {
          if (err.message === 'jwt expired') {
            if (req.session != null) {
              req.session.token = null;
            }
            return next(new ExpiredToken());
          } else {
            return next(new InvalidToken());
          }
        }
      }
    };
  }

  addPublishMiddleware (publish) {
    this.server.use((_, res, next) => {
      res.publish = publish;
      next();
    });
  }

  addSwaggerMiddleware ({ name, ...options }) {
    this.server.use(`${this.url}/help`,
      swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options), { explorer: true })
    );
  }

  _loadParentView (view) {
    const self = this;
    const router = new Router({ mergeParams: true });
    if ('methods' in view) {
      this._loadRouteMethods(router, { ...view, url: '/' });
    }

    if ('children' in view) {
      Object.entries(view.children).forEach(([key, value]) => {
        if ('methods' in value) {
          this._loadRouteMethods(router, value);
        }

        if ('children' in value) {
          Object.entries(value.children).forEach(([$key, $value]) => {
            const path = `${value.url}${$value.url}`;
            router.use(path, self._loadParentView($value));
          });
        }
      });
    }

    return router;
  }

  _loadRouteMethods (router, view) {
    const path = view.url;
    const access = this.getAuthMiddleware(view);
    Object.entries(view.methods).forEach(([$key, $value]) => router[$key](path, access, $value));
  }
}

class StorageManager {
  constructor ({ source, env }) {
    this.env = env;
    this.source = source;
  }

  start () {
    return this.source.connect(this.env.DB_URI);
  }

  close () {
    return this.source.connection.close();
  }
}

class RedisManager {
  constructor ({ env, redis }) {
    this.env = env;
    this.redis = redis;
    this.subscriptions = [];
    this.isTest = env.NODE_ENV === 'test';
  }

  publish (channel, data) {
    if (this.isTest) return;
    return this.redis.publish(`${this.env.NAME}/${channel}`, Buffer.from(JSON.stringify(data)));
  }

  async load (subscriptions = []) {
    if (this.isTest) return;
    const self = this;
    for (let i = 0; i < subscriptions.length; ++i) {
      const subscription = subscriptions[i];
      if (subscription.channels) {
        const serviceChannel = subscription.service;
        for (let j = 0; j < subscription.channels.length; ++j) {
          const channel = subscription.channels[j];
          const subscriber = self.redis.duplicate();
          await subscriber.connect();
          subscriber.subscribe(`${serviceChannel}/${channel.name}`, async (message) => {
            if (message) {
              let data;
              try {
                data = JSON.parse(message.toString());
              } catch (e) {
                data = message;
              }
              await channel.on(data);
            }
          }, true);
          self.subscriptions.push(subscriber);
        }
      }
    }
  }

  start () {
    if (this.isTest) return;
    return this.redis.connect();
  }

  close () {
    if (this.isTest) return;
    return this.redis.disconnect();
  }
}

export { App };
