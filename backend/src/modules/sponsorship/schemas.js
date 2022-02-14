import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Sponsorship: new Schema({
    trip: { type: Schema.Types.ObjectId, ref: 'Trip' },
    banner: String,
    link: String,
    state: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' }
  })
};
