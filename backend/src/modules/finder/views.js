import { Finder } from './models.js';
import { RecordNotFound } from '../../core/exceptions.js';
import { StatusCodes } from 'http-status-codes';

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
    },
    /**
     * @swagger
     * /finders:
     *   post:
     *     description: Create a new finder
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FinderPayload'
     *     responses:
     *       201:
     *         description: Object with the new finder created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Finder'
     */
    post: async (req, res, next) => {
    }
  },
  children: {
    item: {
      url: '/:finderId',
      methods: {
        /**
         * @swagger
         * /finders/{finderId}:
         *   get:
         *     description: Get a particular finder information
         *     parameters:
         *       - name: finderId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       200:
         *         description: Finder information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Finder'
         */
        get: async (req, res, next) => {
          try {
            const record = await Finder.findById(req.params.finderId);

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
         * /finders/{finderId}:
         *   patch:
         *     description: Update a particular finder information
         *     parameters:
         *       - name: finderId
         *         type: string
         *         in: path
         *         required: true
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/FinderPayload'
         *     responses:
         *       200:
         *         description: Finder information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Finder'
         */
        patch: async (req, res, next) => {

        },
        /**
         * @swagger
         * /finders/{finderId}:
         *   delete:
         *     description: Delete a particular finder
         *     parameters:
         *       - name: finderId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       204:
         *         description: Finder was deleted successfully
         */
        delete: async (req, res, next) => {
          try {
            const record = await Finder.findById(req.params.finderId);

            if (!record) {
              return next(new RecordNotFound());
            }

            await record.remove();

            res.sendStatus(StatusCodes.NO_CONTENT);
          } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
          }
        }
      }
    }
  }
}];
