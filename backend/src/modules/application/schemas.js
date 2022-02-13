import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Application: new Schema({
    name: String
  })
};
