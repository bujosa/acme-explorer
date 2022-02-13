import mongoose from 'mongoose';
import Schemas from './schemas.js';

class FinderModel {
  toClient () {

  }
}

export const Finder = mongoose.model('Finder', Schemas.Finder.loadClass(FinderModel));
