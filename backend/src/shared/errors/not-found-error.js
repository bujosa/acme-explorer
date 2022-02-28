import { BaseError } from './base-error.js';
import { StatusCodes } from 'http-status-codes';

export class NotFoundError extends BaseError {
  constructor() {
    super('Route not found');

    this.code = StatusCodes.NOT_FOUND;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
