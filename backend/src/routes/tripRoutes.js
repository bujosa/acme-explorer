import {
  find_all_trips,
  create_an_trip,
  find_an_trip,
  update_an_trip,
  delete_an_trip
} from '../controllers/tripController.js';

export const tripRoutes = (app) => {
  /**
   * @section trips
   * @type get post
   * @url /v1/trips
   * @param {string}
   */
  app.route('/v1/trips').get(find_all_trips).post(create_an_trip);

  /**
   * @section trips
   * @type get put
   * @url /v1/trips/:tripId
   */
  app.route('/v1/trips/:tripId').get(find_an_trip).put(update_an_trip).delete(delete_an_trip);
};
