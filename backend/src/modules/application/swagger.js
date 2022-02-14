import m2s from 'mongoose-to-swagger';
import { Application } from './models.js';

export const SwaggerSchemas = {
  Application: m2s(Application),
  ApplicationList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Application'
    }
  },
  ApplicationPayload: {
    type: 'object',
    properties: {
      comment: {
        type: 'string'
      }
    }
  }
};
