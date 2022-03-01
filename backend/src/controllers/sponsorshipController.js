import { StatusCodes } from 'http-status-codes';
import { sponsorshipModel } from '../models/sponsorshipModel.js';
import { RecordNotFound } from '../shared/exceptions.js';
import { BasicState } from '../shared/enums.js';

export const findAllSponsorships = async (req, res, next) => {
  try {
    const sponsorships = await sponsorshipModel.find({});
    res.json(sponsorships);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const findSponsorship = async (req, res, next) => {
  try {
    const sponsorship = await sponsorshipModel.findById(req.params.sponsorshipId);

    if (!sponsorship) {
      return next(new RecordNotFound());
    }

    res.json(sponsorship);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const createSponsorship = async (req, res) => {
  const newSponsorship = new sponsorshipModel(req.body);

  try {
    const sponsorship = await newSponsorship.save();
    res.status(StatusCodes.CREATED).json(sponsorship);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const updateSponsorship = async (req, res) => {
  try {
    const sponsorship = await sponsorshipModel.findOneAndUpdate({ _id: req.params.sponsorshipId }, req.body, {
      new: true
    });
    res.json(sponsorship);
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
    await sponsorshipModel.deleteOne({ _id: req.params.sponsorshipId });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const paySponsorship = async (req, res) => {
  try {
    const isPaymentApproved = true; // Payment logic and connection with Paypal

    if (isPaymentApproved) {
      const activeSponsorship = await sponsorshipModel.findOneAndUpdate(
        { _id: req.params.sponsorshipId },
        { state: BasicState.ACTIVE }
      );
      res.json(activeSponsorship);
    } else {
      res.status(StatusCodes.SERVICE_UNAVAILABLE).send({ message: 'Error processing payment.' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};
