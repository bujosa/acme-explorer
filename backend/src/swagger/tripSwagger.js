import m2s from 'mongoose-to-swagger';
import { tripModel } from '../models/tripModel.js';

export const trip = m2s(tripModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
