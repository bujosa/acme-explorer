import { StatusCodes } from 'http-status-codes';
import Constants from '../shared/constants.js';
import { finderModel } from '../models/finderModel.js';
import { tripModel } from '../models/tripModel.js';
import { configurationModel } from '../models/configurationModel.js';
import { RecordNotFound, UserForbidden } from '../shared/exceptions.js';
import { redis } from '../config/redis.js';

export const findFinders = async (req, res) => {
  const { actor } = res.locals;
  let { perPage, page, sort, ...query } = req.query;
  const [field, sortType] = sort ? sort.split(',') : Constants.defaultSort;
  perPage = perPage ? parseInt(perPage) : Constants.defaultPerPage;
  page = Math.max(0, page ?? 0);

  if (!actor.isAdmin()) {
    query.actor = actor._id;
  }

  try {
    const records = await finderModel
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ [field]: sortType })
      .exec();
    const count = await finderModel.countDocuments();
    res.json({
      records: records,
      page: page,
      pages: count / perPage
    });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

export const findFinder = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const record = await finderModel.findById(req.params.finderId);

    if (!record) {
      return next(new RecordNotFound());
    }

    if (!actor.isAdmin() && record.actor.toString() !== actor._id.toString()) {
      return next(new UserForbidden());
    }

    res.json(record);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
};

export const createFinder = async (req, res) => {
  const { actor } = res.locals;
  const $actor = actor.isAdmin() && req.body ? req.body.actor : actor._id.toString();
  const newFinder = new finderModel({ ...req.body, actor: $actor });

  try {
    const finder = await newFinder.save();
    res.status(StatusCodes.CREATED).json(finder);
  } catch (e) {
    if (e) {
      if (e.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(e);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
      }
    }
  }
};

export const updateFinder = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const record = await finderModel.findById(req.params.finderId);

    if (!record) {
      return next(new RecordNotFound());
    }

    if (!actor.isAdmin() && record.actor.toString() !== actor._id.toString()) {
      return next(new UserForbidden());
    }

    const finder = await finderModel.findOneAndUpdate({ _id: req.params.finderId }, req.body, { new: true });
    res.json(finder);
  } catch (e) {
    if (e) {
      if (e.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(e);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
      }
    }
  }
};

export const deleteFinder = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const record = await finderModel.findById(req.params.finderId);

    if (!record) {
      return next(new RecordNotFound());
    }

    if (!actor.isAdmin() && record.actor.toString() !== actor._id.toString()) {
      return next(new UserForbidden());
    }

    await finderModel.deleteOne({ _id: req.params.finderId });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e);
  }
};

export const findFinderTrips = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const record = await finderModel.findById(req.params.finderId);

    if (!record) {
      return next(new RecordNotFound());
    }

    if (!actor.isAdmin() && record.actor.toString() !== actor._id.toString()) {
      return next(new UserForbidden());
    }

    const query = record.toRedis();
    const key = JSON.stringify(query);

    const cacheValue = await redis.get(key);

    let result;
    if (cacheValue) {
      result = JSON.parse(cacheValue);
    } else {
      const redisConfig = await configurationModel.getRedisConfig();
      const $query = tripModel.getFinderQuery(query);

      result = await tripModel
        .find($query)
        .populate('manager')
        .limit(redisConfig.maxResultsFinder || Constants.maxResultsFinder);
      result = result.map(_ => _.cleanup());
      if (result) {
        await redis.set(key, JSON.stringify(result), {
          EX: redisConfig.timeCachedFinder || Constants.timeCachedFinder
        });
      }
    }
    res.json(result);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(e.message);
  }
};
