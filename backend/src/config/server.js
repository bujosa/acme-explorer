import bodyParser from 'body-parser';
import express from 'express';
import { dbConnection, dbClose } from '../database/config.js';
import { actorRoutes } from '../routes/actorRoutes.js';
import { finderRoutes } from '../routes/finderRoutes.js';
import { applicationRoutes } from '../routes/applicationRoutes.js';
import { sponsorshipRoutes } from '../routes/sponsorshipRoutes.js';
import { tripRoutes } from '../routes/tripRoutes.js';

export class Server {
  constructor() {
    this.app = express();

    this.port = process.env.PORT || 8080;

    dbConnection();
  }

  middlewares() {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // End Points
    actorRoutes(this.app);
    finderRoutes(this.app);
    applicationRoutes(this.app);
    sponsorshipRoutes(this.app);
    tripRoutes(this.app);
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
  }
}
