import m2s from 'mongoose-to-swagger';
import { Trip } from './models.js';

export const SwaggerSchemas = {
  Trip: m2s(Trip),
  TripList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Trip'
    }
  },
  TripPayload: {
    type: 'object',
    properties: {
      title: {
        type: 'string'
      }
    }
  }
};
