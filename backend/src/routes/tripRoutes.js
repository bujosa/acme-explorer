import { 
  findTrips, 
  createTrip, 
  findTrip, 
  updateTrip, 
  deleteTrip, 
  findMyTrips, 
  publishTrip, 
  cancelTrip,
  deleteStage,
  addStage
 } from '../controllers/tripController.js';

export const tripRoutes = app => {
  /**
   * @openapi
   * tags:
   *  name: Trips
   *  description: Managing Trips endpoint
   */

  /**
   * @openapi
   * /v1/trips:
   *   get:
   *     description: Returns a list of all the trips
   *     tags: [Trips]
   *     responses:
   *       200:
   *         description: List of trips
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/trip'
   *   post:
   *      description: Create a new trip
   *      tags: [Trips]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/trip'
   *      responses:
   *        201:
   *          description: The trip was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/trip'
   */
  app
    .route('/v1/trips')
    .get(findTrips)
    .post(createTrip);

  /**
   * @openapi
   * /v1/trips/{tripId}:
   *   get:
   *     description: Get a trip by id
   *     tags: [Trips]
   *     parameters:
   *        - name: tripId
   *          type: string
   *          in: path
   *          required: true
   *          description: The trip id
   *     responses:
   *       200:
   *         description: The trip description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/trip'
   *       404:
   *         description: The trip was not found
   *   put:
   *     description: Update the trip by the id
   *     tags: [Trips]
   *     parameters:
   *       - name: tripId
   *         type: string
   *         in: path
   *         required: true
   *         description: The trip id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/trip'
   *     responses:
   *       200:
   *         description: The updated trip description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/trip'
   *       404:
   *         description: The trip was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the trip by the id
   *     tags: [Trips]
   *     parameters:
   *       - name: tripId
   *         type: string
   *         in: path
   *         required: true
   *         description: The trip id
   *     responses:
   *       200:
   *         description: The trip was deleted
   *       404:
   *         description: The trip was not found
   */
  app
    .route('/v1/trips/:tripId')
    .get(findTrip)
    .put(updateTrip)
    .delete(deleteTrip);

  /**
   * @section trips
   * @type get
   * @url /v1/myTrips
   */
  app.route('/v1/myTrips').get(findMyTrips);

  app.route('/v1/trips/:tripId/publish').patch(publishTrip);

  app.route('/v1/trips/:tripId/cancel').patch(cancelTrip);

  app.route('/v1/trips/:tripId/stages/:stageId').delete(deleteStage);

  app.route('/v1/trips/:tripId/stages').post(addStage);

};
