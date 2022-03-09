import {
  findAllFinders,
  findFinderTrips,
  createFinder,
  findFinder,
  updateFinder,
  deleteFinder
} from '../controllers/finderController.js';

export const finderRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Finders
   *  description: Managing Finders endpoint
   */

  /**
   * @openapi
   * /v1/finders:
   *   get:
   *     description: Returns a list of all the finders
   *     tags: [Finders]
   *     responses:
   *       200:
   *         description: List of finders
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/finder'
   *   post:
   *      description: Create a new finder
   *      tags: [Finders]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/finder'
   *      responses:
   *        201:
   *          description: The finder was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/finder'
   */
  app.route('/v1/finders').get(findAllFinders).post(createFinder);

  /**
   * @openapi
   * /v1/finders/{finderId}:
   *   get:
   *     description: Get a finder by id
   *     tags: [Finders]
   *     parameters:
   *        - name: finderId
   *          type: string
   *          in: path
   *          required: true
   *          description: The finder id
   *     responses:
   *       200:
   *         description: The finder description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/finder'
   *       404:
   *         description: The finder was not found
   *   patch:
   *     description: Update the finder by the id
   *     tags: [Finders]
   *     parameters:
   *       - name: finderId
   *         type: string
   *         in: path
   *         required: true
   *         description: The finder id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/finder'
   *     responses:
   *       200:
   *         description: The updated finder description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/finder'
   *       404:
   *         description: The finder was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the finder by the id
   *     tags: [Finders]
   *     parameters:
   *       - name: finderId
   *         type: string
   *         in: path
   *         required: true
   *         description: The finder id
   *     responses:
   *       200:
   *         description: The finder was deleted
   *       404:
   *         description: The finder was not found
   */
  app.route('/v1/finders/:finderId').get(findFinder).patch(updateFinder).delete(deleteFinder);

  /**
   * @openapi
   * /v1/finders/{finderId}/trips:
   *   get:
   *     description: Returns a list of all the trips in a finder
   *     tags: [Finders]
   *     responses:
   *       200:
   *         description: List of trips in a finder
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/finder'
   */
  app.route('/v1/finders/:finderId/trips').get(findFinderTrips);
};
