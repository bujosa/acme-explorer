import axios from 'axios';
import queryString from 'query-string';

export default class ApiClient {
  constructor ({ prefix = 'v1', extraHeaders = {} } = {}) {
    this.prefix = prefix;
    this.extraHeaders = { ...extraHeaders };
  }

  get (requestUrl, payload = {}, params = {}) {
    return this.ajax({
      url: requestUrl,
      method: 'get',
      body: payload,
      params
    });
  }

  put (requestUrl, payload = {}) {
    return this.ajax({
      url: requestUrl,
      method: 'put',
      body: payload
    });
  }

  patch (requestUrl, payload = {}) {
    return this.ajax({
      url: requestUrl,
      method: 'patch',
      body: payload
    });
  }

  post (requestUrl, payload = {}) {
    return this.ajax({
      url: requestUrl,
      method: 'post',
      body: payload
    });
  }

  upload (requestUrl, payload = {}, onProgress) {
    return this.ajax({
      url: requestUrl,
      method: 'post',
      body: payload,
      progress: onProgress
    });
  }

  delete (requestUrl) {
    return this.ajax({
      url: requestUrl,
      method: 'delete'
    });
  }

  ajax ({ url, method, params = {}, body }) {
    const query = !Object.keys(params).length ? '' : `?${queryString.stringify(params)}`;
    const urlWithQuery = `${url}${query}`;
    this._setExtraHeaders();

    return axios({
      url: `/${this.prefix}/${urlWithQuery}`,
      method,
      data: body,
      headers: this.extraHeaders
    }).then(res => {
      return res.data;
    }).catch(err => {
      if (err.response.data) {
        throw Error(err.response.data.message);
      }
      throw err;
    });
  }

  _setExtraHeaders () {
    const defaultHeaders = {
      'idtoken': localStorage.getItem('token')
    };
    this.extraHeaders = { ...this.extraHeaders, ...defaultHeaders };
  }
}
