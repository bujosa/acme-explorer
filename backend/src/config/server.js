import bodyParser from 'body-parser';
import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';
import { dbConnection, dbClose } from './database.js';
import { redisConnection, redisClose } from './redis.js';
import { StatusCodes } from 'http-status-codes';
import { errorHandler } from '../shared/middlewares/error-handler.js';
import { createDataWarehouseJob } from '../controllers/dataWarehouseController.js';
import {
  actorRoutes,
  applicationRoutes,
  tripRoutes,
  sponsorshipRoutes,
  finderRoutes,
  loginRoutes,
  registerRoutes,
  dataWarehouseRoutes
} from '../routes/index.js';

export class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.serviceAccount = this.getServiceAccount();

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
    loginRoutes(this.app);
    registerRoutes(this.app);
    dataWarehouseRoutes(this.app);

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

  getServiceAccount() {
    let account = {};
    try {
      account = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    } catch (e) {
      throw new Error('Please review the firebase service account config. ' + e.message);
    }

    return account;
  }

  createDataWarehouseJob() {
    if (process.env.NODE_ENV !== 'test') {
      createDataWarehouseJob();
    }
  }

  static async createIdTokenFromCustomToken(uid) {
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

    try {
      const customToken = await admin.auth().createCustomToken(uid);
      const res = await axios({
        url: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${FIREBASE_API_KEY}`,
        method: 'post',
        data: {
          token: customToken,
          returnSecureToken: true
        },
        json: true
      });

      return res.data.idToken;
    } catch (err) {
      console.error(err);
    }
  }
}
