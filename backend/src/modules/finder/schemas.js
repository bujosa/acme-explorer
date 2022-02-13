import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Finder: new Schema({
    name: String
  })
};
