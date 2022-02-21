import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import server from '../src/app.js';

describe('Finder API endpoints', () => {
  const base = '/v1/finders';
  let agent;

  beforeAll(() => {
    agent = request.agent(server.instance);
    return initTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('Finders endpoints', () => {
    test('should return the list of finders', async () => {
      const response = await agent.get(base);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });
  });
});

const initTestDatabase = async () => {
};

const cleanTestDatabase = async () => {

};