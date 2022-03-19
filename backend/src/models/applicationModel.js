import mongoose from 'mongoose';
import moment from 'moment';
import { ApplicationState } from '../shared/enums.js';

const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    explorer: { type: Schema.Types.ObjectId, ref: 'Actor', required: 'Please provide a explorer.' },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: 'Please provide a trip.' },
    comments: [String],
    state: {
      type: String,
      enum: Object.values(ApplicationState),
      default: ApplicationState.PENDING
    },
    reasonRejected: { type: String, default: null }
  },
  {
    timestamps: true
  }
);

ApplicationSchema.index({ explorer: 1 });
ApplicationSchema.index({ trip: 1 });
ApplicationSchema.index({ state: 1 });

export const applicationModel = mongoose.model('Application', ApplicationSchema);
