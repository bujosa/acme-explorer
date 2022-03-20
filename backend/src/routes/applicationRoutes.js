import { verifyUser } from '../controllers/authController.js';
import { Roles } from '../shared/enums.js';
import { EXPLORER, MANAGER } from '../shared/auth/authorized-roles.arrays.js';
import {
  findAllApplications,
  createApplication,
  findApplication,
  updateApplication,
  deleteApplication,
  cancelApplication,
  payApplication,
  acceptApplication,
  rejectApplication,
  findMyApplications
} from '../controllers/applicationController.js';

export const applicationRoutes = app => {
  /**
   * @openapi
   * tags:
   *  name: Applications
   *  description: Managing Applications endpoint
   */

  /**
   * @openapi
   * /v1/applications:
   *   get:
   *     description: Returns a list of all the applications
   *     tags: [Applications]
   *     responses:
   *       200:
   *         description: List of applications
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/application'
   *   post:
   *      description: Create a new application
   *      tags: [Applications]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/application'
   *      responses:
   *        201:
   *          description: The application was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/application'
   */
  app
    .route('/v1/applications')
    .get(verifyUser([Roles.ADMIN]), findAllApplications)
    .post(verifyUser(EXPLORER), createApplication);

  /**
   * @openapi
   * /v1/myApplications:
   *   get:
   *     description: Returns a list of all the applications by the logged in user
   *     tags: [Applications]
   *     responses:
   *       200:
   *         description: List of self applications
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/application'
   */
  app.route('/v1/myApplications').get(verifyUser([Roles.EXPLORER, Roles.MANAGER]), findMyApplications);

  /**
   * @openapi
   * /v1/applications/{applicationId}:
   *   get:
   *     description: Get an application by id
   *     tags: [Applications]
   *     parameters:
   *        - name: applicationId
   *          type: string
   *          in: path
   *          required: true
   *          description: The application id
   *     responses:
   *       200:
   *         description: The application description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/application'
   *       404:
   *         description: The application was not found
   *   put:
   *     description: Update the application by the id
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *         description: The application id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/application'
   *     responses:
   *       200:
   *         description: The updated application description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/application'
   *       404:
   *         description: The application was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the application by the id
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *         description: The application id
   *     responses:
   *       200:
   *         description: The application was deleted
   *       404:
   *         description: The application was not found
   */
  app
    .route('/v1/applications/:applicationId')
    .get(verifyUser(EXPLORER), findApplication)
    .put(verifyUser(EXPLORER), updateApplication)
    .delete(verifyUser(EXPLORER), deleteApplication);

  /**
   * @openapi
   * /v1/applications/{applicationId}/cancel:
   *   patch:
   *     description: Cancel an application
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The cancelled application description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/application'
   */
  app.route('/v1/applications/:applicationId/cancel').patch(verifyUser(EXPLORER), cancelApplication);

  /**
   * @openapi
   * /v1/applications/{applicationId}/pay:
   *   patch:
   *     description: Pay an application
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The paid application description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/application'
   */
  app.route('/v1/applications/:applicationId/pay').patch(verifyUser(EXPLORER), payApplication);

  /**
   * @openapi
   * /v1/applications/{applicationId}/accept:
   *   patch:
   *     description: Accept an application
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The accepted application description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/application'
   */
  app.route('/v1/applications/:applicationId/accept').patch(verifyUser(MANAGER), acceptApplication);

  /**
   * @openapi
   * /v1/applications/{applicationId}/reject:
   *   patch:
   *     description: Reject an application
   *     tags: [Applications]
   *     parameters:
   *       - name: applicationId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The rejected application description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/application'
   */
  app.route('/v1/applications/:applicationId/reject').patch(verifyUser(MANAGER), rejectApplication);
};
