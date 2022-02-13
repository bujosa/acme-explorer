import mongoose from 'mongoose';
import dotenv from 'dotenv';
import App from './app.js';
import * as apps from './modules/index.js';

dotenv.config();

const app = App.create({
  apps,
  mongoose
});

await app.start();

export default app;
