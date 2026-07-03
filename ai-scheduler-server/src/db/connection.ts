import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

export const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(ENV.MONGO_URL);
  return mongoose.connection;
};

export const disconnectMongo = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
