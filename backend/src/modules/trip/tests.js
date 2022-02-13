import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../../index.js';

describe('Trip API endpoints', () => {
  const base = '/api/v1/trips';
  let agent;

  beforeAll(() => {
    agent = request.agent(app.instance);
    return initTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return app.close();
  });

  describe('Trips endpoints', () => {
    test('should return the list of trips', async () => {
      const response = await agent.get(base);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });
  });
});

const initTestDatabase = async () => {
};

const cleanTestDatabase = async () => {

};
