import { Actor } from './models.js';

export default [{
  url: '/actors',
  roles: {
    get: ['admin']
  },
  methods: {
    /**
     * @swagger
     * /actors:
     *   get:
     *     description: Get the list of all actors
     *     responses:
     *       200:
     *         description: An array with the list of actors
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ActorList'
     */
    get: async (req, res) => {
      const records = await Actor.find({});
      res.json(records.map(record => record.toClient()));
    }
  }
}];
