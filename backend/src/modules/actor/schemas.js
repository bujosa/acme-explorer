import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Actor: new Schema({
    name: String
  })
};
