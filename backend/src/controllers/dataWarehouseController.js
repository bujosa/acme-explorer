import * as async from 'async';
import { StatusCodes } from 'http-status-codes';

import { dataCubeModel, dataWarehouseModel as DataWarehouse } from '../models/dataWarehouseModel.js';
import { tripModel } from '../models/tripModel.js';
import { finderModel } from '../models/finderModel.js';
import { applicationModel } from '../models/applicationModel.js';
import { CronJob, CronTime } from 'cron';
import { Operator } from '../shared/enums.js';
import { InvalidRequest } from '../shared/exceptions.js';

// '0 0 * * * *' Every hour
// '*/30 * * * * *' Every 30 seconds
// '*/10 * * * * *' Every 10 seconds
// '* * * * * *' Every second
let rebuildPeriod = '0 0 * * * *'; // Default
let computeDataWarehouseJob;

export const listAllIndicators = (req, res) => {
  console.log('Requesting ALL indicators');

  DataWarehouse.find()
    .sort('-computationMoment')
    .exec(function(err, indicators) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(indicators);
      }
    });
};

export const findLastIndicator = (req, res) => {
  console.log('Requesting LAST indicator');

  DataWarehouse.find()
    .sort('-computationMoment')
    .limit(1)
    .exec(function(err, indicators) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(indicators);
      }
    });
};

export const changeRebuildPeriod = function(req, res) {
  console.log('Updating rebuild period. Request period: ' + req.query.rebuildPeriod);
  if (req.query.rebuildPeriod === 'everyHour') {
    rebuildPeriod = '0 0 * * * *';
  } else if (req.query.rebuildPeriod === 'everyMinute') {
    rebuildPeriod = '*/1 * * * * *';
  } else if (req.query.rebuildPeriod === 'everyTenSeconds') {
    rebuildPeriod = '*/10 * * * * *';
  } else if (req.query.rebuildPeriod === 'everySecond') {
    rebuildPeriod = '* * * * * *';
  } else {
    throw new InvalidRequest(
      'Invalid rebuild period, accepted values: everyHour, everyMinute, everyTenSeconds, everySecond'
    );
  }
  console.log(rebuildPeriod);
  computeDataWarehouseJob.setTime(new CronTime(rebuildPeriod));
  computeDataWarehouseJob.start();

  res.json(req.query.rebuildPeriod);
};

export const createDataWarehouseJob = function createDataWarehouseJob() {
  computeDataWarehouseJob = new CronJob(
    rebuildPeriod,
    function() {
      const newDataWarehouse = new DataWarehouse();
      console.log('Cron job submitted. Rebuild period: ' + rebuildPeriod);
      async.parallel(
        [
          computeTripsPricesStatistics,
          computeTripsManagersStatistics,
          computeFinderStatistics,
          computeApplicationStatistics,
          computeRatioOfApplications
        ],
        function(err, results) {
          if (err) {
            console.log('Error saving datawarehouse: ' + err);
          } else {
            newDataWarehouse.tripsPricesStatistics = results[0];
            newDataWarehouse.tripsManagersStatistics = results[1];
            newDataWarehouse.finderStatistics = results[2];
            newDataWarehouse.applicationStatistics = results[3];
            newDataWarehouse.ratioOfApplications = results[4];
            newDataWarehouse.rebuildPeriod = rebuildPeriod;

            newDataWarehouse.save(function(err, datawarehouse) {
              if (err) {
                console.log('Error saving datawarehouse: ' + err);
              } else {
                console.log('new DataWarehouse succesfully saved. Date: ' + new Date());
              }
            });
          }
        }
      );
    },
    null,
    true,
    'Europe/Madrid'
  );
};

export const findDataCube = async (req, res, next) => {
  try {
    const { query } = req;

    if (query.v && query.operator && !Operator[query.operator]) {
      return next(new InvalidRequest('The operations must be one of: ' + Object.keys(Operator).join(', ')));
    }

    const filter = {
      ...(query.p ? { period: query.p } : {}),
      ...(query.e ? { explorer: query.e } : {}),
      ...(query.v && query.operator
        ? {
            totalSpent: {
              [Operator[query.operator]]: query.v
            }
          }
        : {})
    };
    const results = await dataCubeModel.find(filter);

    res.json(results);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

export const createDataCube = async (req, res) => {
  const dates = dataCubeModel.getPeriodDates();
  const filter = dataCubeModel.getPeriodFilter(dates);

  try {
    await dataCubeModel.remove({});

    const statistics = await applicationModel.aggregate([
      {
        $facet: filter
      },
      {
        $project: {
          result: {
            $concatArrays: dates.map(filter => `$${filter.keyword}`)
          }
        }
      },
      {
        $unwind: { path: '$result' }
      },
      {
        $replaceRoot: { newRoot: '$result' }
      }
    ]);
    const results = await dataCubeModel.insertMany(statistics);
    res.json(results);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

function computeTripsPricesStatistics(callback) {
  tripModel.aggregate(
    [
      {
        $group: {
          _id: 0,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          stdPrice: { $stdDevSamp: '$price' }
        }
      },
      {
        $project: {
          _id: 0,
          avgPrice: 1,
          minPrice: 1,
          maxPrice: 1,
          stdPrice: 1
        }
      }
    ],
    function(err, res) {
      callback(err, res[0]);
    }
  );
}

function computeTripsManagersStatistics(callback) {
  tripModel.aggregate(
    [
      {
        $group: {
          _id: '$manager',
          countTrips: { $count: {} }
        }
      },
      {
        $group: {
          _id: 0,
          avgCount: { $avg: '$countTrips' },
          minCount: { $min: '$countTrips' },
          maxCount: { $max: '$countTrips' },
          stdCount: { $stdDevSamp: '$countTrips' }
        }
      },
      {
        $project: {
          _id: 0,
          avgCount: 1,
          minCount: 1,
          maxCount: 1,
          stdCount: 1
        }
      }
    ],
    function(err, res) {
      callback(err, res[0]);
    }
  );
}

function computeFinderStatistics(callback) {
  finderModel.aggregate(
    [
      {
        $facet: {
          price: [
            {
              $group: {
                _id: 0,
                avgMin: { $avg: '$minPrice' },
                avgMax: { $avg: '$maxPrice' }
              }
            },
            {
              $project: {
                _id: 0,
                avgMin: 1,
                avgMax: 1
              }
            }
          ],
          keywords: [
            {
              $group: {
                _id: '$keyword',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                keyword: '$_id',
                count: 1
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ],
    function(err, res) {
      callback(err, res[0]);
    }
  );
}

function computeApplicationStatistics(callback) {
  applicationModel.aggregate(
    [
      {
        $group: {
          _id: '$trip',
          countApplications: { $count: {} }
        }
      },
      {
        $group: {
          _id: 0,
          avgCount: { $avg: '$countApplications' },
          minCount: { $min: '$countApplications' },
          maxCount: { $max: '$countApplications' },
          stdCount: { $stdDevSamp: '$countApplications' }
        }
      },
      {
        $project: {
          _id: 0,
          avgCount: 1,
          minCount: 1,
          maxCount: 1,
          stdCount: 1
        }
      }
    ],
    function(err, res) {
      callback(err, res[0]);
    }
  );
}

function computeRatioOfApplications(callback) {
  applicationModel.aggregate(
    [
      {
        $group: {
          _id: null,
          totalCount: {
            $count: {}
          },
          data: {
            $push: '$$ROOT'
          }
        }
      },
      {
        $unwind: '$data'
      },
      {
        $group: {
          _id: '$data.state',
          stateCount: { $count: {} },
          totalCount: {
            $first: '$totalCount'
          }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          ratio: { $round: [{ $multiply: [{ $divide: ['$stateCount', '$totalCount'] }, 100] }, 2] }
        }
      }
    ],
    (err, res) => callback(err, res)
  );
}
