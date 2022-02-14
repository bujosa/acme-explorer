import mongoose from 'mongoose';
import moment from 'moment';
const { Schema } = mongoose;

export default {
  Application: new Schema({
    explorer: { type: Schema.Types.ObjectId, ref: 'Actor' },
    state: { type: String, required: true, enum: ['pending', 'rejected', 'due', 'accepted'], default: 'pending' },
    comment: String,
    rejectedReason: String,
    isPaid: { type: Boolean, default: false },
    createdAt: Number,
    updatedAt: Number
  }, {
    timestamps: { currentTime: () => moment().unix() }
  })
};
