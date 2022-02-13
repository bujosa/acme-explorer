import { App as BaseApp } from './core/app.js';

class App extends BaseApp {
  getSwaggerOptions () {
    return {
      name: 'acme-explorer',
      swaggerDefinition: {
        openapi: '3.0.1',
        info: {
          title: `${this.getAppName()} backend API`,
          version: this.env.npm_package_version,
          description: 'Manage custom trips for explorers. Provides all API logic to support the system transactions',
          license: {
            name: 'MIT',
            url: 'https://github.com/acme-explorer/acme-explorer/blob/main/LICENSE'
          },
          contact: {
            name: 'AcmeExplorer',
            url: 'https://github.com/acme-explorer/',
            email: 'six.aps@gmail.com'
          }
        },
        servers: [{
          url: this.router.getBaseRoute()
        }],
        components: {
          securitySchemes: {
            jwt: {
              type: 'http',
              scheme: 'bearer',
              in: 'header',
              bearerFormat: 'JWT'
            }
          },
          schemas: this.getAllSwagger()
        },
        security: [{
          jwt: []
        }]
      },
      apis: ['./**/views.js']
    };
  }
}

export default App;
