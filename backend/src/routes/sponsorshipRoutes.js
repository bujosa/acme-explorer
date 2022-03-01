import {
  findAllSponsorships,
  createSponsorship,
  findSponsorship,
  updateSponsorship,
  deleteSponsorship,
  paySponsorship
} from '../controllers/sponsorshipController.js';

export const sponsorshipRoutes = (app) => {
  app.route('/v1/sponsorships').get(findAllSponsorships).post(createSponsorship);
  app.route('/v1/sponsorships/:sponsorshipId').get(findSponsorship).put(updateSponsorship).delete(deleteSponsorship);
  app.route('/v1/sponsorships/:sponsorshipId/pay').patch(paySponsorship);
};
