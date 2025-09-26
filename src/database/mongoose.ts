import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (uri: string): Promise<typeof mongoose> => {
  if (!uri) {
    throw new Error('MongoDB connection URI is not configured');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error: unknown) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (connectionPromise) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
};

export const getConnection = () => mongoose.connection;
