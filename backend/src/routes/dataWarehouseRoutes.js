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
  /**
   * @openapi
   * tags:
   *  name: Dashboard
   *  description: Managing the admin dashboard
   */

  /**
   * @openapi
   * /v1/datawarehouse:
   *   get:
   *     description: Get a list of all indicators
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: List of indicators
   *   post:
   *      description: Post a new computation period for rebuilding
   *      tags: [Dashboard]
   *      parameters:
   *       - name: rebuildPeriod
   *         in: query
   *         required: true
   *         description: The new computation period
   *         type: string
   *         enum: [everyHour,everyMinute,everyTenSeconds,everySecond]
   *      responses:
   *        201:
   *          description: Computation period updated
   *        400:
   *          description: The trip was not created
   *        422:
   *          description: Validation error
   *        401:
   *          description: Authentication error
   *        403:
   *          description: Authorization error
   */
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
