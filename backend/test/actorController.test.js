import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { actorModel } from '../src/models/actorModel.js';
import { Server } from '../src/config/server.js';
import server from '../src/app.js';
import { faker } from '@faker-js/faker';
import { Roles } from '../src/shared/enums.js';
import { BasicState } from '../src/shared/enums.js';
import mongoose from 'mongoose';

describe('Actor API endpoints', () => {
  const base = '/v1/actors';
  let agent, admin, token;

  const fakeActor = (lastName = faker.lorem.word()) => {
    return { 
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email: faker.internet.email('fake',lastName),
      password: faker.internet.password()
    };
  }

  const createActor = async (lastName = faker.lorem.word(), role = Roles.EXPLORER) => {

    const password = faker.lorem.word(6);
    const email = faker.internet.email('fake', lastName);

    const entity = new actorModel({
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
      email,
      password,
      role
    });
    
    await entity.save();

    return { email, password };
  }

  const createMyCustomToken = async (user) => {
    return agent
      .post('/v1/login')
      .send(user)
      .then(_ => Server.createIdTokenFromCustomToken(_.body.email));
  };

  beforeAll(async () => {
    agent = request.agent(server.instance);

    admin = await createActor(faker.lorem.word(5), Roles.ADMIN);

    token = await createMyCustomToken(admin);
  });

  afterAll(async () => {
    await actorModel.deleteMany({ email: /.*fake.*/i });
    return server.close();
  });

  describe('Self', () => {
    test('should return the actor information', async () => {
      const response = await agent.set('idtoken', token).get(`/v1/self`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw FORBIDDEN if the token its not provider', async () => {
      // Act
      const token = null;

      // Assert
      const response = await agent.set('idtoken', token).get(`/v1/self`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('Login', () => {
    test('should return the actor information', async () => {
      // Arrange
      const actor = await createActor(faker.lorem.word(8));

      // Act
      const response = await agent.post(`/v1/login`).send(actor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw UNAUTHORIZED if the user is not authorized', async () => {
      // Arrange
      const actor = {};

      // Act
      const response = await agent.post(`/v1/login`).send(actor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe('Register', () => {
    test('should return the actor information', async () => {
      // Arrange
      const actor = fakeActor(faker.lorem.word(6));

      // Act
      const response = await agent.post(`/v1/register`).send(actor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw UNPROCESSABLE ENTITY if the email is invalid', async () => {
      // Arrange
      const newActor = {
        email: faker.lorem.word(),
        password: faker.lorem.word(6),
        name: faker.name.firstName(),
        surname: faker.name.lastName(),
      }

      // Act
      const response = await agent.post(`/v1/register`).send(newActor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    test('should throw INTERNAL SERVER ERROR if the email is already registered', async () => {
      // Arrange
      const actor = await createActor(faker.lorem.word(7));
      const newActor = {
        ...actor,
        password: faker.lorem.word(6),
        name: faker.name.firstName(),
        surname: faker.name.lastName(),
      }

      // Act
      const response = await agent.post(`/v1/register`).send(newActor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('FindActors', () => {
    test('should return all actors', async () => {
      const response = await agent.set('idtoken', token).get(`${base}`);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Array);
    });

    test('should throw FORBIDDEN if the token its not provider', async () => {
      // Act
      const token = null;

      // Assert
      const response = await agent.set('idtoken', token).get(`${base}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const noAdminActor = await createActor(faker.lorem.word(5));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).get(`${base}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('FindActor', () => {
    test('should return an actor', async () => {
      // Arrange
      const actor = await actorModel.findOne({email: admin.email});

      // Act
      const response = await agent.set('idtoken', token).get(`${base}/${actor._id}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should return not found if the actor does not exist', async () => {
      // Arrange 
      const actor = {_id: new mongoose.Types.ObjectId().toHexString()};

      // Act
      const response = await agent.set('idtoken', token).get(`${base}/${actor._id}`);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    test('should throw FORBIDDEN if the token its not provider', async () => {
      // Act
      const actor = await actorModel.findOne({email: admin.email});
      const token = null;

      // Assert
      const response = await agent.set('idtoken', token).get(`${base}/${actor._id}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const actor = await actorModel.findOne({email: admin.email});
      const noAdminActor = await createActor(faker.lorem.word(4));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).get(`${base}/${actor._id}`);
      
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('BanActor', () => {
    test('should return a banned actor', async () => {
      // Arrange
      const newActor = await createActor(faker.lorem.word(3));
      const actor = await actorModel.findOne({email: newActor.email});

      // Act
      const response = await agent.set('idtoken', token).patch(`${base}/${actor._id}/ban`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe(BasicState.INACTIVE);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const actor = await actorModel.findOne({email: admin.email});
      const noAdminActor = await createActor(faker.lorem.word(2));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).patch(`${base}/${actor._id}/ban`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('UnbanActor', () => {
    test('should return an unbanned actor', async () => {
      // Arrange
      const newActor = await createActor(faker.lorem.word(1));
      const actor = await actorModel.findOne({email: newActor.email});

      // Act
      await agent.set('idtoken', token).patch(`${base}/${actor._id}/ban`);
      const response = await agent.set('idtoken', token).patch(`${base}/${actor._id}/unban`); 
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.state).toBe(BasicState.ACTIVE);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const actor = await actorModel.findOne({email: admin.email});
      const noAdminActor = await createActor(faker.lorem.word(2));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).patch(`${base}/${actor._id}/unban`); 
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('DeleteActor', () => {
    test('should delete an actor', async () => {
      // Arrange
      const newActor = await createActor(faker.lorem.word(13));
      const actor = await actorModel.findOne({email: newActor.email});

      // Act
      const response = await agent.set('idtoken', token).delete(`${base}/${actor._id}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const actor = await actorModel.findOne({email: admin.email});
      const noAdminActor = await createActor(faker.lorem.word(2));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).delete(`${base}/${actor._id}`);
      
      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });
  });

  describe('UpdateActor', () => {
    test('should update an actor information', async () => {
      // Arrange
      const newInfo = {
        name: faker.name.firstName(),
      };
      const actor = await actorModel.findOne({email: admin.email});

      // Act
      const response = await agent.set('idtoken', token).put(`${base}/${actor._id}`).send(newInfo);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });
 
    test('should throw METHOD NOT ALLOWED if the actor is not admin, and is trying to update another resource that is not his.', async () => {
      // Arrange
      const newInfo = {
        name: faker.name.firstName(),
      };
      const otherActor = await createActor(faker.lorem.word(10));
      const customToken = await createMyCustomToken(otherActor);
      const actor = await actorModel.findOne({email: admin.email});

      // Act
      const response = await agent.set('idtoken', customToken).put(`${base}/${actor._id}`).send(newInfo);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
    });
  });

  describe('CreateActor', () => {
    test('should create a new actor', async () => {
      // Arrange
      const actor = fakeActor(faker.lorem.word(14));

      // Act
      const response = await agent.set('idtoken', token).post(`${base}`).send(actor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toBeInstanceOf(Object);
    });

    test('should throw FORBIDDEN if the actor its not admin', async () => {
      // Act
      const actor = fakeActor(faker.lorem.word(4));
      const noAdminActor = await createActor(faker.lorem.word(15));
      const token = await createMyCustomToken(noAdminActor);

      // Assert
      const response = await agent.set('idtoken', token).post(`${base}`).send(actor);

      // Assert
      expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

  });
});


