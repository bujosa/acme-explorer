import {
  find_all_trips,
  find_trips_by_keyword,
  create_trip,
  find_trip,
  update_trip,
  delete_trip,
  find_my_trips
} from '../controllers/tripController.js';

export const tripRoutes = (app) => {
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
  app.route('/v1/trips').get(find_trips_by_keyword).post(create_trip);

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
  app.route('/v1/trips/:tripId').get(find_trip).put(update_trip).delete(delete_trip);

  /**
   * @section trips
   * @type get
   * @url /v1/myTrips
   */
  app.route('/v1/myTrips').get(find_my_trips);

  /**
   * @section trips
   * @type get
   * @url /v1/allTrips
   */
  // This route is not part of the requirements, consider removing it
  app.route('/v1/allTrips').get(find_all_trips);
};
