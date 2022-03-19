import mongoose from 'mongoose';
const { Schema } = mongoose;

const DataWareHouseSchema = new Schema(
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
        status: { type: String },
        ration: { type: Number },
        count: { type: Number }
      }
    ],
    computationMoment: { type: Date, default: Date.now },
    rebuildPeriod: { type: String }
  },
  { strict: false }
);

DataWareHouseSchema.index({ computationMoment: -1 });

export const dataWareHouseModel = mongoose.model('DataWareHouse', DataWareHouseSchema);
