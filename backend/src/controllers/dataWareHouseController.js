import * as async from 'async';

import { dataWareHouseModel as DataWareHouse } from '../models/dataWareHouseModel.js';
import { tripModel } from '../models/tripModel.js';
import { finderModel } from '../models/finderModel.js';
import { applicationModel } from '../models/applicationModel.js';
import { CronJob, CronTime } from 'cron';

// '0 0 * * * *' Every hour
// '*/30 * * * * *' Every 30 seconds
// '*/10 * * * * *' Every 10 seconds
// '* * * * * *' Every second
let rebuildPeriod = '* * * * * *'; // Default
let computeDataWareHouseJob;

// TODO: Add authentication
export const listAllIndicators = (req, res) => {
  console.log('Requesting ALL indicators');

  DataWareHouse.find()
    .sort('-computationMoment')
    .exec(function(err, indicators) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(indicators);
      }
    });
};

// TODO: Add authentication
export const findLastIndicator = (req, res) => {
  console.log('Requesting LAST indicator');

  DataWareHouse.find()
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

// TODO: Add validation and authentication
export const changeRebuildPeriod = function(req, res) {
  console.log('Updating rebuild period. Request period: ' + req.query.rebuildPeriod);
  rebuildPeriod = req.query.rebuildPeriod;
  computeDataWareHouseJob.setTime(new CronTime(rebuildPeriod));
  computeDataWareHouseJob.start();

  res.json(req.query.rebuildPeriod);
};

export const createDataWareHouseJob = function createDataWareHouseJob() {
  computeDataWareHouseJob = new CronJob(
    rebuildPeriod,
    function() {
      const newDataWareHouse = new DataWareHouse();
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
            newDataWareHouse.tripsPricesStatistics = results[0];
            newDataWareHouse.tripsManagersStatistics = results[1];
            newDataWareHouse.finderStatistics = results[2];
            newDataWareHouse.applicationStatistics = results[3];
            newDataWareHouse.ratioOfApplications = results[4];
            newDataWareHouse.rebuildPeriod = rebuildPeriod;

            newDataWareHouse.save(function(err, datawarehouse) {
              if (err) {
                console.log('Error saving datawarehouse: ' + err);
              } else {
                console.log('new DataWareHouse succesfully saved. Date: ' + new Date());
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
  // TODO: Replace
  const totalNum = 5.0;
  // const totalNum = await applicationModel.countDocuments({});
  applicationModel.aggregate(
    [
      {
        $group: {
          _id: '$state',
          count: { $count: {} }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
          ratio: { $multiply: [{ $divide: [100, totalNum] }, '$count'] }
        }
      }
    ],
    function(err, res) {
      callback(err, res[0]);
    }
  );
}
