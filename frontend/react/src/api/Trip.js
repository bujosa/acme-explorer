import Base from './Base';

class TripAPI extends Base {
  constructor (params) {
    super(params);
    this.base = 'trips';
  }

  getCategories (query) {
    return this.apiClient.get(`${this.base}/category`, {}, query);
  }
}

export default TripAPI;
