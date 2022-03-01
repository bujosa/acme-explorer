import mongoose from 'mongoose';
import moment from 'moment';
import { BasicState, Roles, Languages } from '../shared/enums.js';

const { Schema } = mongoose;

const ActorSchema = new Schema(
  {
    name: {
      type: String,
      required: 'You need to provide a name'
    },
    surname: {
      type: String,
      required: 'You need to provide the surname'
    },
    email: {
      type: String,
      required: 'You need to provide a email address',
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: { type: String, default: null },
    address: { type: String, default: null },
    preferredLanguage: {
      type: String,
      enum: Object.values(Languages),
      default: Languages.ES
    },
    role: {
      type: String,
      default: Roles.EXPLORER,
      enum: Object.values(Roles)
    },
    state: {
      type: String,
      enum: Object.values(BasicState),
      default: BasicState.ACTIVE
    },
    createdAt: Number,
    updatedAt: Number
  },
  {
    timestamps: { currentTime: () => moment().unix() }
  }
);

export const actorModel = mongoose.model('Actors', ActorSchema);
