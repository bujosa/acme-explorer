import mongoose from 'mongoose';
import Schemas from './schemas.js';

class ActorModel {
  toClient () {

  }
}

export const Actor = mongoose.model('Actor', Schemas.Actor.loadClass(ActorModel));
