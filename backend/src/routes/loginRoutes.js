import { login } from '../controllers/actorController.js';

export const loginRoutes = app => {
  /**
   * @openapi
   * tags:
   *  name: Login
   *  description: Managing Login endpoint
   */

  /**
   * @openapi
   * /v1/login/:
   *   post:
   *     description: Return an actor with a token
   *     tags: [Login]
   *     security: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/loginPayload'
   *     responses:
   *       200:
   *         description: A custom token for an actor
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/actor'
   *
   */
  app.route('/v1/login').post(login);
};
