import { tripModel } from '../models/tripModel.js';

export const trips_prices_statistics = (req, res) => {
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

export const trips_managers_statistics = (req, res) => {
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
