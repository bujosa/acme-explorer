import m2s from 'mongoose-to-swagger';
import { Finder } from './models.js';

export const SwaggerSchemas = {
  Finder: m2s(Finder),
  FinderList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Finder'
    }
  },
  FinderPayload: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string'
      }
    }
  }
};
