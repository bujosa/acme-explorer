import { Finder } from './models.js';

export default [{
  url: '/finders',
  methods: {
    /**
     * @swagger
     * /finders:
     *   get:
     *     description: Get the list of all finders
     *     responses:
     *       200:
     *         description: An array with the list of finders
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/FinderList'
     */
    get: async (req, res) => {
      const records = await Finder.find({});
      res.json(records.map(record => record.toClient()));
    }
  }
}];
