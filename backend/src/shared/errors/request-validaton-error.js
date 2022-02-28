import { BaseError } from './base-error.js';

export class RequestValidationError extends BaseError {
  constructor(errors) {
    super('Invalid request parameters');

    this.code = StatusCodes.BAD_REQUEST;

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  toClient() {
    return this.errors.map((err) => {
      return { message: err.msg, field: err.param };
    });
  }
}
