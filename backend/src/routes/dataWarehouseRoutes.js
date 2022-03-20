import {
  listAllIndicators,
  changeRebuildPeriod,
  findLastIndicator,
  findDataCube,
  createDataCube
} from '../controllers/dataWarehouseController.js';
import { Roles } from '../shared/enums.js';
import { verifyUser } from '../controllers/authController.js';

export const dataWarehouseRoutes = app => {
  // Get a list of all indicators or post a new computation period for rebuilding
  app
    .route('/v1/datawarehouse')
    .get(verifyUser([Roles.ADMIN]), listAllIndicators)
    .post(verifyUser([Roles.ADMIN]), changeRebuildPeriod);

  // Get the last computed indicator
  app.route('/v1/datawarehouse/latest').get(verifyUser([Roles.ADMIN]), findLastIndicator);
  app
    .route('/v1/datawarehouse/cube')
    .get(verifyUser([Roles.ADMIN]), findDataCube)
    .post(verifyUser([Roles.ADMIN]), createDataCube);
};
