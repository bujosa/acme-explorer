import mongoose from 'mongoose';
import Schemas from './schemas.js';

class FinderModel {
  toClient () {
    return {
      id: this._id,
      keyword: this.keyword,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      startDate: this.startDate,
      endDate: this.endDate
    };
  }
}

export const Finder = mongoose.model('Finder', Schemas.Finder.loadClass(FinderModel));
