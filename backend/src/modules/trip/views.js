import { StatusCodes } from 'http-status-codes';
import { Trip } from './models.js';
import { RecordNotFound } from '../../core/exceptions.js';
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
    },
    /**
     * @swagger
     * /trips:
     *   post:
     *     description: Create a new trip
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/TripPayload'
     *     responses:
     *       201:
     *         description: Object with the new trip created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Trip'
     */
    post: async (req, res, next) => {
    }
  },
  children: {
    item: {
      url: '/:tripId',
      access: {
        get: 'public'
      },
      roles: ['admin', 'manager'],
      methods: {
        /**
         * @swagger
         * /trips/{tripId}:
         *   get:
         *     description: Get a particular trip information
         *     parameters:
         *       - name: tripId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       200:
         *         description: Trip information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Trip'
         */
        get: async (req, res, next) => {
          try {
            const record = await Trip.findById(req.params.tripId);

            if (!record) {
              return next(new RecordNotFound());
            }

            res.json(record.toClient());
          } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
          }
        },
        /**
         * @swagger
         * /trips/{tripId}:
         *   patch:
         *     description: Update a particular trip information
         *     parameters:
         *       - name: tripId
         *         type: string
         *         in: path
         *         required: true
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/TripPayload'
         *     responses:
         *       200:
         *         description: Trip information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Trip'
         */
        patch: async (req, res, next) => {

        },
        /**
         * @swagger
         * /trips/{tripId}:
         *   delete:
         *     description: Delete a particular trip
         *     parameters:
         *       - name: tripId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       204:
         *         description: Trip was deleted successfully
         */
        delete: async (req, res, next) => {
          try {
            const record = await Trip.findById(req.params.tripId);

            if (!record) {
              return next(new RecordNotFound());
            }

            await record.remove();

            res.sendStatus(StatusCodes.NO_CONTENT);
          } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
          }
        }
      },
      children: {
        cancel: {
          url: '/cancel',
          methods: {
            /**
             * @swagger
             * /trips/{tripId}/cancel:
             *   patch:
             *     description: Cancel a particular trip
             *     parameters:
             *       - name: tripId
             *         type: string
             *         in: path
             *         required: true
             *     responses:
             *       200:
             *         description: Trip information
             *         content:
             *           application/json:
             *             schema:
             *               $ref: '#/components/schemas/Trip'
             */
            patch: async (req, res, next) => {

            }
          }
        }
      }
    }
  }
}];
