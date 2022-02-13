import { Sponsorship } from './models.js';

export default [{
  url: '/sponsorships',
  roles: {
    post: ['admin', 'manager']
  },
  methods: {
    /**
     * @swagger
     * /sponsorships:
     *   get:
     *     description: Get the list of all sponsorships
     *     responses:
     *       200:
     *         description: An array with the list of sponsorships
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/SponsorshipList'
     */
    get: async (req, res) => {
      const records = await Sponsorship.find({});
      res.json(records.map(record => record.toClient()));
    }
  }
}];
