import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};
