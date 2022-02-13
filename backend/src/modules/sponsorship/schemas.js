import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Sponsorship: new Schema({
    name: String
  })
};
