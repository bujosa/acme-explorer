import { findConfigurations, updateConfiguration } from '../controllers/configurationController.js';
import { verifyUser } from '../controllers/authController.js';
import { Roles } from '../shared/enums.js';

export const configurationRoutes = app => {
  const auth = verifyUser([Roles.ADMIN]);

  /**
   * @openapi
   * tags:
   *  name: Configurations
   *  description: Managing Configurations endpoint
   */

  /**
   * @openapi
   * /v1/configurations:
   *   get:
   *     description: Returns a list of all the configurations
   *     tags: [Configurations]
   *     responses:
   *       200:
   *         description: List of configurations
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/configuration'
   */
  app.route('/v1/configurations').get(auth, findConfigurations);

  /**
   * @openapi
   * /v1/configurations/{configurationId}:
   *   put:
   *     description: Update the configuration by the id
   *     tags: [Configurations]
   *     parameters:
   *       - name: configurationId
   *         type: string
   *         in: path
   *         required: true
   *         description: The configuration id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/configuration'
   *     responses:
   *       200:
   *         description: The updated configuration
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/configuration'
   *       404:
   *         description: The configuration was not found
   *       500:
   *         description: An error happened
   */
  app.route('/v1/configurations/:configurationId').put(auth, updateConfiguration);
};
