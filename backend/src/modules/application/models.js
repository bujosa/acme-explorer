import mongoose from 'mongoose';
import Schemas from './schemas.js';

class ApplicationModel {
  toClient () {
    return {
      id: this._id,
      explorer: this.explorer,
      state: this.state,
      comment: this.comment,
      rejectedReason: this.rejectedReason,
      isPaid: this.isPaid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export const Application = mongoose.model('Application', Schemas.Application.loadClass(ApplicationModel));
