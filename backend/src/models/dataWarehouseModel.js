import mongoose from 'mongoose';
import moment from 'moment';
import { ApplicationState } from '../shared/enums.js';
const { Schema } = mongoose;

const DataWarehouseSchema = new Schema(
  {
    tripsPricesStatistics: {
      avgPrice: { type: Number },
      minPrice: { type: Number },
      maxPrice: { type: Number },
      stdPrice: { type: Number }
    },
    tripsManagersStatistics: {
      avgCount: { type: Number },
      minCount: { type: Number },
      maxCount: { type: Number },
      stdCount: { type: Number }
    },
    finderStatistics: {
      avgPrice: { type: Number },
      top10Keywords: [{ type: String }]
    },
    applicationStatistics: {
      avgCount: { type: Number },
      minCount: { type: Number },
      maxCount: { type: Number },
      stdCount: { type: Number }
    },
    ratioOfApplications: [
      {
        _id: false,
        status: { type: String },
        ratio: { type: Number }
      }
    ],
    computationMoment: { type: Date, default: Date.now },
    rebuildPeriod: { type: String }
  },
  { strict: false }
);

DataWarehouseSchema.index({ computationMoment: -1 });

const DataCubeModel = new Schema({
  period: { type: String, required: true },
  explorer: { type: String, required: true },
  totalSpent: { type: Number, required: true }
});

DataCubeModel.statics.getPeriodDates = () => {
  const lastYearsAmount = 3;
  const lastMonthsAmount = 36;
  const years = Array.from(Array(lastYearsAmount + 1).keys())
    .slice(1)
    .map(year => ({
      keyword: `Y${String(year).padStart(2, '0')}`,
      date: moment()
        .subtract(year, 'years')
        .toDate()
    }));
  const months = Array.from(Array(lastMonthsAmount + 1).keys())
    .slice(1)
    .map(month => ({
      keyword: `M${String(month).padStart(2, '0')}`,
      date: moment()
        .subtract(month, 'months')
        .toDate()
    }));

  return years.concat(months);
};

DataCubeModel.statics.getPeriodFilter = dates => {
  return dates
    .map(filter => {
      return {
        [filter.keyword]: [
          {
            $match: {
              state: ApplicationState.ACCEPTED,
              updatedAt: {
                $gte: filter.date
              }
            }
          },
          {
            $lookup: {
              from: 'trips',
              localField: 'trip',
              foreignField: '_id',
              as: 'tripDoc'
            }
          },
          {
            $unwind: '$tripDoc'
          },
          {
            $group: {
              _id: '$explorer',
              totalSpent: { $sum: '$tripDoc.price' }
            }
          },
          {
            $project: {
              _id: 0,
              period: filter.keyword,
              explorer: '$_id',
              totalSpent: 1
            }
          }
        ]
      };
    })
    .reduce((a, b) => ({ ...b, ...a }), {});
};

DataCubeModel.index({ period: 1 });

export const dataWarehouseModel = mongoose.model('DataWarehouse', DataWarehouseSchema);
export const dataCubeModel = mongoose.model('DataCube', DataCubeModel);
