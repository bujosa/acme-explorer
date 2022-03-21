import m2s from 'mongoose-to-swagger';
import { configurationModel } from '../models/configurationModel.js';

export const configuration = m2s(configurationModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
