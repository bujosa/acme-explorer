import { StatusCodes } from 'http-status-codes';
import { sponsorshipModel } from '../models/sponsorshipModel.js';
import { actorModel } from '../models/actorModel.js';
import { configurationModel } from '../models/configurationModel.js';
import { RecordNotFound } from '../shared/exceptions.js';
import { BasicState, Roles } from '../shared/enums.js';

export const findAllSponsorships = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (actor.role !== Roles.ADMIN) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    const sponsorships = await sponsorshipModel.find({});
    return res.json(sponsorships);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const createSponsorship = async (req, res) => {
  try {
    const { actor } = res.locals;

    const { role } = await actorModel.findById(req.body.sponsor);

    if (!(actor.role === Roles.SPONSOR || actor.role === Roles.ADMIN)) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    if (role !== Roles.SPONSOR) {
      return res.status(StatusCodes.BAD_REQUEST).send('The provided actor must be an sponsor');
    }

    const newSponsorship = new sponsorshipModel(req.body);
    const sponsorship = await newSponsorship.save();
    return res.status(StatusCodes.CREATED).json(sponsorship);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const findMySponsorships = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (!(actor.role === Roles.SPONSOR || actor.role === Roles.ADMIN)) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    const sponsorships = await sponsorshipModel.find({ sponsor: actor._id });
    return res.json(sponsorships);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const findSponsorship = async (req, res, next) => {
  try {
    const sponsorship = await sponsorshipModel.findById(req.params.sponsorshipId);
    const { actor } = res.locals;

    if (!sponsorship) {
      return next(new RecordNotFound());
    }

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === sponsorship.sponsor.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    return res.json(sponsorship);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const updateSponsorship = async (req, res) => {
  try {
    const { sponsor } = await sponsorshipModel.findById(req.params.sponsorshipId);
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === sponsor.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    const sponsorship = await sponsorshipModel.findOneAndUpdate({ _id: req.params.sponsorshipId }, req.body, {
      new: true
    });
    return res.json(sponsorship);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const deleteSponsorship = async (req, res) => {
  try {
    const { sponsor } = await sponsorshipModel.findById(req.params.sponsorshipId);
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === sponsor.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    await sponsorshipModel.deleteOne({ _id: req.params.sponsorshipId });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const paySponsorship = async (req, res) => {
  try {
    const { sponsor } = await sponsorshipModel.findById(req.params.sponsorshipId);
    const { actor } = res.locals;
    const isPaymentApproved = true; // Payment logic and connection with Paypal

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === sponsor.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    if (isPaymentApproved) {
      const activeSponsorship = await sponsorshipModel.findOneAndUpdate(
        { _id: req.params.sponsorshipId },
        { state: BasicState.ACTIVE }
      );
      return res.json(activeSponsorship);
    }

    return res.status(StatusCodes.SERVICE_UNAVAILABLE).send({ message: 'Error processing payment.' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const configureFlatRate = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (actor.role !== Roles.ADMIN) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    const result = await configurationModel.findOneAndUpdate(
      { key: 'sponsorshipFlatRate' },
      { value: parseFloat(req.params.newFlatRate) },
      { new: true }
    );

    return res.json(result);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};
