import { applicationModel } from '../models/applicationModel.js';

export const find_all_applications = (req, res) => {
  applicationModel.find({}, (err, applications) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(applications);
    }
  });
};

export const find_an_application = (req, res) => {
  applicationModel.findById(req.params.applicationId, (err, application) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(application);
    }
  });
};

export const create_an_application = (req, res) => {
  const newApplication = new applicationModel(req.body);

  newApplication.save((err, application) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(application);
    }
  });
};

export const update_an_application = (req, res) => {
  applicationModel.findOneAndUpdate({ _id: req.params.applicationId }, req.body, { new: true }, (err, application) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(application);
    }
  });
};

export const delete_an_application = (req, res) => {
  applicationModel.deleteOne({ _id: req.params.applicationId }, (err, application) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Application successfully deleted' });
    }
  });
};
