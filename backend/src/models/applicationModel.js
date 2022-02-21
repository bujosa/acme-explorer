import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    explorer: { type: Schema.Types.ObjectId, ref: 'Actor', default: null },
    state: {
      type: String,
      required: true,
      enum: ['pending', 'rejected', 'due', 'accepted'],
      default: 'pending'
    },
    rejectedReason: { type: String, default: null },
    rejectedReason: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

export const applicationModel = mongoose.model('Applications', ApplicationSchema);
