import Base from './Base';

class FinderAPI extends Base {
  constructor (params) {
    super(params);
    this.base = 'finders';
  }

  async list (query) {
    const { records } = await this.apiClient.get(this.base, {}, query);
    return records;
  }

  async getTrips(id) {
    const url = [this.base, '/', id, '/', 'trips'].join('');
    const records = await this.apiClient.get(url);
    return {
      records: records,
      pages: 1
    }
  }
}

export default FinderAPI;
