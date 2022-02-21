import {
  find_all_sponsorships,
  create_an_sponsorship,
  find_an_sponsorship,
  update_an_sponsorship,
  delete_an_sponsorship
} from '../controllers/sponsorshipController.js';

export const sponsorshipRoutes = (app) => {
  /**
   * @section sponsorships
   * @type get post
   * @url /v1/sponsorships
   * @param {string}
   */
  app.route('/v1/sponsorships').get(find_all_sponsorships).post(create_an_sponsorship);

  /**
   * @section sponsorships
   * @type get put
   * @url /v1/sponsorships/:sponsorshipId
   */
  app
    .route('/v1/sponsorships/:sponsorshipId')
    .get(find_an_sponsorship)
    .put(update_an_sponsorship)
    .delete(delete_an_sponsorship);
};
