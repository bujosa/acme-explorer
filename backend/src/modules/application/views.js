import { Application } from './models.js';
import { RecordNotFound } from '../../core/exceptions.js';
import { StatusCodes } from 'http-status-codes';

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
    },
    /**
     * @swagger
     * /applications:
     *   post:
     *     description: Create a new application
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ApplicationPayload'
     *     responses:
     *       201:
     *         description: Object with the new application created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Application'
     */
    post: async (req, res, next) => {
    }
  },
  children: {
    item: {
      url: '/:applicationId',
      methods: {
        /**
         * @swagger
         * /applications/{applicationId}:
         *   get:
         *     description: Get a particular application information
         *     parameters:
         *       - name: applicationId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       200:
         *         description: Application information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Application'
         */
        get: async (req, res, next) => {
          try {
            const record = await Application.findById(req.params.applicationId);

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
         * /applications/{applicationId}:
         *   patch:
         *     description: Update a particular application information
         *     parameters:
         *       - name: applicationId
         *         type: string
         *         in: path
         *         required: true
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ApplicationPayload'
         *     responses:
         *       200:
         *         description: Application information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Application'
         */
        patch: async (req, res, next) => {

        }
      },
      children: {
        pay: {
          url: '/pay',
          methods: {
            /**
             * @swagger
             * /applications/{applicationId}/pay:
             *   patch:
             *     description: Pay a particular application
             *     parameters:
             *       - name: applicationId
             *         type: string
             *         in: path
             *         required: true
             *     responses:
             *       200:
             *         description: Application information
             *         content:
             *           application/json:
             *             schema:
             *               $ref: '#/components/schemas/Application'
             */
            patch: async (req, res, next) => {

            }
          }
        }
      }
    }
  }
}];
