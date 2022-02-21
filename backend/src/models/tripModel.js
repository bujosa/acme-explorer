import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

const TripSchema = new Schema(
  {
    ticker: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    price: { type: Number, default: null },
    requirements: { type: [String], required: true },
    startDate: { type: Number, required: true },
    endDate: { type: Number, required: true },
    pictures: [String],
    state: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'canceled'],
      default: 'inactive'
    },
    reasonCanceled: {
      type: String,
      default: null
    },
    stages: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        password: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
    manager: { type: Schema.Types.ObjectId, ref: 'Actor', default: null },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

TripSchema.index({ ticker: 'text', title: 'text', description: 'text' });

// TODO: Generate ticker
TripSchema.pre('save', (callback) => {
  callback();
});

export const tripModel = mongoose.model('Trips', TripSchema);
