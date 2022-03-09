import {
  findAllSponsorships,
  createSponsorship,
  findSponsorship,
  updateSponsorship,
  deleteSponsorship,
  paySponsorship
} from '../controllers/sponsorshipController.js';

export const sponsorshipRoutes = (app) => {
  /**
   * @openapi
   * tags:
   *  name: Sponsorships
   *  description: Managing Sponsorships endpoint
   */

  /**
   * @openapi
   * /v1/sponsorships:
   *   get:
   *     description: Returns a list of all the sponsorships
   *     tags: [Sponsorships]
   *     responses:
   *       200:
   *         description: List of sponsorships
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/sponsorship'
   *   post:
   *      description: Create a new sponsorship
   *      tags: [Sponsorships]
   *      requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/sponsorship'
   *      responses:
   *        201:
   *          description: The sponsorship was successfully created
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/sponsorship'
   */
  app.route('/v1/sponsorships').get(findAllSponsorships).post(createSponsorship);

  /**
   * @openapi
   * /v1/sponsorships/{sponsorshipId}:
   *   get:
   *     description: Get a sponsorship by id
   *     tags: [Sponsorships]
   *     parameters:
   *        - name: sponsorshipId
   *          type: string
   *          in: path
   *          required: true
   *          description: The sponsorship id
   *     responses:
   *       200:
   *         description: The sponsorship description by id
   *         content:
   *           application/json:
   *            schema:
   *              $ref: '#/components/schemas/sponsorship'
   *       404:
   *         description: The sponsorship was not found
   *   put:
   *     description: Update the sponsorship by the id
   *     tags: [Sponsorships]
   *     parameters:
   *       - name: sponsorshipId
   *         type: string
   *         in: path
   *         required: true
   *         description: The sponsorship id
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/sponsorship'
   *     responses:
   *       200:
   *         description: The updated sponsorship description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/sponsorship'
   *       404:
   *         description: The sponsorship was not found
   *       500:
   *         description: An error happened
   *   delete:
   *     description: Remove the sponsorship by the id
   *     tags: [Sponsorships]
   *     parameters:
   *       - name: sponsorshipId
   *         type: string
   *         in: path
   *         required: true
   *         description: The sponsorship id
   *     responses:
   *       200:
   *         description: The sponsorship was deleted
   *       404:
   *         description: The sponsorship was not found
   */
  app.route('/v1/sponsorships/:sponsorshipId').get(findSponsorship).put(updateSponsorship).delete(deleteSponsorship);

  /**
   * @openapi
   * /v1/sponsorships/{sponsorshipId}/pay:
   *   patch:
   *     description: Pay a sponsorship
   *     tags: [Sponsorships]
   *     parameters:
   *       - name: sponsorshipId
   *         type: string
   *         in: path
   *         required: true
   *     responses:
   *       200:
   *         description: The paid sponsorship description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/sponsorship'
   */
  app.route('/v1/sponsorships/:sponsorshipId/pay').patch(paySponsorship);
};
