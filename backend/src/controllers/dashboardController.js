import { tripModel } from '../models/tripModel.js';
import { finderModel } from '../models/finderModel.js';
import { StatusCodes } from 'http-status-codes';

export const tripsPricesStatistics = (req, res) => {
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
    (err, stats) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(stats);
      }
    }
  );
};

export const tripsManagersStatistics = (req, res) => {
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
    (err, stats) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(stats);
      }
    }
  );
};

export const getFinderStatistics = async (req, res) => {
  try {
    const statistics = await finderModel.aggregate([
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
    ]);
    res.json(statistics);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};
