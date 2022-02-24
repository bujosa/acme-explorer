import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

const FinderSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    actor: { type: Schema.Types.ObjectId, ref: 'Actor', required: true, index: true },
    keyword: {
      type: String,
      default: null
    },
    minPrice: {
      type: Number,
      default: null
    },
    maxPrice: {
      type: Number,
      default: null
    },
    startDate: {
      type: Number,
      default: null
    },
    endDate: {
      type: Number,
      default: null
    },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

export const finderModel = mongoose.model('Finders', FinderSchema);
