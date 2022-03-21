import { StatusCodes } from 'http-status-codes';
import { configurationModel } from '../models/configurationModel.js';
import Constants from '../shared/constants.js';

export const findConfigurations = async (req, res) => {
  let { perPage, page, sort, ...query } = req.query;
  const [field, sortType] = sort ? sort.split(',') : Constants.defaultSort;
  perPage = perPage ? parseInt(perPage) : Constants.defaultPerPage;
  page = Math.max(0, page ?? 0);

  try {
    const records = await configurationModel
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ [field]: sortType })
      .exec();
    const count = await configurationModel.countDocuments();
    res.json({
      records: records,
      page: page,
      pages: count / perPage
    });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

export const updateConfiguration = async (req, res) => {
  try {
    const configuration = await configurationModel.findOneAndUpdate({ _id: req.params.configurationId }, req.body, {
      new: true
    });
    res.json(configuration);
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
