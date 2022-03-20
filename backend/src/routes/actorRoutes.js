import {
  findActors,
  createActor,
  findActor,
  updateActor,
  deleteActor,
  banActor,
  unbanActor,
  self
} from '../controllers/actorController.js';
import { verifyUser } from '../controllers/authController.js';
import { Roles } from '../shared/enums.js';
import { ALL_ROLES } from '../shared/auth/authorized-roles.arrays.js';

export const actorRoutes = app => {
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
  app
    .route('/v1/actors')
    .get(verifyUser([Roles.ADMIN]), findActors)
    .post(verifyUser([Roles.ADMIN]), createActor);

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
  app
    .route('/v1/actors/:actorId')
    .get(verifyUser([Roles.ADMIN]), findActor)
    .put(verifyUser(ALL_ROLES), updateActor)
    .delete(verifyUser([Roles.ADMIN]), deleteActor);

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
   *               $ref: '#/components/schemas/actor'
   */
  app.route('/v1/actors/:actorId/ban').patch(verifyUser([Roles.ADMIN]), banActor);

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
   *               $ref: '#/components/schemas/actor'
   */
  app.route('/v1/actors/:actorId/unban').patch(verifyUser([Roles.ADMIN]), unbanActor);

  /**
   * @openapi
   * /v1/self:
   *   get:
   *     description: Get current actor
   *     tags: [Actors]
   *     responses:
   *       200:
   *         description: Return current user
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/actor'
   *       404:
   *         description: The actor was not found
   */
  app.route('/v1/self').get(verifyUser(ALL_ROLES), self);
};
