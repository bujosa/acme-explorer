import { finderModel } from '../models/finderModel.js';

export const find_all_finders = (req, res) => {
  finderModel.find({}, (err, finders) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(finders);
    }
  });
};

export const find_an_finder = (req, res) => {
  finderModel.findById(req.params.finderId, (err, finder) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(finder);
    }
  });
};

export const create_an_finder = (req, res) => {
  const newFinder = new finderModel(req.body);

  newFinder.save((err, finder) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(finder);
    }
  });
};

export const update_an_finder = (req, res) => {
  finderModel.findOneAndUpdate({ _id: req.params.finderId }, req.body, { new: true }, (err, finder) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(finder);
    }
  });
};

export const delete_an_finder = (req, res) => {
  finderModel.deleteOne({ _id: req.params.finderId }, (err, finder) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Finder successfully deleted' });
    }
  });
};
