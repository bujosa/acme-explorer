import jwt from 'jsonwebtoken';

class Authorization {
  getSecret() {
    return process.env.SECRET;
  }

  sign(payload) {
    return jwt.sign(payload, this.getSecret());
  }

  verify(token) {
    return jwt.verify(token, this.getSecret());
  }
}

export const Auth = new Authorization();
