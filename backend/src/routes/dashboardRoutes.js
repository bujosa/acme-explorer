import { trips_prices_statistics, trips_managers_statistics } from '../controllers/dashboardController.js';

export const dashboardRoutes = (app) => {
  /**
   * @section statistics
   * @type get trip_prices_statistics
   * @url /v1/dashboard/trips/prices
   * @param {string}
   */
  app.route('/v1/dashboard/trips/prices').get(trips_prices_statistics);

  /**
   * @section statistics
   * @type get trip_managers_statistics
   * @url /v1/dashboard/trips/managers
   * @param {string}
   */
  app.route('/v1/dashboard/trips/managers').get(trips_managers_statistics);
};
