import m2s from 'mongoose-to-swagger';
import { sponsorshipModel } from '../models/sponsorshipModel.js';

export const sponsorship = m2s(sponsorshipModel, {
  omitFields: ['_id', 'createdAt', 'updatedAt']
});
