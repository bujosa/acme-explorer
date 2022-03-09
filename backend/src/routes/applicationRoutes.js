import {
  findAllApplications,
  createApplication,
  findApplication,
  updateApplication,
  deleteApplication,
  cancelApplication,
  payApplication,
  acceptApplication,
  rejectApplication
} from '../controllers/applicationController.js';

export const applicationRoutes = (app) => {
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
  app.route('/v1/applications').get(findAllApplications).post(createApplication);

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
  app.route('/v1/applications/:applicationId').get(findApplication).put(updateApplication).delete(deleteApplication);

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
  app.route('/v1/applications/:applicationId/cancel').patch(cancelApplication);

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
  app.route('/v1/applications/:applicationId/pay').patch(payApplication);

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
  app.route('/v1/applications/:applicationId/accept').patch(acceptApplication);

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
  app.route('/v1/applications/:applicationId/reject').patch(rejectApplication);
};
