import {
  tripsPricesStatistics,
  tripsManagersStatistics,
  getFinderStatistics,
  getApplicationStatistics,
  getRatioOfApplications
} from '../controllers/dashboardController.js';

export const dashboardRoutes = (app) => {
  app.route('/v1/dashboard/trips/prices').get(tripsPricesStatistics);
  app.route('/v1/dashboard/trips/managers').get(tripsManagersStatistics);
  app.route('/v1/dashboard/finder').get(getFinderStatistics);
  app.route('/v1/dashboard/applications').get(getApplicationStatistics);
  app.route('/v1/dashboard/applications/ratio').get(getRatioOfApplications);
};
