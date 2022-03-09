import m2s from 'mongoose-to-swagger';
import { actorModel } from '../models/actorModel.js';

export const actor = m2s(actorModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
