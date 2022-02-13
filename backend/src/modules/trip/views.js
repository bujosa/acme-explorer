import { StatusCodes } from 'http-status-codes';
import { Trip } from './models.js';
import Constants from './constants.js';

export default [{
  url: '/trips',
  access: {
    get: 'public'
  },
  roles: {
    post: ['admin', 'manager']
  },
  methods: {
    /**
     * @swagger
     * /trips:
     *   get:
     *     description: Get the list of all trips
     *     responses:
     *       200:
     *         description: An array with the list of trips
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TripList'
     */
    get: async (req, res) => {
      let { perPage, page, sort, ...query } = req.query;
      const [field, sortType] = sort ? sort.split(',') : Constants.defaultSort;
      perPage = perPage ? parseInt(perPage) : Constants.defaultPerPage;
      page = Math.max(0, page ?? 0);

      try {
        const records = await Trip.find(query).skip(perPage * page).limit(perPage).sort({ [field]: sortType }).exec();
        const count = await Trip.countDocuments();
        res.json({
          records: records.map(record => record.toClient()),
          page: page,
          pages: count / perPage
        });
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
      }
    }
  }
}];
