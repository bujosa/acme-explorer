import swaggerjsdoc from 'swagger-jsdoc';
import * as swaggerSchemas from '../swagger/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Acme Explorer backend API',
      version: '1.0.0',
      description: 'App that manages custom trips for explorers.'
    },
    components: {
      schemas: swaggerSchemas
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerjsdoc(options);
