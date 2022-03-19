import dotenv from 'dotenv';
import { Server } from './config/server.js';

dotenv.config();

const server = new Server();

server.execute();
server.createDataWareHouseJob();

export default server;
