import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js to use public DNS servers (fixes SRV query issues on local networks/ISPs)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(
      'Server will keep running, but any database operation will fail until MongoDB is reachable.\n' +
      'Make sure MONGO_URI in your .env is correct and that MongoDB (local or Atlas) is running/accessible.'
    );
    throw error;
  }
};

export default connectDB;