# Acme Explorer

> Acme Explorer web application to manage custom trips for explorers. 

* [![Build Status](https://github.com/acme-explorer/acme-explorer/workflows/CI%20Backend/badge.svg)](https://github.com/acme-explorer/acme-explorer/actions)
* [![Build Status](https://github.com/acme-explorer/acme-explorer/workflows/CI%20Frontend/badge.svg)](https://github.com/acme-explorer/acme-explorer/actions)


* Live: [http://acme.0aps.fl.neosllc.org/](http://acme.0aps.fl.neosllc.org/)
* Docs: [http://acme.0aps.fl.neosllc.org/docs](http://acme.0aps.fl.neosllc.org/docs)

## System requirements

* Docker 20.0+
* Node.js 16.0+
* MongoDB 5.0+

## Instructions

1. Clone repository:

   Assuming you have `git` installed and available in your shell's path, run: `git clone <repository>`.

2. Copy `.env.example` file into `.env` file for the `backend` directory. Fill the relevant fields in it. Here is an example:

    ```dotenv
    NAME=acme-explorer
    PORT=3000
    ```

3. The recommended approach to run the whole project (both backend/frontend) is by using docker, just do:

   ```sh
   docker-compose up gateway
   ```
   This is going to create a ready machine for the `frontend`, `backend`, `redis` and `mongo` where all packages are going to be installed. After that just navigate to localhost.

Alternatively check the README for the `backend` or `frontend` directory if you want to run them individually. 

## Basic use
To start the local server, run the command:
   ```
   docker-compose up backend
   ```

## Documentation
The API is documented with Swagger. Check it out on: `http://localhost:3000/docs/`.

## Populate
When the container is created, the database is populated with some actors (all roles), trips, configuration, sponsorships and finders. By default, the users are (password: abc123):

- explorer@test.com
- manager@test.com
- sponsor@test.com
- admin@test.com

## Tips

You can login (get the `idToken` from firebase without the frontend) by doing the following:
   ```
   POST: https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=[FIREBASE_API_KEY]
   Body: {
      "token": "[customToken from login endpoint]",
      "returnSecureToken": true
   }
   ```

Please see the following [video for an example](https://drive.google.com/file/d/1031sq77T37m6ZO1Etd09oMV9nWmXomYi/view?usp=sharing).

## Troubleshooting
If when starting the container, an error appears indicating that there is a package/library missing, run the following command in a different command shell and install the missing packages.
   ```
   docker exec -it backend sh
   ```

If you have mongo installed in your local machine, there may be collissions when trying to use MongoDBCompass. If you wishto use mongoDBCompass, replace the port 27017:27017 with 27018:27017 in the docker-compose.yml. To connect with the database in MongoDBCompass:
   ```
   mongodb://admin:explorer123@127.0.0.1:27018
   ```

## Additional Info

Some endpoints were separated in two different endpoints to only allow certain roles. For example, operations on `/v1/applications` are only allowed if the actor is an admin. An additional endpoint called `/v1/applications/apply` was created to allow explorers to apply to a trip, which made validating data a lot easier and more streamlined on both endpoints. Other examples may be `/v1/actors` as a private, admin only endpoint; and `/v1/login` and `/v1/register` as public endpoints.
