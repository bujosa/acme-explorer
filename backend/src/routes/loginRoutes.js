import { login } from '../controllers/actorController.js';

export const loginRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Login
   *  description: Managing Login endpoint
   */

  /**
   * @openapi
   * /v1/login/:
   *   get:
   *     description: Return an actor with a token
   *     tags: [Login]
   *     security: []
   *     parameters:
   *       - name: email
   *         type: string
   *         in: path
   *         required: true
   *         description: The actor email
   *       - name: password
   *         type: string
   *         in: path
   *         required: true
   *         description: The actor password
   *     responses:
   *       200:
   *         description: A custom token for an actor
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/actor'
   *
   */
  app.route('/v1/login/').get(login);
};
