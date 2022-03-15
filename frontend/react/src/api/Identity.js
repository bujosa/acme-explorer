import Base from './Base';
import { auth } from "../helpers/firebase";

class IdentityAPI extends Base {
  constructor (params) {
    super(params);
    this.base = '';
  }

  async login (payload) {
    const actor = await this.apiClient.post(`login`, payload);
    const { user } = await auth.signInWithCustomToken(actor.customToken);
    localStorage.setItem('token', user.toJSON().stsTokenManager.accessToken);
    return this.me();
  }

  logout () {
    return auth.signOut();
  }

  async signup (payload) {
    return this.apiClient.post(`register`, payload);
  }

  forgotPassword (email) {
    return auth.sendPasswordResetEmail(email);
  }

  async me () {
    return this.apiClient.get(`self`);
  }
}

export default IdentityAPI;
