import { Actor } from './models.js';
import { StatusCodes } from 'http-status-codes';
import { BaseError, RecordNotFound, UserForbidden } from '../../core/exceptions.js';

export default [{
  url: '/actors',
  roles: ['admin'],
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
    },
    /**
     * @swagger
     * /actors:
     *   post:
     *     description: Create a new actor
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ActorPayload'
     *     responses:
     *       201:
     *         description: Object with the new actor created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Actor'
     */
    post: async (req, res, next) => {
      const form = req.body;

      try {
        const validationResult = await Actor.validate(form);
        if (validationResult instanceof BaseError) {
          return next(validationResult);
        }

        const actor = await Actor.new(form);
        res.status(StatusCodes.CREATED).json(actor.toClient());
      } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e);
      }
    }
  },
  children: {
    item: {
      url: '/:actorId',
      roles: ['admin'],
      methods: {
        /**
         * @swagger
         * /actors/{actorId}:
         *   get:
         *     description: Get a particular actor information
         *     parameters:
         *       - name: actorId
         *         type: string
         *         in: path
         *         required: true
         *     responses:
         *       200:
         *         description: Actor information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Actor'
         */
        get: async (req, res, next) => {
          try {
            const record = await Actor.findById(req.params.actorId);

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
         * /actors/{actorId}:
         *   patch:
         *     description: Update a particular actor information
         *     parameters:
         *       - name: actorId
         *         type: string
         *         in: path
         *         required: true
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/ActorPayload'
         *     responses:
         *       200:
         *         description: Actor information
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Actor'
         */
        patch: async (req, res, next) => {
          try {
            const { user } = req.app.locals;
            const actorId = req.params.actorId;
            const form = req.body;
            if (actorId !== user.id && !(user.role === 'admin')) {
              return next(new UserForbidden());
            }

            const record = await Actor.findById(actorId);
            if (!record) {
              return next(new RecordNotFound());
            }

            const validationResult = await Actor.validate(form);
            if (validationResult instanceof BaseError) {
              return next(validationResult);
            }

            if (form.name) {
              record.name = form.name;
            }

            if (form.surname) {
              record.surname = form.surname;
            }

            if (form.phone) {
              record.phone = form.phone;
            }

            if (form.address) {
              record.address = form.address;
            }

            if (form.state) {
              record.state = form.state;
            }

            await record.save();

            res.json(record.toClient());
          } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
          }
        }
      }
    }
  }
}];
