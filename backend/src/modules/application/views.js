import { Application } from './models.js';

export default [{
  url: '/applications',
  methods: {
    /**
     * @swagger
     * /applications:
     *   get:
     *     description: Get the list of all applications
     *     responses:
     *       200:
     *         description: An array with the list of applications
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ApplicationList'
     */
    get: async (req, res) => {
      const records = await Application.find({});
      res.json(records.map(record => record.toClient()));
    }
  }
}];
