import { register } from '../controllers/actorController.js';

export const registerRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Register
   *  description: Managing Registers endpoint
   */

  /**
   * @openapi
   * /v1/register:
   *   post:
   *      description: Create a new actors
   *      tags: [Register]
   *      security: []
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/register'
   *      responses:
   *        201:
   *          description: The actor was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/actor'
   *
   */
  app.route('/v1/register').post(register);
};
