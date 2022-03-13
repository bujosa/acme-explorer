import m2s from 'mongoose-to-swagger';
import { actorModel } from '../models/actorModel.js';

export const register = m2s(actorModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt', 'role', 'state', 'customToken', 'idToken']
});
