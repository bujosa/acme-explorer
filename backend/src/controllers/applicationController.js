import { StatusCodes } from 'http-status-codes';
import { applicationModel } from '../models/applicationModel.js';
import { tripModel } from '../models/tripModel.js';
import { actorModel } from '../models/actorModel.js';
import { ApplicationState } from '../shared/enums.js';
import { RecordNotFound } from '../shared/exceptions.js';
import { Roles } from '../shared/enums.js';

export const findAllApplications = async (req, res, next) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (actor.role !== Roles.ADMIN) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    const applications = await applicationModel
      .find({})
      .populate(['trip', 'explorer'])
      .sort('state');
    return res.json(applications);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const createApplication = async (req, res) => {
  try {
    const { actor } = res.locals;
    const { role } = await actorModel.findById(req.body.explorer);

    if (actor.role !== Roles.ADMIN) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    if (role !== Roles.EXPLORER) {
      return res.status(StatusCodes.BAD_REQUEST).send('The provided actor must be an explorer');
    }

    const newApplication = new applicationModel(req.body);
    const application = await newApplication.save();
    return res.status(StatusCodes.CREATED).json(application);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const applyToTrip = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (Object.keys(req.body).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).send('You need to send a trip id and some optional comments.');
    }

    const { startDate, state: tripStage } = await tripModel.findById(req.body.trip);

    if (actor.role !== Roles.EXPLORER) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }

    if (startDate < new Date()) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send("Can't apply to a trip in the past.");
    }

    if (tripStage !== 'ACTIVE') {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You can only apply to active trips');
    }

    const newApplication = new applicationModel({
      ...req.body,
      explorer: actor._id,
      state: 'pending',
      reasonRejected: null
    });
    const application = await newApplication.save();
    return res.status(StatusCodes.CREATED).json(application);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const findApplication = async (req, res, next) => {
  try {
    const application = await applicationModel.findById(req.params.applicationId);
    const { actor } = res.locals;

    if (!application) {
      return next(new RecordNotFound());
    }

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === application.explorer.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    return res.json(application);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const findMyApplications = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (actor.role === Roles.EXPLORER) {
      const applications = await applicationModel
        .find({ explorer: actor._id })
        .populate(['trip'])
        .sort('state');
      return res.json(applications);
    }

    if (actor.role === Roles.MANAGER) {
      const applications = await applicationModel.aggregate([
        {
          $lookup: {
            from: 'trips',
            localField: 'trip',
            foreignField: '_id',
            as: 'trip_info'
          }
        },
        {
          $unwind: '$trip_info'
        },
        {
          $match: {
            'trip_info.manager': actor._id
          }
        }
      ]);

      return res.json(applications);
    }

    return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const updateApplication = async (req, res) => {
  try {
    const { explorer } = await applicationModel.findById(req.params.applicationId);
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === explorer.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    if (actor.role !== Roles.ADMIN) {
      delete req.body.state;
      delete req.body.reasonRejected;
    }

    const application = await applicationModel.findOneAndUpdate({ _id: req.params.applicationId }, req.body, {
      new: true
    });

    return res.json(application);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { explorer } = await applicationModel.findById(req.params.applicationId);
    const { actor } = res.locals;

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === explorer.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    await applicationModel.deleteOne({ _id: req.params.applicationId });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const acceptApplication = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const application = await applicationModel.findById(req.params.applicationId).populate('trip');

    if (!application) {
      return next(new RecordNotFound());
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === application.trip.manager.toString())) {
      return res.status(StatusCodes.FORBIDDEN).send('You do not have access.');
    }

    if (application.state !== ApplicationState.PENDING) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be PENDING.');
    }

    const acceptedApplication = await applicationModel.findOneAndUpdate(
      { _id: req.params.applicationId },
      { state: ApplicationState.DUE },
      {
        new: true
      }
    );

    return res.json(acceptedApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const application = await applicationModel.findById(req.params.applicationId).populate('trip');

    if (!application) {
      return next(new RecordNotFound());
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === application.trip.manager.toString())) {
      return res.status(StatusCodes.FORBIDDEN).send('You do not have access.');
    }

    if (application.state !== ApplicationState.PENDING) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be PENDING.');
    }

    if (!req.body.reasonRejected) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('You must provide a rejection reason: "reasonRejected": "example"');
    }

    const rejectedApplication = await applicationModel.findOneAndUpdate(
      { _id: req.params.applicationId },
      {
        state: ApplicationState.REJECTED,
        reasonRejected: req.body.reasonRejected
      },
      {
        new: true
      }
    );

    return res.json(rejectedApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const cancelApplication = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const application = await applicationModel.findById(req.params.applicationId);

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === application.explorer.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    if (!application) {
      return next(new RecordNotFound());
    }

    if (!(application.state === ApplicationState.PENDING || application.state === ApplicationState.ACCEPTED)) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be PENDING or ACCEPTED.');
    }

    const cancelledApplication = await applicationModel.findOneAndUpdate(
      { _id: req.params.applicationId },
      { state: ApplicationState.CANCELLED },
      {
        new: true
      }
    );
    return res.json(cancelledApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const payApplication = async (req, res, next) => {
  try {
    const { actor } = res.locals;
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
    }

    if (application.state !== ApplicationState.DUE) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be DUE.');
    }

    if (!actor) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Not authorized.');
    }

    if (!(actor.role === Roles.ADMIN || actor._id.toString() === application.explorer.toString())) {
      return res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation.');
    }

    const isPaymentApproved = true; // Payment logic and connection with Paypal

    if (isPaymentApproved) {
      const acceptedApplication = await applicationModel.findOneAndUpdate(
        { _id: req.params.applicationId },
        { state: ApplicationState.ACCEPTED },
        {
          new: true
        }
      );
      return res.json(acceptedApplication);
    }

    return res.status(StatusCodes.SERVICE_UNAVAILABLE).send({ message: 'Error processing payment.' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};
