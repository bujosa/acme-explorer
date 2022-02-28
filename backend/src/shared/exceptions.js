import { StatusCodes } from 'http-status-codes';
import { BaseError } from './errors/base-error.js';

export class RecordNotFound extends BaseError {
  constructor(message = '') {
    super(message);
    this.message = 'El registro no se ha encontrado. Por favor verificar.';
    this.code = StatusCodes.NOT_FOUND;
  }
}

export class InvalidRequest extends BaseError {
  constructor(message = '') {
    super(message);
  }
}

export class InvalidToken extends BaseError {
  constructor(message = '') {
    super(message);
    this.message = 'El token provisto no es valido. Por favor revisar.';
    this.code = StatusCodes.UNAUTHORIZED;
  }
}

export class ExpiredToken extends BaseError {
  constructor(message = '') {
    super(message);
    this.message = 'El token provisto ha expirado.';
  }
}

export class UserForbidden extends BaseError {
  constructor(message = '') {
    super(message);
    this.message = 'No tienes los permisos de lugar para realizar esta acción.';
    this.code = StatusCodes.FORBIDDEN;
  }
}
