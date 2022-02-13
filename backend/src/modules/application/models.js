import mongoose from 'mongoose';
import Schemas from './schemas.js';

class ApplicationModel {
  toClient () {

  }
}

export const Application = mongoose.model('Application', Schemas.Application.loadClass(ApplicationModel));
