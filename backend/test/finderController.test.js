import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { finderModel } from '../src/models/finderModel.js';
import { actorModel } from '../src/models/actorModel.js';
import { Server } from '../src/config/server.js';
import server from '../src/app.js';

describe('Finder API endpoints', () => {
  const base = '/v1/finders';
  let agent, explorerTest, finderTest, token;

  beforeAll(async () => {
    agent = request.agent(server.instance);
    explorerTest = {
      name: 'test',
      surname: 'surname',
      email: 'test.explorer@gmail.com',
      password: 'abc123'
    };
    finderTest = {
      name: 'test.search.base',
      minPrice: 100,
      maxPrice: 300
    };
    const { body: actor } = await agent.post('/v1/register').send(explorerTest);

    finderTest.actor = actor.id;
    token = await Server.createIdTokenFromCustomToken(actor.email);
    return initTestDatabase(finderTest);
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('Finders endpoints', () => {
    test('should return the list of finders for an user', async () => {
      const response = await agent.set('idtoken', token).get(base);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should create a new finder for an user', async () => {
      const payload = {
        name: 'test.search',
        actor: '6214cd93448c720973ba9623',
        minPrice: 100,
        maxPrice: 300
      };

      const response = await agent
        .set('idtoken', token)
        .post(base)
        .send(payload);
      const finder = await finderModel.findOne({ name: payload.name });
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(finder).not.toBeNull();
    });

    test('should return an existing finder', async () => {
      const finder = await finderModel.findOne({ name: finderTest.name });
      const response = await agent.set('idtoken', token).get(`${base}/${finder._id}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return the list of trips in a finder', async () => {
      const finder = await finderModel.findOne({ name: finderTest.name });
      const response = await agent.set('idtoken', token).get(`${base}/${finder._id}/trips`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    test('should update an existing finder for an user', async () => {
      const finder = await finderModel.findOne({ name: finderTest.name });
      const response = await agent
        .set('idtoken', token)
        .patch(`${base}/${finder._id}`)
        .send({ maxPrice: 400 });
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.maxPrice).toBe(400);
    });

    test('should delete an existing finder for an user', async () => {
      const finder = await finderModel.findOne({ name: finderTest.name });
      const response = await agent.set('idtoken', token).delete(`${base}/${finder._id}`);
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });
  });
});

const initTestDatabase = async finderTest => {
  await finderModel.insertMany([finderTest]);
};

const cleanTestDatabase = async () => {
  await finderModel.deleteMany({ name: /.*test.search.*/i });
  await actorModel.deleteMany({ email: /.*test.*/i });
};
