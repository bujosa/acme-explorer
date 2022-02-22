import {
  findAllFinders,
  findFinderTrips,
  createFinder,
  findFinder,
  updateFinder,
  deleteFinder
} from '../controllers/finderController.js';

export const finderRoutes = (app) => {
  app.route('/v1/finders').get(findAllFinders).post(createFinder);
  app.route('/v1/finders/:finderId').get(findFinder).patch(updateFinder).delete(deleteFinder);
  app.route('/v1/finders/:finderId/trips').get(findFinderTrips);
};
