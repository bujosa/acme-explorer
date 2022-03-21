import server from '../src/app.js';
import { Server } from '../src/config/server.js';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { sponsorshipModel } from '../src/models/sponsorshipModel.js';
import { actorModel } from '../src/models/actorModel.js';
import { tripModel } from '../src/models/tripModel.js';

const BASE_URL = '/v1/sponsorships';

const createInstance = async (model, data) => {
  const newInstance = new model(data);
  return await newInstance.save();
};

const createCustomToken = async (agent, user) =>
  await agent
    .post('/v1/register')
    .send(user)
    .then(_ => Server.createIdTokenFromCustomToken(_.body.keyValue.email));

const cleanTestDatabase = async () => {
  await actorModel.deleteMany({ email: /.*test.*/i });
  await tripModel.deleteMany({ name: /.*test.trip.*/i });
  await sponsorshipModel.deleteMany({ name: /.*test.*/i });
};

describe('Sponsorships API endpoints', () => {
  const adminTest = {
    name: 'admin',
    surname: 'surname',
    email: 'test.admin@gmail.com',
    password: '123456',
    role: 'admin'
  };

  const sponsorTest = {
    name: 'sponsor',
    surname: 'surname',
    email: 'test.sponsor@gmail.com',
    password: '123456',
    role: 'sponsor'
  };

  const sponsor2Test = {
    name: 'sponsor2',
    surname: 'surname',
    email: 'test.sponsor2@gmail.com',
    password: '123456',
    role: 'sponsor'
  };

  const managerTest = {
    name: 'manager',
    surname: 'surname',
    email: 'test.manager@gmail.com',
    password: '123456',
    role: 'manager'
  };

  let agent,
    admin,
    sponsor,
    sponsor2,
    manager,
    adminToken,
    sponsorToken,
    sponsor2Token,
    managerToken,
    trip,
    sponsorship,
    sponsorship2;

  beforeAll(async () => {
    agent = request.agent(server.instance);

    // Create users
    admin = await createInstance(actorModel, adminTest);
    sponsor = await createInstance(actorModel, sponsorTest);
    sponsor2 = await createInstance(actorModel, sponsor2Test);
    manager = await createInstance(actorModel, managerTest);

    // Create login tokens
    adminToken = await createCustomToken(agent, adminTest);
    sponsorToken = await createCustomToken(agent, sponsorTest);
    sponsor2Token = await createCustomToken(agent, sponsor2Test);
    managerToken = await createCustomToken(agent, managerTest);

    const firstTripData = {
      title: 'test.trip',
      description: 'This is a test trip',
      startDate: '2023-03-25',
      endDate: '2023-03-28',
      manager: manager._id,
      state: 'ACTIVE',
      stages: [
        {
          title: 'first part of stage',
          description: 'description 1',
          price: 10
        },
        {
          title: 'second part of stage',
          description: 'description 2',
          price: 25
        }
      ]
    };

    trip = await createInstance(tripModel, firstTripData);

    const sponsorshipData = {
      sponsor: sponsor._id,
      trip: trip._id,
      banner: 'example banner',
      link: 'example link'
    };

    const sponsorship2Data = {
      sponsor: sponsor2._id,
      trip: trip._id,
      banner: 'example banner',
      link: 'example link'
    };

    sponsorship = await createInstance(sponsorshipModel, sponsorshipData);
    sponsorship2 = await createInstance(sponsorshipModel, sponsorship2Data);
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('findAllSponsorships', () => {
    test('should return all sponsorships if the actor is an "admin"', async () => {
      const response = await agent.set('idtoken', adminToken).get(BASE_URL);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    test('should throw FORBIDDEN if the actor is not an admin', async () => {
      const response = await agent.set('idtoken', sponsorToken).get(BASE_URL);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('createSponsorship', () => {
    test('should create a new sponsorship for an sponsor', async () => {
      const payload = {
        sponsor: sponsor._id,
        trip: trip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', adminToken)
        .post(BASE_URL)
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw an "FORBIDDEN" if the actor is not an admin', async () => {
      const payload = {
        sponsor: sponsor._id,
        trip: trip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', sponsorToken)
        .post(BASE_URL)
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('sponsorTrip', () => {
    test('should create a new sponsorship for a sponsor', async () => {
      const payload = {
        trip: trip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', sponsorToken)
        .post('/v1/sponsorships/sponsortrip')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw an error if req.body is empty', async () => {
      const payload = {};

      const response = await agent
        .set('idtoken', sponsorToken)
        .post('/v1/sponsorships/sponsortrip')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test('should throw an error if the actor is not a sponsor', async () => {
      const payload = {
        trip: trip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', managerToken)
        .post('/v1/sponsorships/sponsortrip')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should not let an sponsor to create a sponsorship for old trips', async () => {
      const oldTrip = await tripModel.findOneAndUpdate({ _id: trip._id }, { startDate: '1990-01-01' }, { new: true });

      const payload = {
        trip: oldTrip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', sponsorToken)
        .post('/v1/sponsorships/sponsortrip')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });

    test('should not let an sponsor create sponsorships for inactives trips', async () => {
      const inactiveTrip = await tripModel.findOneAndUpdate({ _id: trip._id }, { state: 'INACTIVE' }, { new: true });

      const payload = {
        trip: inactiveTrip._id,
        banner: 'example banner',
        link: 'example link'
      };

      const response = await agent
        .set('idtoken', sponsorToken)
        .post('/v1/sponsorships/sponsortrip')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('findMySponsorships', () => {
    test('should return the list of the sponsorships that a sponsor has', async () => {
      const response = await agent.set('idtoken', sponsorToken).get('/v1/mySponsorships');
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe('findSponsorship', () => {
    test('should return an existing sponsorship if actor is an "sponsor"', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor._id });
      const response = await agent.set('idtoken', sponsorToken).get(`${BASE_URL}/${sponsorship._id}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return an error if the actor is not the one that made the sponsorship', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor._id });
      const response = await agent.set('idtoken', sponsor2Token).get(`${BASE_URL}/${sponsorship._id}`);
      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('updateApplication', () => {
    test('should update an existing sponsorship for an sponsor', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor._id });
      const response = await agent
        .set('idtoken', sponsorToken)
        .put(`${BASE_URL}/${sponsorship._id}`)
        .send({
          link: 'this is a new link'
        });

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.link).toBe('this is a new link');
    });

    test('should throw an error if another sponsor tries to update an sponsorship that is not their own', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor._id });
      const response = await agent
        .set('idtoken', sponsor2Token)
        .put(`${BASE_URL}/${sponsorship._id}`)
        .send({
          link: 'this is a new link'
        });

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('payApplication', () => {
    test('should update the state of the sponsorship to "active" if it was paid', async () => {
      const baseApplication = await sponsorshipModel.findOneAndUpdate(
        { _id: sponsorship._id },
        { state: 'inactive' },
        { new: true }
      );
      const response = await agent.set('idtoken', sponsorToken).patch(`${BASE_URL}/${baseApplication._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('active');
    });

    test('should throw an error if another sponsor tries to pay an sponsorship that is not their own', async () => {
      const baseApplication = await sponsorshipModel.findOneAndUpdate(
        { _id: sponsorship._id },
        { state: 'inactive' },
        { new: true }
      );
      const response = await agent.set('idtoken', sponsor2Token).patch(`${BASE_URL}/${baseApplication._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });

    test('should throw an error if a manager tries to pay an sponsorship', async () => {
      const response = await agent.set('idtoken', managerToken).patch(`${BASE_URL}/${sponsorship._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('deleteSponsorship', () => {
    test('should delete an existing sponsorship for an actor that is an "sponsor"', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor._id });
      const response = await agent.set('idtoken', sponsorToken).delete(`${BASE_URL}/${sponsorship._id}`);
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    test('should throw an error when trying to delete an sponsorship that is not owned', async () => {
      const sponsorship = await sponsorshipModel.findOne({ sponsor: sponsor2._id });
      const response = await agent.set('idtoken', sponsorToken).delete(`${BASE_URL}/${sponsorship._id}`);
      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });
});
