import mongoose from 'mongoose';

const { Schema } = mongoose;

const ConfigurationSchema = new Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

ConfigurationSchema.statics.getRedisConfig = async function () {
  const configurations = (await this.find({ key: { $in: ['maxResultsFinder', 'timeCachedFinder'] } })) || [];
  return configurations.reduce((a, config) => ({ ...a, [config.key]: config.value }), {}) || {};
};

export const configurationModel = mongoose.model('Configurations', ConfigurationSchema);
