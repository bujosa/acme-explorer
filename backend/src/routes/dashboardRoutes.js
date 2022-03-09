import {
  tripsPricesStatistics,
  tripsManagersStatistics,
  getFinderStatistics,
  getApplicationStatistics,
  getRatioOfApplications
} from '../controllers/dashboardController.js';

export const dashboardRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Dashboard
   *  description: Dashboard with all the analytics of Acme Explorer
   */

  /**
   * @openapi
   * /v1/dashboard/trips/prices:
   *   get:
   *     description: Returns the statistics of the prices of all trips
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Statistics of all prices in trips
   */
  app.route('/v1/dashboard/trips/prices').get(tripsPricesStatistics);

  /**
   * @openapi
   * /v1/dashboard/trips/manager:
   *   get:
   *     description: Returns the statistics of the managers of all trips
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Statistics of all managers in trips
   */
  app.route('/v1/dashboard/trips/managers').get(tripsManagersStatistics);

  /**
   * @openapi
   * /v1/dashboard/finder:
   *   get:
   *     description: Returns the statistics of finders
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Statistics of all finders
   */
  app.route('/v1/dashboard/finder').get(getFinderStatistics);

  /**
   * @openapi
   * /v1/dashboard/applications:
   *   get:
   *     description: Returns the statistics of all applications
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Statistics of all applications
   */
  app.route('/v1/dashboard/applications').get(getApplicationStatistics);

  /**
   * @openapi
   * /v1/dashboard/applications/ratio:
   *   get:
   *     description: Returns the ratio of all applications
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: Ratio of all applications
   */
  app.route('/v1/dashboard/applications/ratio').get(getRatioOfApplications);
};
