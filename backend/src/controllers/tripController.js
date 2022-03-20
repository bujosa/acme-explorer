import { tripModel } from '../models/tripModel.js';
import { applicationModel } from '../models/applicationModel.js';
import Constants from '../shared/constants.js';
import { StatusCodes } from 'http-status-codes';

// Find one trip by id, no login required
export const findTrip = async (req, res) => {
  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Return the trip only if it is inactive or if it belongs to the logged in manager
      if (trip.state !== 'INACTIVE') {
        res.json(trip.cleanup());
      } else {
        return res.status(400).send('The trip cannot be INACTIVE');
      }
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// Find one of the trips of the logged in manager
export const findOneOfMyTrips = async (req, res) => {
  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      const { actor } = res.locals;
      if (actor.id !== trip.manager.toString()) {
        return res.status(403).send({ error: 'You are not authorized to access this trip' });
      } else {
        res.json(trip.cleanup());
      }
    }
  });
};

// Find trips of the logged in manager
export const findMyTrips = (req, res) => {
  const { actor } = res.locals;

  tripModel.find(
    {
      manager: actor.id
    },
    (err, trips) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(
          trips.map(trip => {
            return trip.cleanup();
          })
        );
      }
    }
  );
};

export const findTrips = async (req, res) => {
  // If no keyword is provided, return all trips with state=Active or state=cancelled
  let { perPage, page, sort, keyword, ...rest } = req.query;
  const [field, sortType] = sort ? sort.split(',') : Constants.defaultSort;
  const $sort = { [field]: sortType };
  perPage = perPage ? parseInt(perPage) : Constants.defaultPerPage;
  page = Math.max(0, page ?? 0);

  let query = {
    $or: [{ state: 'ACTIVE' }, { state: 'CANCELLED' }],
    ...rest,
    ...tripModel.getFinderQuery(req.query)
  };
  let projection = {};

  if (keyword) {
    $sort.score = { $meta: 'textScore' };
    projection = { score: { $meta: 'textScore' } };
  }

  try {
    const trips = await tripModel
      .find(query, projection)
      .populate('manager')
      .skip(perPage * page)
      .limit(perPage)
      .sort($sort)
      .exec();

    const count = await tripModel.countDocuments();
    res.json({
      records: trips.map(trip => trip.cleanup()),
      page: page,
      pages: count / perPage
    });
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  }
};

export const createTrip = async (req, res) => {
  console.log(Date() + ' - POST /trips');

  const { actor } = res.locals;

  var trip = {
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    pictures: req.body.pictures,
    state: 'INACTIVE',
    stages: req.body.stages,
    manager: actor.id // id of the logged user
  };

  // If startDate is after endDate, return error
  if (trip.startDate > trip.endDate) {
    return res.status(400).send({ error: 'Start date cannot be after end date' });
  }

  const newTrip = new tripModel(trip);

  newTrip.save((err, trip) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.status(201).json(trip.cleanup());
    }
  });
};

// A manager can cancel an ACTIVE trip without applications
export const cancelTrip = (req, res) => {
  console.log(Date() + ' - PATCH /trips/' + req.params.tripId + '/cancel');

  // If the new state is CANCELLED, update the reason cancelled
  // TODO: A trip can only be cancelled if it does not contain any accepted applications

  // The user must provide a cancellation reason
  if (
    req.query.reasonCancelled === '' ||
    req.query.reasonCancelled === null ||
    req.query.reasonCancelled === undefined
  ) {
    return res.status(400).send({ error: 'Please, provide a cancellation reason (reasonCancelled query parameter)' });
  }

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // If the start date is in the past, the trip cannot be cancelled
      if (trip.startDate < new Date()) {
        return res.status(400).send({ error: 'The trip cannot be cancelled because it has already started' });
      }

      if (trip.state === 'ACTIVE') {
        const { actor } = res.locals;
        if (actor.id === trip.manager.toString()) {
          // Count the number of accepted applications of the trip
          applicationModel.countDocuments({ trip: trip.id, state: 'ACCEPTED' }, (err, count) => {
            if (err) {
              res.status(500).send(err);
            } else if (count > 0) {
              return res.status(400).send({ error: 'The trip cannot be cancelled because it has applications' });
            } else {
              trip.state = 'CANCELLED';
              trip.reasonCancelled = req.query.reasonCancelled;
              trip.save((err, trip) => {
                if (err) {
                  res.status(500).send(err);
                } else {
                  res.json(trip.cleanup());
                }
              });
            }
          });
        } else {
          return res.status(403).send({ error: 'You are not authorized to cancel this trip' });
        }
      } else {
        res.status(400).send({ error: 'Trip is not ACTIVE' });
      }
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// A manager can publish an INACTIVE trip
export const publishTrip = (req, res) => {
  console.log(Date() + ' - PATCH /trips/' + req.params.tripId + '/publish');

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send('The trip must be INACTIVE');
      }

      const { actor } = res.locals;
      if (actor.id === trip.manager.toString()) {
        trip.state = 'ACTIVE';
        trip.save(err => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(trip.cleanup());
          }
        });
      } else {
        return res.status(403).send({ error: 'You are not authorized to publish this trip' });
      }
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// A manager can update an INACTIVE trip that belongs to him
export const updateTrip = (req, res) => {
  console.log(Date() + ' - PUT /trips/' + req.params.tripId);

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send('The trip must be INACTIVE');
      }

      const { actor } = res.locals;

      if (actor.id !== trip.manager.toString()) {
        return res.status(403).send({ error: 'You are not authorized to update this trip' });
      }

      // If startDate is after endDate, return error
      if (req.body.startDate > req.body.endDate) {
        return res.status(400).send({ error: 'Start date cannot be after end date' });
      }

      var update = {
        $set: {
          title: req.body.title,
          description: req.body.description,
          requirements: req.body.requirements,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          pictures: req.body.pictures,
          stages: req.body.stages
        }
      };

      tripModel.findOneAndUpdate({ _id: req.params.tripId }, update, { new: true, runValidators: true }, function(
        err,
        trip
      ) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(trip.cleanup());
        }
      });
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// Add a stage to an INACTIVE trip
export const addStage = (req, res) => {
  console.log(Date() + ' - POST /trips/' + req.params.tripId + '/stages');

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send('The trip must be INACTIVE');
      }

      const { actor } = res.locals;
      if (actor.id !== trip.manager.toString()) {
        return res.status(403).send({ error: 'You are not authorized to add a stage to this trip' });
      }

      // Get the stage from the body
      var stage = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
      };

      // Add the stage to the trip
      trip.stages.push(stage);

      // Save the trip
      trip.save(err => {
        if (err) {
          if (err.name === 'ValidationError') {
            res.status(422).send(err);
          } else {
            res.status(500).send(err);
          }
        } else {
          res.json(trip.cleanup());
        }
      });
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// Delete a stage from an INACTIVE trip
export const deleteStage = (req, res) => {
  console.log(Date() + ' - DELETE /trips/' + req.params.tripId + '/stages/' + req.params.stageId);

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send({ error: 'The trip must be INACTIVE' });
      }

      const { actor } = res.locals;
      if (actor.id !== trip.manager.toString()) {
        return res.status(403).send({ error: 'You are not authorized to remove a stage from this trip' });
      }

      // Find the stage in the list of stages with the provided id or return 404
      const stage = trip.stages.find(stage => stage._id.toString() === req.params.stageId);

      // if stage is undefined, return 404
      if (!stage) {
        return res.status(404).send({ error: 'Stage not found' });
      }

      // Remove the stage from the list of stages
      trip.stages = trip.stages.filter(stage => stage._id.toString() !== req.params.stageId);
      // Save the trip
      trip.save(err => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(trip.cleanup());
        }
      });
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// A manager can delete an INACTIVE trip that belongs to him
export const deleteTrip = (req, res) => {
  console.log(Date() + ' - DELETE /trips/' + req.params.tripId);

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send({ error: 'The trip must be INACTIVE' });
      }

      const { actor } = res.locals;
      if (actor.id !== trip.manager.toString()) {
        return res.status(403).send({ error: 'You are not authorized to delete this trip' });
      }

      tripModel.deleteOne({ _id: req.params.tripId }, (err, trip) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(204).json({ message: 'Trip successfully deleted' });
        }
      });
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};
