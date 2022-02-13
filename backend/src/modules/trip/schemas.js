import mongoose from 'mongoose';
const { Schema } = mongoose;

export default {
  Trip: new Schema({
    name: String
  })
};
