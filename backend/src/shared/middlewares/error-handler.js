import { StatusCodes } from 'http-status-codes';
import { BaseError } from '../errors/base-error.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof BaseError) {
    return res.status(err.code).send({ errors: err.toClient() });
  }

  res.status(StatusCodes.BAD_REQUEST).send({
    errors: [{ message: 'Something went wrong ' }]
  });
};
