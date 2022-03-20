import server from '../src/app.js';
import { Server } from '../src/config/server.js';
import { actorModel } from '../src/models/actorModel.js';
import { tripModel } from '../src/models/tripModel.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Trips API endpoints', () => {
  let manager1Test,
    manager2Test,
    manager1Id,
    manager2Id,
    manager1Token,
    manager2Token,
    trip1Id,
    trip2Id,
    stage1Id,
    stage2Id;

  beforeAll(async () => {
    // This manager is the owner of all the trips
    manager1Test = {
      name: 'manager1',
      surname: 'manager1',
      email: 'test.manager1@gmail.com',
      password: 'abc123',
      role: 'manager',
      state: 'active'
    };
    // This manager will try to edit trips that do not belong to him
    manager2Test = {
      name: 'manager2',
      surname: 'manager2',
      email: 'test.manager2@gmail.com',
      password: 'abc123',
      role: 'manager',
      state: 'active'
    };

    manager1Test = await chai
      .request(server.instance)
      .post('/v1/register')
      .send(manager1Test);
    manager2Test = await chai
      .request(server.instance)
      .post('/v1/register')
      .send(manager2Test);

    // Get the id of the created users
    manager1Id = manager1Test.body.id;
    manager2Id = manager2Test.body.id;

    // Change the role of the created users to manager
    await actorModel.findOneAndUpdate({ _id: manager1Id }, { role: 'manager' });
    await actorModel.findOneAndUpdate({ _id: manager2Id }, { role: 'manager' });

    // Get the tokens of the users
    manager1Token = await Server.createIdTokenFromCustomToken(manager1Test.body.email);
    manager2Token = await Server.createIdTokenFromCustomToken(manager2Test.body.email);

    // All the trips belong to manager 1
    // Trip 1 (ACTIVE)
    let trip1 = await chai
      .request(server.instance)
      .post('/v1/trips')
      .set('idtoken', manager1Token)
      .send({
        title: 'test.trip.active',
        description: ' second Description of my trip',
        requirements: ['first req', 'second req'],
        startDate: '11/11/2023',
        endDate: '12/12/2023',
        stages: [
          {
            title: 'stage 1',
            description: 'First stage',
            price: 800
          },
          {
            title: 'stage 2',
            description: 'second stage',
            price: 500
          }
        ]
      });

    trip1Id = trip1.body.id;

    // Get id of the first stage of the trip
    stage1Id = trip1.body.stages[0].id;

    await tripModel.findOneAndUpdate({ _id: trip1Id }, { state: 'ACTIVE' });

    // Trip 2 (INACTIVE)
    let trip2 = await chai
      .request(server.instance)
      .post('/v1/trips')
      .set('idtoken', manager1Token)
      .send({
        title: 'test.trip.inactive',
        description: ' second Description of my trip',
        requirements: ['first req', 'second req'],
        startDate: '11/11/2023',
        endDate: '12/12/2023',
        stages: [
          {
            title: 'stage 1',
            description: 'First stage',
            price: 800
          },
          {
            title: 'stage 2',
            description: 'second stage',
            price: 500
          }
        ]
      });
    trip2Id = trip2.body.id;

    // Get id of the first stage of the trip
    stage2Id = trip2.body.stages[1].id;
  });

  afterAll(async () => {
    await cleanTestDatabase();
    return server.close();
  });

  describe('/v1/trips - GET', () => {
    it('Should return all ACTIVE an CANCELLED Trips', done => {
      chai
        .request(server.instance)
        .get('/v1/trips')
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Check that all trips are not INACTIVE
          res.body.records.forEach(trip => {
            expect(trip.state).to.not.equal('INACTIVE');
          });
          done();
        });
    });
  });

  describe('/v1/trips - POST', () => {
    it('Should create a new trip', done => {
      chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.inactive',
          description: 'sample description',
          requirements: ['sample requirement'],
          startDate: '2025-01-01',
          endDate: '2025-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            },
            {
              title: 'stage 2',
              description: 'second stage',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.manager).to.equal(manager1Id);
          expect(res.body.state).to.equal('INACTIVE');
          done();
        });
    });

    it('Should return an error if the user is not a manager', done => {
      chai
        .request(server.instance)
        .post('/v1/trips')
        .send({
          title: 'sample trip',
          description: 'sample description',
          requirements: ['sample requirement'],
          startDate: '2025-01-01',
          endDate: '2025-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('/v1/trips/:tripId - GET', () => {
    it('Should return the trip with the given id', done => {
      chai
        .request(server.instance)
        .get(`/v1/trips/${trip1Id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.equal(trip1Id);
          done();
        });
    });

    it('Should return an error if the trip does not exist', done => {
      chai
        .request(server.instance)
        .get(`/v1/trips/5e8b8f8a9e9e9f0f8c8a8a8a`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('Should return an error if the user tries to display an inactive trip', done => {
      chai
        .request(server.instance)
        .get(`/v1/trips/${trip2Id}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('/v1/trips/:tripId - PUT', () => {
    it('Should update the trip with the given id', done => {
      chai
        .request(server.instance)
        .put(`/v1/trips/${trip2Id}`)
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.inactiveUpdated',
          description: 'new description',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2026-01-09'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.title).to.equal('test.trip.inactiveUpdated');
          expect(res.body.description).to.equal('new description');
          expect(res.body.requirements).to.deep.equal(['new requirement']);
          expect(res.body.startDate).to.equal('01/01/2023');
          expect(res.body.endDate).to.equal('09/01/2026');

          done();
        });
    });

    it('Should return an error if the trip does not exist', done => {
      chai
        .request(server.instance)
        .put(`/v1/trips/5e8b8f8a9e9e9f0f8c8a8a8a`)
        .set('idtoken', manager1Token)
        .send({
          title: 'new title',
          description: 'new description',
          requirements: ['new requirement'],
          startDate: '2025-01-01',
          endDate: '2025-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('Should return an error if the user is not a manager', done => {
      chai
        .request(server.instance)
        .put(`/v1/trips/${trip2Id}`)
        .send({
          title: 'new title',
          description: 'new description',
          requirements: ['new requirement'],
          startDate: '2025-01-01',
          endDate: '2025-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Should return an error if the user tries to update an ACTIVE trip', done => {
      chai
        .request(server.instance)
        .put(`/v1/trips/${trip1Id}`)
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.inactiveUpdated',
          description: 'new description',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2026-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Should not be able to update a trip that belongs to a different manager', done => {
      chai
        .request(server.instance)
        .put(`/v1/trips/${trip2Id}`)
        .set('idtoken', manager2Token)
        .send({
          title: 'test.trip.inactiveUpdated',
          description: 'new description',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2026-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('/v1/myTrips - GET', () => {
    it('Should return the trips of the user', done => {
      chai
        .request(server.instance)
        .get('/v1/myTrips')
        .set('idtoken', manager1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Check that the manager of all the trips is equal to the id of the logged in manager
          res.body.forEach(trip => {
            expect(trip.manager).to.equal(manager1Id);
          });
          done();
        });
    });

    it('Should return an error if the user is not logged in', done => {
      chai
        .request(server.instance)
        .get('/v1/myTrips')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Manager 2 should not have any trips', done => {
      chai
        .request(server.instance)
        .get('/v1/myTrips')
        .set('idtoken', manager2Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.empty;
          done();
        });
    });
  });

  describe('/v1/myTrips/:tripId -GET', () => {
    it('Should return the trip of the user with the given id', done => {
      chai
        .request(server.instance)
        .get(`/v1/myTrips/${trip2Id}`)
        .set('idtoken', manager1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.manager).to.equal(manager1Id);
          done();
        });
    });

    it('Should return an error if the user is not logged in', done => {
      chai
        .request(server.instance)
        .get(`/v1/myTrips/${trip1Id}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Should return an error if the user is not the manager of the trip', done => {
      chai
        .request(server.instance)
        .get(`/v1/myTrips/${trip1Id}`)
        .set('idtoken', manager2Token)
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('/v1/trips/:tripId/stages – POST', () => {
    it('Should add a new stage to an INACTIVE trip', done => {
      chai
        .request(server.instance)
        .post(`/v1/trips/${trip2Id}/stages`)
        .set('idtoken', manager1Token)
        .send({
          title: 'new stage',
          description: 'new description',
          price: 500
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Should return an error if the user tries to add a stage to an ACTIVE trip', done => {
      chai
        .request(server.instance)
        .post(`/v1/trips/${trip1Id}/stages`)
        .set('idtoken', manager1Token)
        .send({
          title: 'new stage',
          description: 'new description',
          price: 500
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('Should return an error if the trip belongs to a different user', done => {
      chai
        .request(server.instance)
        .post(`/v1/trips/${trip2Id}/stages`)
        .set('idtoken', manager2Token)
        .send({
          title: 'new stage',
          description: 'new description',
          price: 500
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('/v1/trips/:tripId/stages/:stageId - DELETE', done => {
    it('Should remove a stage from a trip', done => {
      chai
        .request(server.instance)
        .delete(`/v1/trips/${trip2Id}/stages/${stage2Id}`)
        .set('idtoken', manager1Token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Should return an error if the user is not logged in', done => {
      chai
        .request(server.instance)
        .delete(`/v1/trips/${trip1Id}/stages/${stage1Id}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('Should return an error if the user is not the manager of the trip', done => {
      chai
        .request(server.instance)
        .delete(`/v1/trips/${trip2Id}/stages/${stage2Id}`)
        .set('idtoken', manager2Token)
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
  });

  describe('/v1/trips/:tripId - DELETE', () => {
    it('Should remove an INACTIVE trip from the database', async () => {
      // Create a trip to delete
      let tripToDelete = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.delete',
          description: 'test.trip.delete',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToDeleteId = tripToDelete.body.id;

      const response = await chai
        .request(server.instance)
        .delete(`/v1/trips/${tripToDeleteId}`)
        .set('idtoken', manager1Token);
      expect(response).to.have.status(204);
    });

    it('Should return an error if the trip belongs to a different user', async () => {
      // Create a trip to delete
      let tripToDelete = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.delete',
          description: 'test.trip.delete',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToDeleteId = tripToDelete.body.id;

      // Try to delete it logged as a different user
      const response = await chai
        .request(server.instance)
        .delete(`/v1/trips/${tripToDeleteId}`)
        .set('idtoken', manager2Token);
      expect(response).to.have.status(403);
    });

    it('Should return an error if the trip is ACTIVE', async () => {
      // Create a trip to delete
      let tripToDelete = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.delete',
          description: 'test.trip.delete',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToDeleteId = tripToDelete.body.id;

      await tripModel.findOneAndUpdate({ _id: tripToDeleteId }, { state: 'ACTIVE' });

      const response = await chai
        .request(server.instance)
        .delete(`/v1/trips/${tripToDeleteId}`)
        .set('idtoken', manager1Token);
      expect(response).to.have.status(400);
    });
  });

  describe('/v1/trips/:tripId/publish – PATCH', () => {
    it('Should publish an INACTIVE trip', async () => {
      // Create a trip to publish
      let tripToPublish = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.publish',
          description: 'test.trip.publish',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToPublishId = tripToPublish.body.id;

      // Publish it
      const response = await chai
        .request(server.instance)
        .patch(`/v1/trips/${tripToPublishId}/publish`)
        .set('idtoken', manager1Token);
      expect(response).to.have.status(200);
    });

    it('Should return an error if the trip belongs to a different user', async () => {
      // Create a trip to publish
      let tripToPublish = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.publish',
          description: 'test.trip.publish',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToPublishId = tripToPublish.body.id;

      // Try to publish it logged as a different user
      const response = await chai
        .request(server.instance)
        .patch(`/v1/trips/${tripToPublishId}/publish`)
        .set('idtoken', manager2Token);
      expect(response).to.have.status(403);
    });

    it('Should return an error if the trip is ACTIVE', async () => {
      let tripToPublish = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.publish',
          description: 'test.trip.publish',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      // Set the status to ACTIVE
      await tripModel.findOneAndUpdate({ _id: tripToPublish.body.id }, { state: 'ACTIVE' });

      // Try to publish it
      const response = await chai
        .request(server.instance)
        .patch(`/v1/trips/${tripToPublish.body.id}/publish`)
        .set('idtoken', manager1Token);
      expect(response).to.have.status(400);
    });
  });

  describe('/v1/trips/:tripId/cancel -PATCH ', () => {
    it('Should cancel an ACTIVE trip', async () => {
      // Create a trip to cancel
      let tripToCancel = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.cancel',
          description: 'test.trip.cancel',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToCancelId = tripToCancel.body.id;

      // Change the status to ACTIVE
      await tripModel.findOneAndUpdate({ _id: tripToCancelId }, { state: 'ACTIVE' });

      // Cancel it
      const response = await chai
        .request(server.instance)
        .patch(`/v1/trips/${tripToCancelId}/cancel?reasonCancelled=late`)
        .set('idtoken', manager1Token);
      expect(response).to.have.status(200);
    });

    it('Should return an error if the trip belongs to a different user', async () => {
      // Create a trip to cancel
      let tripToCancel = await chai
        .request(server.instance)
        .post('/v1/trips')
        .set('idtoken', manager1Token)
        .send({
          title: 'test.trip.cancel',
          description: 'test.trip.cancel',
          requirements: ['new requirement'],
          startDate: '2023-01-01',
          endDate: '2023-01-09',
          stages: [
            {
              title: 'stage 1',
              description: 'sample description',
              price: 500
            }
          ]
        });

      let tripToCancelId = tripToCancel.body.id;

      // Change the status to ACTIVE
      await tripModel.findOneAndUpdate({ _id: tripToCancelId }, { state: 'ACTIVE' });

      // Try to cancel it logged in as a different user
      const response = await chai
        .request(server.instance)
        .patch(`/v1/trips/${tripToCancelId}/cancel?reasonCancelled=late`)
        .set('idtoken', manager2Token);
      expect(response).to.have.status(403);
    });
  });
});

const cleanTestDatabase = async () => {
  await tripModel.deleteMany({ title: /.*test.trip.*/i });
  await actorModel.deleteMany({ email: /.*test.*/i });
};
