import mongoose from 'mongoose';
import moment from 'moment';
const { Schema } = mongoose;

const StageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  password: { type: String, required: true },
  price: { type: Number, required: true }
});

export default {
  Trip: new Schema({
    ticker: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    price: Number,
    requirements: { type: [String], required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    pictures: [String],
    state: { type: String, required: true, enum: ['active', 'inactive', 'canceled'], default: 'inactive' },
    reasonCanceled: String,
    stages: [StageSchema],
    manager: { type: Schema.Types.ObjectId, ref: 'Actor' },
    createdAt: Number,
    updatedAt: Number
  }, {
    timestamps: { currentTime: () => moment().unix() }
  })
};
