import dotenv from 'dotenv';
import { Server } from './config/server.js';

dotenv.config();

const server = new Server();

server.execute();

export default server;
