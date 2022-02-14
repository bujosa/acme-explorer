# Acme Explorer

> Acme Explorer web application to manage custom trips for explorers. 

* [![Build Status](https://github.com/acme-explorer/acme-explorer/workflows/CI%20Backend/badge.svg)](https://github.com/acme-explorer/acme-explorer/actions)
* [![Build Status](https://github.com/acme-explorer/acme-explorer/workflows/CI%20Frontend/badge.svg)](https://github.com/acme-explorer/acme-explorer/actions)

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