import mongoose from 'mongoose';
import Schemas from './schemas.js';

class TripModel {
  toClient () {
    return {
      id: this.id,
      ticker: this.ticker,
      description: this.description,
      price: this.price,
      requirements: this.requirements,
      startDate: this.startDate,
      endDate: this.endDate,
      pictures: this.pictures,
      state: this.state,
      reasonCanceled: this.reasonCanceled,
      manager: this.manager,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export const Trip = mongoose.model('Trip', Schemas.Trip.loadClass(TripModel));
