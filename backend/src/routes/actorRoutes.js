import {
  find_all_actors,
  create_an_actor,
  find_an_actor,
  update_an_actor,
  delete_an_actor,
  ban_an_actor,
  unban_an_actor
} from '../controllers/actorController.js';

export const actorRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Actors
   *  description: Managing Actors endpoint
   */

  /**
   * @openapi
   * /v1/actors:
   *   get:
   *     description: Returns a list of all the actors
   *     tags: [Actors]
   *     responses:
   *       200:
   *         description: List of actors
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/actor'
   *   post:
   *      description: Create a new actors
   *      tags: [Actors]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/actor'
   *      responses:
   *        201:
   *          description: The actor was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/actor'
   */
  app.route('/v1/actors').get(find_all_actors).post(create_an_actor);

  /**
   * @openapi
   * /v1/actors/{actorId}:
   *   get:
   *     description: Get an actor by id
   *     tags: [Actors]
   *     parameters:
   *        - name: actorId
   *          type: string
   *          in: path
   *          required: true
   *          description: The actor id
   *     responses:
   *       200:
   *         description: The actor description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/actor'
   *       404:
   *         description: The actor was not found
   *   put:
   *     description: Update the actor by the id
   *     tags: [Actors]
   *     parameters:
   *       - name: actorId
   *         type: string
   *         in: path
   *         required: true
   *         description: The actor id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/actor'
   *     responses:
   *       200:
   *         description: The updated actor description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/actor'
   *       404:
   *         description: The actor was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the actor by the id
   *     tags: [Actors]
   *     parameters:
   *       - name: actorId
   *         type: string
   *         in: path
   *         required: true
   *         description: The actor id
   *     responses:
   *       200:
   *         description: The actor was deleted
   *       404:
   *         description: The actor was not found
   */
  app.route('/v1/actors/:actorId').get(find_an_actor).put(update_an_actor).delete(delete_an_actor);

  /**
   * @openapi
   * /v1/actors/{actorId}/ban:
   *   patch:
   *     description: Ban an actor
   *     tags: [Actors]
   *     parameters:
   *       - name: actorId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The banned actor description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/actors'
   */
  app.route('/v1/actors/:actorId/ban').patch(ban_an_actor);

  /**
   * @openapi
   * /v1/actors/{actorId}/unban:
   *   patch:
   *     description: Unban an actor
   *     tags: [Actors]
   *     parameters:
   *       - name: actorId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The unbanned actor description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/actors'
   */
  app.route('/v1/actors/:actorId/unban').patch(unban_an_actor);
};
