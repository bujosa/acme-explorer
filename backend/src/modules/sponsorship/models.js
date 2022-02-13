import mongoose from 'mongoose';
import Schemas from './schemas.js';

class SponsorshipModel {
  toClient () {

  }
}

export const Sponsorship = mongoose.model('Sponsorship', Schemas.Sponsorship.loadClass(SponsorshipModel));
