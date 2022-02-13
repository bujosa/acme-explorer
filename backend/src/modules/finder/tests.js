import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../index.js';

describe('Finder API endpoints', () => {
  const base = '/api/v1/finders';
  let agent;

  beforeAll(() => {
    agent = request.agent(app.instance);
    return initTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return app.close();
  });

  describe('Finders endpoints', () => {
    test('should return an error if user is not authenticated', async () => {
      const response = await agent.get(base);
      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('message');
    });
  });
});

const initTestDatabase = async () => {
};

const cleanTestDatabase = async () => {

};
