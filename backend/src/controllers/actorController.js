import { actorModel } from '../models/actorModel.js';
import { BasicState } from '../shared/enums.js';

export const findActors = (req, res) => {
  actorModel.find({}, (err, actors) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(actors);
    }
  });
};

export const findActor = (req, res) => {
  actorModel.findById(req.params.actorId, (err, actor) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(actor);
    }
  });
};

export const createActor = (req, res) => {
  const newActor = new actorModel(req.body);

  newActor.save((err, actor) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(actor);
    }
  });
};

export const updateActor = (req, res) => {
  actorModel.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, (err, actor) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(actor);
    }
  });
};

export const deleteActor = (req, res) => {
  actorModel.deleteOne({ _id: req.params.actorId }, (err, actor) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Actor successfully deleted' });
    }
  });
};

export const banActor = (req, res) => {
  actorModel.findOneAndUpdate(
    { _id: req.params.actorId },
    { state: BasicState.INACTIVE },
    { new: true },
    (err, actor) => {
      if (err) {
        if (err.name === 'ValidationError') {
          res.status(422).send(err);
        } else {
          res.status(500).send(err);
        }
      } else {
        res.json(actor);
      }
    }
  );
};

export const unbanActor = (req, res) => {
  actorModel.findOneAndUpdate(
    { _id: req.params.actorId },
    { state: BasicState.ACTIVE },
    { new: true },
    (err, actor) => {
      if (err) {
        if (err.name === 'ValidationError') {
          res.status(422).send(err);
        } else {
          res.status(500).send(err);
        }
      } else {
        res.json(actor);
      }
    }
  );
};
