import bodyParser from 'body-parser';
import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { dbConnection, dbClose } from './database.js';
import { redisConnection, redisClose } from './redis.js';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../shared/middlewares/error-handler.js';
import {
  actorRoutes,
  applicationRoutes,
  tripRoutes,
  dashboardRoutes,
  sponsorshipRoutes,
  finderRoutes,
  loginRoutes,
  registerRoutes
} from '../routes/index.js';

export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    dbConnection();
    redisConnection();

    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount)
    });
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // Swagger
    this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

    // End Points
    actorRoutes(this.app);
    finderRoutes(this.app);
    applicationRoutes(this.app);
    sponsorshipRoutes(this.app);
    tripRoutes(this.app);
    dashboardRoutes(this.app);
    loginRoutes(this.app);
    registerRoutes(this.app);

    this.app.use(errorHandler);

    this.app.use((req, res) => {
      res.sendStatus(StatusCodes.NOT_FOUND);
    });
  }

  execute() {
    this.middlewares();
    this.instance = this.app.listen(this.port, () => {
      console.log('ACME-Explorer REST API server started on: ' + this.port);
    });
  }

  async close() {
    if (this.instance) {
      await this.instance.close();
    }
    await dbClose();
    await redisClose();
  }
}
