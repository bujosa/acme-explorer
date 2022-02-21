import mongoose from 'mongoose';
import moment from 'moment';

const { Schema } = mongoose;

const SponsorshipSchema = new Schema(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      default: null
    },
    banner: { type: String, default: null },
    link: { type: String, default: null },
    state: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

export const sponsorshipModel = mongoose.model('Sponsorships', SponsorshipSchema);
