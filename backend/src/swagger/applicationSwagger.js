import m2s from 'mongoose-to-swagger';
import { applicationModel } from '../models/applicationModel.js';

export const application = m2s(applicationModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
