import m2s from 'mongoose-to-swagger';
import { Actor } from './models.js';

export const SwaggerSchemas = {
  Actor: m2s(Actor),
  ActorList: {
    type: 'array',
    items: {
      $ref: '#/components/schemas/Actor'
    }
  },
  ActorPayload: {
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      surname: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      phone: {
        type: 'string'
      },
      address: {
        type: 'string'
      },
      password: {
        type: 'string'
      },
      password_confirm: {
        type: 'string'
      },
      role: {
        type: 'string'
      }
    }
  }
};
