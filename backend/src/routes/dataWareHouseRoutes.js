import { listAllIndicators, changeRebuildPeriod, findLastIndicator } from '../controllers/dataWareHouseController.js';

export const dataWareHouseRoutes = app => {
  // Get a list of all indicators or post a new computation period for rebuilding
  app
    .route('/v1/dataWareHouse')
    .get(listAllIndicators)
    .post(changeRebuildPeriod);

  // Get the last computed indicator
  app.route('/v1/dataWareHouse/latest').get(findLastIndicator);
};
