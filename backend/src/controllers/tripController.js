import { tripModel } from '../models/tripModel.js';

export const find_all_trips = (req, res) => {
  tripModel.find({}, (err, trips) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(
        trips.map((trip) => {
          return trip.cleanup();
        })
      );
    }
  });
};

// Find one trip by id
// TODO: If trip is INACTIVE, only its owner (manager) can see it
export const find_trip = (req, res) => {
  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      res.json(trip.cleanup());
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// Find trips of the logged in manager
// TODO: Session management
export const find_my_trips = (req, res) => {
  tripModel.find(
    {
      // manager: req.params.managerId
    },
    (err, trips) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(
          trips.map((trip) => {
            return trip.cleanup();
          })
        );
      }
    }
  );
};

export const find_trips_by_keyword = (req, res) => {
  // If no keyword is provided, return all trips with state=Active or state=cancelled
  const keyword = req.query.keyword;

  let query = {
    $or: [{ state: 'ACTIVE' }, { state: 'CANCELLED' }]
  };

  let sort = null;
  // if keyword is not null, undefined or empty
  if (keyword !== null && keyword !== undefined && keyword !== '') {
    query.$text = { $search: keyword };
    (query = query), { score: { $meta: 'textScore' } };

    sort = { sort: { score: { $meta: 'textScore' } } };
  }

  tripModel.find(query, sort, (err, trips) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(
        trips.map((trip) => {
          return trip.cleanup();
        })
      );
    }
  });
};

export const create_trip = (req, res) => {
  console.log(Date() + ' - POST /trips');
  // TODO: Check credentials (manager)

  var trip = {
    title: req.body.title,
    description: req.body.description,
    requirements: req.body.requirements,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    pictures: req.body.pictures,
    state: 'INACTIVE',
    stages: req.body.stages,
    manager: req.body.manager
  };

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

// A manager can update an INACTIVE trip that belongs to him
export const update_trip = (req, res) => {
  console.log(Date() + ' - PUT /trips/' + req.params.tripId);
  // TODO: Check credentials (manager)
  // TODO: Check that the trip belongs to the logged manager
  // TODO: Check that the object id fulfills the regex (and return 404 if not)

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send('The trip must be INACTIVE');
      }

      var update = {
        $set: {
          title: req.body.title,
          description: req.body.description,
          requirements: req.body.requirements,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          pictures: req.body.pictures,
          stages: req.body.stages,
          state: req.body.state
        }
      };

      // If the new state is CANCELLED, update the reason cancelled
      // TODO: A trip can only be cancelled if it does not contain any accepted applications
      if (req.body.state === 'CANCELLED') {
        update.$set.reasonCancelled = req.body.reasonCancelled;
        if (
          update.$set.reasonCancelled === '' ||
          update.$set.reasonCancelled === null ||
          update.$set.reasonCancelled === undefined
        ) {
          return res.status(400).send('The cancel reason  cannot be empty');
        }
      }

      tripModel.findOneAndUpdate(
        { _id: req.params.tripId },
        update,
        { new: true, runValidators: true },
        function(err, trip) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(trip.cleanup());
          }
        }
      );
    } else {
      res.status(404).send({ error: 'Trip not found' });
    }
  });
};

// A manager can delete an INACTIVE trip that belongs to him
export const delete_trip = (req, res) => {
  // TODO: Check that the user is logged in as a manager
  // TODO: Check that the trip belongs to the logged manager
  // TODO: Check that the object id fulfills the regex (and return 404 if not)
  console.log(Date() + ' - DELETE /trips/' + req.params.tripId);

  tripModel.findById(req.params.tripId, (err, trip) => {
    if (err) {
      res.status(500).send(err);
    } else if (trip) {
      // Check that the trip is INACTIVE
      if (trip.state !== 'INACTIVE') {
        return res.status(400).send('The trip must be INACTIVE');
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
