import { StatusCodes } from 'http-status-codes';

export class BaseError extends Error {
  constructor(message) {
    super(message);
    this.code = StatusCodes.BAD_REQUEST;

    Object.setPrototypeOf(this, BaseError.prototype);
  }

  toClient() {
    return [
      {
        message: this.message
      }
    ];
  }
}
