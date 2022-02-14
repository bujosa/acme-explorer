import mongoose from 'mongoose';
import Schemas from './schemas.js';
import Constants from './constants.js';
import { SelectedNameUnavailable, PasswordLengthToShort, UnmatchedPassword } from './exceptions.js';

class ActorModel {
  static async new ({ password, password_confirm: passwordConfirm, ...payload }) {
    const user = new Actor(payload);
    return user.save();
  }

  static async validate (form) {
    if (form.email != null) {
      const existingUser = await Actor.findOne({ email: form.email });
      if (existingUser && existingUser.toClient().email === form.email) {
        return new SelectedNameUnavailable({ email: form.email });
      }
    }

    if (form.password != null && form.password.length < Constants.minPasswordLength) {
      return new PasswordLengthToShort();
    }

    if (form.password !== form.password_confirm) {
      return new UnmatchedPassword();
    }
  }

  isAdmin () {
    return this.role === 'admin';
  }

  isActive () {
    return this.state === 'active';
  }

  toClient () {
    return {
      id: this._id,
      name: this.name,
      surname: this.surname,
      email: this.email,
      phone: this.phone,
      address: this.address,
      preferredLanguage: this.preferredLanguage,
      role: this.role,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export const Actor = mongoose.model('Actor', Schemas.Actor.loadClass(ActorModel));
