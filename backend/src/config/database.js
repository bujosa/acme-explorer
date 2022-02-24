import mongoose from 'mongoose';

export const dbConnection = async () => {
  const mongoDBHostname = process.env.DB_HOSTNAME || 'localhost';
  const mongoDBPort = process.env.DB_PORT || '27017';
  const mongoDBName = process.env.DB_NAME || 'ACME-Explorer';
  const mongoDBURI = process.env.DB_URI || 'mongodb://' + mongoDBHostname + ':' + mongoDBPort + '/' + mongoDBName;

  try {
    mongoose.connect(mongoDBURI, {
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // skip trying IPv6
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    throw new Error('Error on data base connections');
  }
};

export const dbClose = () => {
  return mongoose.connection.close();
};
