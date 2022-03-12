import mongoose from 'mongoose';
const { Schema } = mongoose;

import dateFormat from 'dateformat';
import { customAlphabet } from 'nanoid';
const idGenerator = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);

const StageSchema = new Schema({
  title: {
    type: String,
    required: 'Kindly enter the title of the stage'
  },
  description: {
    type: String,
    required: 'Kindly enter the description of the stage'
  },
  price: {
    type: Number,
    min: 0,
    required: 'Kindly enter the price of the stage'
  }
});

const State = ['ACTIVE', 'INACTIVE', 'CANCELLED'];

// TODO: Define indexes
// TODO: strict: false ???
const TripSchema = new Schema({
  ticker: {
    type: String,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{6}-[A-Z]{4}$/.test(v);
      },
      message: 'ticker is not valid, Pattern is: "220527-ABCD"'
    }
  },
  title: {
    type: String,
    required: 'Title is required'
  },
  description: {
    type: String,
    required: 'Description is required'
  },
  price: {
    type: Number,
    min: 0
  },
  requirements: {
    type: [String],
    default: []
  },
  // startDate must be in the future
  startDate: {
    type: Date,
    required: 'Start date is required',
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: 'End date is required',
    validate: {
      validator: function(v) {
        return v > this.startDate; // StartDate before endDate
      },
      message: 'End date must be after start date'
    }
  },
  pictures: {
    type: [String],
    default: []
  },
  state: {
    type: String,
    required: true,
    enum: State,
    default: 'INACTIVE'
  },
  reasonCancelled: {
    type: String
  },
  stages: {
    type: [StageSchema],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one stage is required'
    }
  },
  manager: {
    // TODO: It must belong to an actor of type manager
    type: Schema.Types.ObjectId,
    ref: 'Actor',
    required: 'Please provide a manager.'
  }
});

// Indexes
// Create a text index for ticker, title and description with weights 10, 5 and 2
TripSchema.index(
  {
    state: 1,
    ticker: 'text',
    title: 'text',
    description: 'text'
  },
  {
    weights: {
      ticker: 10,
      title: 5,
      description: 2
    },
    name: 'TextIndexTrip'
  }
);

TripSchema.index({
  managerId: 1
});

// Cleanup method
TripSchema.methods.cleanup = function() {
  return {
    id: this._id,
    ticker: this.ticker,
    title: this.title,
    description: this.description,
    price: this.price,
    requirements: this.requirements,
    startDate: dateFormat(this.startDate, 'dd/mm/yyyy'),
    endDate: dateFormat(this.endDate, 'dd/mm/yyyy'),
    pictures: this.pictures,
    state: this.state,
    reasonCancelled: this.reasonCancelled,
    stages: this.stages.map(function(e) {
      return {
        id: e._id,
        title: e.title,
        description: e.description,
        price: e.price
      };
    }),
    manager: this.manager
  };
};

// Generate ticker and compute total price
TripSchema.pre('save', function(callback) {
  // Ticker
  const newTrip = this;
  const day = dateFormat(new Date(), 'yymmdd');

  const generatedTicker = [day, idGenerator()].join('-');
  newTrip.ticker = generatedTicker;

  // Total price
  const initialValue = 0;
  const totalPrice = this.stages
    .map((e) => {
      return e.price;
    })
    .reduce((previousValue, currentValue) => previousValue + currentValue, initialValue);
  newTrip.price = totalPrice;

  callback();
});

// Compute total price before update
TripSchema.pre('findOneAndUpdate', function(next) {
  // Total price

  // If stages is not undefined
  if (this.getUpdate().stages !== undefined) {
    const newTrip = this._update.$set;
    const initialValue = 0;
    const totalPrice = this._update.$set.stages
      .map((e) => {
        return e.price;
      })
      .reduce((previousValue, currentValue) => previousValue + currentValue, initialValue);

    newTrip.price = totalPrice;
  }

  next();
});

export const tripModel = mongoose.model('Trip', TripSchema);
export const stageModel = mongoose.model('Stage', StageSchema);
