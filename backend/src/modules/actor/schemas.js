import mongoose from 'mongoose';
import moment from 'moment';
const { Schema } = mongoose;

export default {
  Actor: new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, index: true, unique: true },
    phone: String,
    address: String,
    preferredLanguage: { type: String, required: true, enum: ['en', 'es'], default: 'es' },
    role: { type: String, required: true, enum: ['explorer', 'sponsor', 'manager', 'admin'] },
    state: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
    createdAt: Number,
    updatedAt: Number
  }, {
    timestamps: { currentTime: () => moment().unix() }
  })
};
