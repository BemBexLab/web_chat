import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
      maxPoolSize: 10, // Optimize for Vercel cold starts
      minPoolSize: 1,
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Indexes are automatically created from model schemas
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Keep single connection for Vercel serverless
let cachedConn = null;
export const getDB = () => {
  if (cachedConn && cachedConn.connection.readyState === 1) {
    return cachedConn;
  }
  return null;
};
