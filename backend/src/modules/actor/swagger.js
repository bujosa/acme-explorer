import m2s from 'mongoose-to-swagger';
import { Actor } from './models.js';

export const SwaggerSchemas = {
  Actor: m2s(Actor),
  ActorList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Actor'
    }
  }
};
