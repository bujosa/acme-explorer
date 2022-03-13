import mongoose from 'mongoose';
import { BasicState, Roles, Languages } from '../shared/enums.js';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const ActorSchema = new Schema(
  {
    name: {
      type: String,
      required: 'You need to provide a name'
    },
    surname: {
      type: String,
      required: 'You need to provide the surname'
    },
    email: {
      type: String,
      required: 'You need to provide an email address',
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      minlength: 6,
      required: 'You need to provide a password'
    },
    phoneNumber: { type: String, default: null },
    address: { type: String, default: null },
    preferredLanguage: {
      type: String,
      enum: Object.values(Languages),
      default: Languages.ES
    },
    role: {
      type: String,
      default: Roles.EXPLORER,
      enum: Object.values(Roles)
    },
    state: {
      type: String,
      enum: Object.values(BasicState),
      default: BasicState.ACTIVE
    },
    customToken: {
      type: String
    },
    idToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

ActorSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
  }
});

ActorSchema.pre('save', function(next) {
  const actor = this;

  bcrypt.genSalt(6, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(actor.password, salt, (err, hash) => {
      if (err) return next(err);
      actor.password = hash;
      next();
    });
  });
});

ActorSchema.pre('findOneAndUpdate', function(next) {
  const actor = this._update;

  if (!actor.password) return next();

  bcrypt.genSalt(6, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(actor.password, salt, (err, hash) => {
      if (err) return next(err);
      actor.password = hash;
      next();
    });
  });
});

ActorSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export const actorModel = mongoose.model('Actor', ActorSchema);
