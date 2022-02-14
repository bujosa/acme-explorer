import m2s from 'mongoose-to-swagger';
import { Sponsorship } from './models.js';

export const SwaggerSchemas = {
  Sponsorship: m2s(Sponsorship),
  SponsorshipList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Sponsorship'
    }
  },
  SponsorshipPayload: {
    type: 'object',
    properties: {
      banner: {
        type: 'string'
      }
    }
  }
};
