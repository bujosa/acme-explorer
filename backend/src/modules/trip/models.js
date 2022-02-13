import mongoose from 'mongoose';
import Schemas from './schemas.js';

class TripModel {
  toClient () {
    return {
      id: this.id,
      name: this.name
    };
  }
}

export const Trip = mongoose.model('Trip', Schemas.Trip.loadClass(TripModel));
