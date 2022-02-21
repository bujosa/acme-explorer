import { sponsorshipModel } from '../models/sponsorshipModel.js';

export const find_all_sponsorships = (req, res) => {
  sponsorshipModel.find({}, (err, sponsorships) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(sponsorships);
    }
  });
};

export const find_an_sponsorship = (req, res) => {
  sponsorshipModel.findById(req.params.sponsorshipId, (err, sponsorship) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(sponsorship);
    }
  });
};

export const create_an_sponsorship = (req, res) => {
  const newSponsorship = new sponsorshipModel(req.body);

  newSponsorship.save((err, sponsorship) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(sponsorship);
    }
  });
};

export const update_an_sponsorship = (req, res) => {
  sponsorshipModel.findOneAndUpdate({ _id: req.params.sponsorshipId }, req.body, { new: true }, (err, sponsorship) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(422).send(err);
      } else {
        res.status(500).send(err);
      }
    } else {
      res.json(sponsorship);
    }
  });
};

export const delete_an_sponsorship = (req, res) => {
  sponsorshipModel.deleteOne({ _id: req.params.sponsorshipId }, (err, sponsorship) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: 'Sponsorship successfully deleted' });
    }
  });
};
