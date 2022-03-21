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

  /**
   * @openapi
   * /v1/datawarehouse/latest:
   *   get:
   *     description: Get a the last computed indicator
   *     tags: [Dashboard]
   *     responses:
   *       200:
   *         description: The last indicator
   */
  app.route('/v1/datawarehouse/latest').get(verifyUser([Roles.ADMIN]), findLastIndicator);

  /**
   * @openapi
   * /v1/datawarehouse/cube:
   *   get:
   *     description: Get a list all data in the created cube
   *     tags: [Dashboard]
   *     parameters:
   *       - name: e
   *         in: query
   *         required: false
   *         description: Explorer id
   *         type: string
   *       - name: p
   *         in: query
   *         required: false
   *         description: Period in the form of [M01, M36] or [Y01, Y03]
   *         type: string
   *       - name: v
   *         in: query
   *         required: false
   *         description: Money to filter by based on the operator
   *         type: string
   *       - name: operator
   *         in: query
   *         required: false
   *         description: The new computation period
   *         type: string
   *         enum: [equal, not equal, greater than, smaller than, greater than or equal, smaller than or equal]
   *     responses:
   *       200:
   *         description: List all explorers that matched the search criteria
   *   post:
   *      description: Compute and store new cube calculations
   *      tags: [Dashboard]
   *      responses:
   *        201:
   *          description: Computation period updated
   */
  app
    .route('/v1/datawarehouse/cube')
    .get(verifyUser([Roles.ADMIN]), findDataCube)
    .post(verifyUser([Roles.ADMIN]), createDataCube);
};
