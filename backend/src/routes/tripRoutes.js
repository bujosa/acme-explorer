import {
  find_all_trips,
  find_trips_by_keyword,
  create_trip,
  find_trip,
  update_trip,
  delete_trip,
  find_my_trips
} from '../controllers/tripController.js';

export const tripRoutes = (app) => {
  /**
   * @section trips
   * @type get post
   * @url /v1/trips
   * @param {string}
   */
  app.route('/v1/trips').get(find_trips_by_keyword).post(create_trip);

  /**
   * @section trips
   * @type get put
   * @url /v1/trips/:tripId
   */
  app.route('/v1/trips/:tripId').get(find_trip).put(update_trip).delete(delete_trip);

  /**
   * @section trips
   * @type get
   * @url /v1/myTrips
   */
  app.route('/v1/myTrips').get(find_my_trips);

  /**
   * @section trips
   * @type get
   * @url /v1/allTrips
   */
  // This route is not part of the requirements, consider removing it
  app.route('/v1/allTrips').get(find_all_trips);
};
