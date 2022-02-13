import Base from './Base';

class IdentityAPI extends Base {
  constructor (params) {
    super(params);
    this.base = 'actors';
  }

  login (payload) {
    return this.apiClient.post(`${this.base}/login`, payload);
  }

  logout () {
    return this.apiClient.post(`${this.base}/logout`);
  }

  signup (payload) {
    return this.apiClient.post(`${this.base}/register`, payload);
  }

  confirmUser (payload) {
    return this.apiClient.post(`${this.base}/confirm`, payload);
  }

  forgotPassword (email) {
    return this.apiClient.post(`${this.base}/forgotPassword`, { email });
  }

  restorePassword (payload) {
    return this.apiClient.post(`${this.base}/restore`, payload);
  }

  me () {
    return this.apiClient.get(`${this.base}/me`);
  }
}

export default IdentityAPI;
