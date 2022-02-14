# Acme-Explorer backend

> Manage custom trips for explorers. Provides all API logic to support the system transactions.

* [![Build Status](https://github.com/acme-explorer/acme-explorer/workflows/CI%20Backend/badge.svg)](https://github.com/acme-explorer/acme-explorer/actions)

## System requirements

* Node.js 16.0+
* MongoDB 5.0+

## Instructions

1. Clone repository:

   Assuming you have `git` installed and available in your shell's path, run: `git clone <repository>`.

2. Install project requirements in the project root directory.

   ```sh
   npm install
   ```

3. Copy `.env.example` file into `.env` file. Fill the relevant fields in it. Here is an example:

    ```dotenv
    NAME=acme-explorer
    PORT=3000
    ```
4. Start the web server:

   ```sh
   npm start
   ```

5. (Optional) if you prefer using docker to run the project, you can do:

   ```sh
   docker-compose up backend
   ```

