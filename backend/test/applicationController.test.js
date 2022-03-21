import server from '../src/app.js';
import { Server } from '../src/config/server.js';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { applicationModel } from '../src/models/applicationModel.js';
import { actorModel } from '../src/models/actorModel.js';
import { tripModel } from '../src/models/tripModel.js';

const BASE_URL = '/v1/applications';

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
  await applicationModel.deleteMany({ name: /.*test.*/i });
};

describe('Applications API endpoints', () => {
  const adminTest = {
    name: 'admin',
    surname: 'surname',
    email: 'test.admin@gmail.com',
    password: '123456',
    role: 'admin'
  };

  const explorerTest = {
    name: 'explorer',
    surname: 'surname',
    email: 'test.explorer@gmail.com',
    password: '123456',
    role: 'explorer'
  };

  const explorer2Test = {
    name: 'explorer2',
    surname: 'surname',
    email: 'test.explorer2@gmail.com',
    password: '123456',
    role: 'explorer'
  };

  const managerTest = {
    name: 'manager',
    surname: 'surname',
    email: 'test.manager@gmail.com',
    password: '123456',
    role: 'manager'
  };

  const manager2Test = {
    name: 'manager2',
    surname: 'surname',
    email: 'test.manager2@gmail.com',
    password: '123456',
    role: 'manager'
  };

  let agent,
    admin,
    explorer,
    explorer2,
    manager,
    manager2,
    adminToken,
    explorerToken,
    explorer2Token,
    managerToken,
    manager2Token,
    trip,
    application,
    application2;

  beforeAll(async () => {
    agent = request.agent(server.instance);

    // Create users
    admin = await createInstance(actorModel, adminTest);
    explorer = await createInstance(actorModel, explorerTest);
    explorer2 = await createInstance(actorModel, explorer2Test);
    manager = await createInstance(actorModel, managerTest);
    manager2 = await createInstance(actorModel, manager2Test);

    // Create login tokens
    adminToken = await createCustomToken(agent, adminTest);
    explorerToken = await createCustomToken(agent, explorerTest);
    explorer2Token = await createCustomToken(agent, explorer2Test);
    managerToken = await createCustomToken(agent, managerTest);
    manager2Token = await createCustomToken(agent, manager2Test);

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

    const firstApplicationData = {
      explorer: explorer._id,
      trip: trip._id,
      comments: ['first_comment', 'second_comment', 'third_comment']
    };

    const secondApplicationData = {
      explorer: explorer2._id,
      trip: trip._id
    };

    application = await createInstance(applicationModel, firstApplicationData);
    application2 = await createInstance(applicationModel, secondApplicationData);
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('findAllApplications', () => {
    test('should return all applications if the actor is an "admin"', async () => {
      const response = await agent.set('idtoken', adminToken).get(BASE_URL);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    test('should throw FORBIDDEN if the actor is not an admin', async () => {
      const response = await agent.set('idtoken', explorerToken).get(BASE_URL);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('createApplication', () => {
    test('should create a new application for an explorer', async () => {
      const payload = {
        trip: trip._id,
        explorer: explorer2._id
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
        trip: trip._id,
        explorer: manager._id
      };

      const response = await agent
        .set('idtoken', explorer2Token)
        .post(BASE_URL)
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw an error if the actor is not an admin', async () => {
      const payload = {
        trip: trip._id,
        explorer: explorer._id
      };

      const response = await agent
        .set('idtoken', managerToken)
        .post(BASE_URL)
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('applyToTrips', () => {
    test('should create a new application for an explorer', async () => {
      const payload = {
        trip: trip._id,
        comments: ['epic', 'epic 2']
      };

      const response = await agent
        .set('idtoken', explorer2Token)
        .post('/v1/applications/apply')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw an error if req.body is empty', async () => {
      const payload = {};

      const response = await agent
        .set('idtoken', explorer2Token)
        .post('/v1/applications/apply')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test('should throw an error if actor is not an explorer', async () => {
      const payload = {
        trip: trip._id,
        comments: ['epic', 'epic 2']
      };

      const response = await agent
        .set('idtoken', managerToken)
        .post('/v1/applications/apply')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should not let an explorer apply to old trips', async () => {
      const oldTrip = await tripModel.findOneAndUpdate({ _id: trip._id }, { startDate: '1990-01-01' }, { new: true });

      const payload = {
        trip: oldTrip._id
      };

      const response = await agent
        .set('idtoken', explorer2Token)
        .post('/v1/applications/apply')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });

    test('should not let an explorer apply to inactives trips', async () => {
      const inactiveTrip = await tripModel.findOneAndUpdate({ _id: trip._id }, { state: 'INACTIVE' }, { new: true });

      const payload = {
        trip: inactiveTrip._id
      };

      const response = await agent
        .set('idtoken', explorer2Token)
        .post('/v1/applications/apply')
        .send(payload);

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('findMyApplications', () => {
    test('should return the list of the applications made by an explorer', async () => {
      const response = await agent.set('idtoken', explorerToken).get('/v1/myApplications');
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return the list of the applications that a manager has on its trips', async () => {
      const response = await agent.set('idtoken', managerToken).get('/v1/myApplications');
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe('findApplication', () => {
    test('should return an existing application if actor is an "explorer"', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent.set('idtoken', explorerToken).get(`${BASE_URL}/${application._id}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return an existing application', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent.set('idtoken', explorerToken).get(`${BASE_URL}/${application._id}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return an error if the actor is not the one that applied', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent.set('idtoken', explorer2Token).get(`${BASE_URL}/${application._id}`);
      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('updateApplication', () => {
    test('should update an existing application for an explorer', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent
        .set('idtoken', explorerToken)
        .put(`${BASE_URL}/${application._id}`)
        .send({
          comments: ['test']
        });

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.comments).toBeInstanceOf(Array);
      expect(response.body.comments).toContain('test');
    });

    test('should throw an error if another explorer tries to update an application that is not their own', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent
        .set('idtoken', explorer2Token)
        .put(`${BASE_URL}/${application._id}`)
        .send({
          comments: ['test']
        });

      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('cancelApplication', () => {
    test('should update the state of the application to be "cancelled" if the state is "pending', async () => {
      // The application must be "pending" for these methods to work
      // Considering that there are a lot of side effects, we need to do this to reset the state of the application
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${baseApplication._id}/cancel`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('cancelled');
    });

    test('should update the state of the application to be "cancelled" if the state is "accepted', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'accepted' },
        { new: true }
      );
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${baseApplication._id}/cancel`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('cancelled');
    });

    test('should throw an error if the state is not "pending or "accepted"', async () => {
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${application._id}/cancel`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.state).not.toBe('pending');
      expect(response.body.state).not.toBe('accepted');
    });

    test('should throw an error if another explorer tries to cancel an application that is not their own', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', explorer2Test).patch(`${BASE_URL}/${baseApplication._id}/cancel`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw an error if a manager tries to cancel an application', async () => {
      const response = await agent.set('idtoken', managerTest).patch(`${BASE_URL}/${application._id}/cancel`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('payApplication', () => {
    test('should update the state of the application to "accepted" if the state is "due', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'due' },
        { new: true }
      );
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${baseApplication._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('accepted');
    });

    test('should throw an error if the state is not "due"', async () => {
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${application._id}/pay`);

      expect(response.body.state).not.toBe('due');
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test('should throw an error if another explorer tries to pay an application that is not their own', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', explorer2Test).patch(`${BASE_URL}/${baseApplication._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw an error if a manager tries to pay an application', async () => {
      const response = await agent.set('idtoken', managerTest).patch(`${BASE_URL}/${application._id}/pay`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('acceptApplication', () => {
    test('should update the state of the application to be "due"', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', managerToken).patch(`${BASE_URL}/${baseApplication._id}/accept`);

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('due');
    });

    test('should throw an error if the state is not "pending"', async () => {
      const response = await agent.set('idtoken', managerToken).patch(`${BASE_URL}/${application._id}/accept`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.state).not.toBe('pending');
    });

    test('should throw an error if another manager tries to accept an application that is not their own', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', manager2Token).patch(`${BASE_URL}/${baseApplication._id}/accept`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw an error if an explorer tries to accept an application', async () => {
      const response = await agent.set('idtoken', explorerToken).patch(`${BASE_URL}/${application._id}/accept`);

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('rejectApplication', () => {
    test('should update the state of the application to be "rejected"', async () => {
      const response = await agent
        .set('idtoken', managerToken)
        .patch(`${BASE_URL}/${application2._id}/reject`)
        .send({ reasonRejected: 'This is a reason of rejection' });

      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe('rejected');
    });

    test('should throw an error if the state is not "pending"', async () => {
      const response = await agent.set('idtoken', managerToken).patch(`${BASE_URL}/${application2._id}/reject`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.state).not.toBe('pending');
    });

    test('should throw an error if a reasonRejected is not appended', async () => {
      const baseApplication = await applicationModel.findOneAndUpdate(
        { _id: application2._id },
        { state: 'pending' },
        { new: true }
      );
      const response = await agent.set('idtoken', managerToken).patch(`${BASE_URL}/${baseApplication._id}/reject`);

      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    test('should throw an error if another manager tries to accept an application that is not their own', async () => {
      const response = await agent
        .set('idtoken', manager2Token)
        .patch(`${BASE_URL}/${application2._id}/reject`)
        .send({ reasonRejected: 'This is a reason of rejection' });

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw an error if an explorer tries to accept an application', async () => {
      const response = await agent
        .set('idtoken', explorerToken)
        .patch(`${BASE_URL}/${application2._id}/reject`)
        .send({ reasonRejected: 'This is a reason of rejection' });

      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('deleteApplication', () => {
    test('should delete an existing application for an actor that is an "explorer"', async () => {
      const application = await applicationModel.findOne({ explorer: explorer._id });
      const response = await agent.set('idtoken', explorerToken).delete(`${BASE_URL}/${application._id}`);
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    test('should throw an error when trying to delete an application that is not owned', async () => {
      const application = await applicationModel.findOne({ explorer: explorer2._id });
      const response = await agent.set('idtoken', explorerToken).delete(`${BASE_URL}/${application._id}`);
      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });
});
