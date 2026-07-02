import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not defined. Database operations will fail.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Safely extract hostname for logging to protect passwords in URI
    const hostLog = MONGODB_URI.includes('@') 
      ? MONGODB_URI.split('@').pop().split('/')[0] 
      : MONGODB_URI.split('//').pop().split('/')[0];
    
    console.log(`🔌 Database: Connecting to MongoDB host [${hostLog}]...`);

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('🎉 Database: MongoDB connected successfully!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
