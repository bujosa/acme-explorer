import {
  find_all_finders,
  create_an_finder,
  find_an_finder,
  update_an_finder,
  delete_an_finder
} from '../controllers/finderController.js';

export const finderRoutes = (app) => {
  /**
   * @section finders
   * @type get post
   * @url /v1/finders
   * @param {string}
   */
  app.route('/v1/finders').get(find_all_finders).post(create_an_finder);

  /**
   * @section finders
   * @type get put
   * @url /v1/finders/:finderId
   */
  app.route('/v1/finders/:finderId').get(find_an_finder).put(update_an_finder).delete(delete_an_finder);
};
