import admin from 'firebase-admin';
import { actorModel } from '../models/actorModel.js';
import { StatusCodes } from 'http-status-codes';

export const currentUser = async (idToken) => {
  const actorFromFB = await admin.auth().verifyIdToken(idToken);

  const uid = actorFromFB.uid;

  const actor = await actorModel.findOne({ email: uid });

  if (!actor) {
    return null;
  }

  return actor;
};

export const verifyUser = (authorizedRoles) => {
  return (req, res, next) => {
    const idToken = req.headers.idtoken;

    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        actorModel.findOne({ email: uid }, (err, actor) => {
          if (err) {
            res.send(err);
          }

          if (!actor) {
            res.status(StatusCodes.UNAUTHORIZED).send({ message: 'forbidden', error: err });
          }

          const authorizedRolesSet = new Set(authorizedRoles);
          const isAuth = authorizedRolesSet.has(actor.role);
          if (isAuth) {
            res.locals.idToken = idToken;
            res.locals.actor = actor;
            return next(null, actor);
          }

          res.status(StatusCodes.FORBIDDEN).send({ message: 'forbidden', error: err });
        });
      })
      .catch((err) => {
        res.status(StatusCodes.FORBIDDEN).send({ message: 'forbidden', error: err });
      });
  };
};
