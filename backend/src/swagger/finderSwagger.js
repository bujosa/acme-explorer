import m2s from 'mongoose-to-swagger';
import { finderModel } from '../models/finderModel.js';

export const finder = m2s(finderModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
