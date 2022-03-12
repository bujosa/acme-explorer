import mongoose from 'mongoose';
import moment from 'moment';
import { BasicState } from '../shared/enums.js';

const { Schema } = mongoose;

const SponsorshipSchema = new Schema(
  {
    sponsor: { type: Schema.Types.ObjectId, ref: 'Actor', required: 'Please provide a sponsor.' },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: 'Please provide a trip.'
    },
    banner: { type: String, required: 'Please provide an image.' },
    link: { type: String, required: 'Please provide a link to a landing page.' },
    state: {
      type: String,
      enum: Object.values(BasicState),
      default: BasicState.INACTIVE
    },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

SponsorshipSchema.index({ sponsor: 1 });
SponsorshipSchema.index({ trip: 1 });
SponsorshipSchema.index({ state: 1 });

export const sponsorshipModel = mongoose.model('Sponsorship', SponsorshipSchema);
