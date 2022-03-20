import {
  listAllIndicators,
  changeRebuildPeriod,
  findLastIndicator,
  findDataCube,
  createDataCube
} from '../controllers/dataWarehouseController.js';

export const dataWarehouseRoutes = app => {
  // Get a list of all indicators or post a new computation period for rebuilding
  app
    .route('/v1/datawarehouse')
    .get(listAllIndicators)
    .post(changeRebuildPeriod);

  // Get the last computed indicator
  app.route('/v1/datawarehouse/latest').get(findLastIndicator);
  app
    .route('/v1/datawarehouse/cube')
    .get(findDataCube)
    .post(createDataCube);
};
