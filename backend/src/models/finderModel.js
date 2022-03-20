import mongoose from 'mongoose';

const { Schema } = mongoose;

const FinderSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    actor: { type: Schema.Types.ObjectId, ref: 'Actor', required: true, index: true },
    keyword: {
      type: String,
      default: null
    },
    minPrice: {
      type: Number,
      default: null
    },
    maxPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function(v) {
          return this.minPrice <= v;
        },
        message: 'Min price must be less than max price'
      }
    },
    startDate: {
      type: Number,
      default: null
    },
    endDate: {
      type: Number,
      default: null,
      validate: {
        validator: function(v) {
          return this.startDate <= v;
        },
        message: 'Start date must be less than end date'
      }
    }
  },
  {
    timestamps: true
  }
);

FinderSchema.methods.toRedis = function() {
  return {
    keyword: this.keyword,
    minPrice: this.minPrice,
    maxPrice: this.maxPrice,
    startDate: this.startDate,
    endDate: this.endDate
  };
};

export const finderModel = mongoose.model('Finder', FinderSchema);
