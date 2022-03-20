import { actorModel } from '../models/actorModel.js';
import { BasicState } from '../shared/enums.js';
import admin from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { Roles } from '../shared/enums.js';
import { RecordNotFound } from '../shared/exceptions.js';

export const findActors = async (req, res) => {
  try {
    const actors = await actorModel.find({});
    res.json(actors);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const findActor = async (req, res, next) => {
  try {
    const actor = await actorModel.findById(req.params.actorId);
    
     if (!actor) {
      return next(new RecordNotFound());
    }

    res.json(actor);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
};

export const createActor = (req, res) => {
  const newActor = new actorModel(req.body);

  newActor.save((err, actor) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(err);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
      }
    } else {
      res.json(actor);
    }
  });
};

export const updateActor = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      res.status(StatusCodes.UNAUTHORIZED).send('Not authorized');
    } else if (actor.role === Roles.ADMIN || actor.id === req.params.actorId) {
      const result = await actorModel.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true });
      res.json(result);
    } else {
      res.status(StatusCodes.METHOD_NOT_ALLOWED).send('You cannot perform this operation');
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(err);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
  }
};

export const deleteActor = async (req, res) => {
  try {
    await actorModel.deleteOne({ _id: req.params.actorId });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
};

export const banActor = (req, res) => {
  actorModel.findOneAndUpdate(
    { _id: req.params.actorId },
    { state: BasicState.INACTIVE },
    { new: true },
    (err, actor) => {
      if (err) {
        if (err.name === 'ValidationError') {
          res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(err);
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
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
          res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(err);
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
        }
      } else {
        res.json(actor);
      }
    }
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  actorModel.findOne({ email }, (err, actor) => {
    if (err) {
      res.send(err);
    } else if (!actor) {
      res.status(StatusCodes.UNAUTHORIZED).send({ message: "User email doesn't exist" });
    } else {
      // Make sure the password is correct
      actor.verifyPassword(password, async (err, isMatch) => {
        if (err) {
          return res.send(err);
        }
        if (!isMatch) {
          return res.status(StatusCodes.UNAUTHORIZED).send({ message: 'Password is incorrect. Please review' });
        }
        try {
          actor.customToken = await admin.auth().createCustomToken(actor.email);
          return res.json(actor);
        } catch (error) {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }
      });
    }
  });
};

export const register = async (req, res) => {
  delete req.body.role;
  delete req.body.state;
  delete req.body.customToken;
  delete req.body.idToken;

  const newActor = new actorModel(req.body);

  newActor.save((err, actor) => {
    if (err) {
      if (err.name === 'ValidationError') {
        res.status(StatusCodes.UNPROCESSABLE_ENTITY).send(err);
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
      }
    } else {
      res.json(actor);
    }
  });
};

export const self = async (req, res) => {
  try {
    const { actor } = res.locals;

    if (!actor) {
      res.status(StatusCodes.NOT_FOUND).send('Not found');
    }

    res.send(actor);
  } catch (err) {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(err);
  }
};
