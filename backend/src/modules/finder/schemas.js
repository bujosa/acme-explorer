import mongoose from 'mongoose';
import moment from 'moment';
const { Schema } = mongoose;

export default {
  Finder: new Schema({
    keyword: String,
    minPrice: Number,
    maxPrice: Number,
    startDate: Number,
    endDate: Number,
    createdAt: Number,
    updatedAt: Number
  }, {
    timestamps: { currentTime: () => moment().unix() }
  })
};
