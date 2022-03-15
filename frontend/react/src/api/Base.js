export default class Base {
  constructor ({ apiClient }) {
    if (!apiClient) throw new Error('[apiClient] required');
    this.apiClient = apiClient;
    this.base = '';
  }

  create (payload) {
    return this.apiClient.post(this.base, payload);
  }

  get (id) {
    const url = [this.base, '/', id].join('');
    return this.apiClient.get(url);
  }

  update (id, record) {
    const url = [this.base, '/', id].join('');
    return this.apiClient.patch(url, record);
  }

  put (id, record) {
    const url = [this.base, '/', id].join('');
    return this.apiClient.put(url, record);
  }

  delete (id) {
    const url = [this.base, '/', id].join('');
    return this.apiClient.delete(url);
  }

  list (query) {
    return this.apiClient.get(this.base, {}, query);
  }
}
