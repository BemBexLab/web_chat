import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Optimize for Vercel cold starts
      minPoolSize: 1,
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Create indexes on connection
    const Chat = makeDb().model('Chat');
    if (Chat) {
      Chat.collection.createIndexes().catch(err => console.error('Index creation error:', err));
    }
    
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
