import {
  find_all_applications,
  create_an_application,
  find_an_application,
  update_an_application,
  delete_an_application
} from '../controllers/applicationController.js';

export const applicationRoutes = (app) => {
  /**
   * @section applications
   * @type get post
   * @url /v1/applications
   * @param {string}
   */
  app.route('/v1/applications').get(find_all_applications).post(create_an_application);

  /**
   * @section applications
   * @type get put
   * @url /v1/applications/:applicationId
   */
  app
    .route('/v1/applications/:applicationId')
    .get(find_an_application)
    .put(update_an_application)
    .delete(delete_an_application);
};
