import { StatusCodes } from 'http-status-codes';
import { applicationModel } from '../models/applicationModel.js';
import { ApplicationState } from '../shared/enums.js';
import { RecordNotFound } from '../shared/exceptions.js';

export const findAllApplications = async (req, res, next) => {
  try {
    const applications = await applicationModel
      .find({})
      .populate(['trip', { path: 'explorer', model: 'Actors' }])
      .sort('state');
    res.json(applications);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const findApplication = async (req, res, next) => {
  try {
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
    }

    res.json(application);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const createApplication = async (req, res) => {
  const newApplication = new applicationModel(req.body);

  try {
    const application = await newApplication.save();
    res.status(StatusCodes.CREATED).json(application);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(error);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
};

export const updateApplication = async (req, res) => {
  try {
    const application = await applicationModel.findOneAndUpdate({ _id: req.params.applicationId }, req.body, {
      new: true
    });
    res.json(application);
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
    await applicationModel.deleteOne({ _id: req.params.applicationId });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const acceptApplication = async (req, res, next) => {
  try {
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
    }

    if (application.state !== ApplicationState.PENDING) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be PENDING.');
    }

    const acceptedApplication = await applicationModel.findOneAndUpdate(
      { _id: req.params.applicationId },
      { state: ApplicationState.DUE }
    );

    res.json(acceptedApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const rejectApplication = async (req, res, next) => {
  try {
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
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
      }
    );

    res.json(rejectedApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const cancelApplication = async (req, res, next) => {
  try {
    // TODO: only the actor that created the application should cancel it
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
    }

    if (!(application.state === ApplicationState.PENDING || application.state === ApplicationState.ACCEPTED)) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be PENDING or ACCEPTED.');
    }

    const cancelledApplication = await applicationModel.findOneAndUpdate(
      { _id: req.params.applicationId },
      { state: ApplicationState.CANCELLED }
    );
    res.json(cancelledApplication);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const payApplication = async (req, res, next) => {
  try {
    const application = await applicationModel.findById(req.params.applicationId);

    if (!application) {
      return next(new RecordNotFound());
    }

    if (application.state !== ApplicationState.DUE) {
      return res.status(StatusCodes.BAD_REQUEST).send('The application must be DUE.');
    }

    const isPaymentApproved = true; // Payment logic and connection with Paypal

    if (isPaymentApproved) {
      const acceptedApplication = await applicationModel.findOneAndUpdate(
        { _id: req.params.applicationId },
        { state: ApplicationState.ACCEPTED }
      );
      res.json(acceptedApplication);
    } else {
      res.status(StatusCodes.SERVICE_UNAVAILABLE).send({ message: 'Error processing payment.' });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};
