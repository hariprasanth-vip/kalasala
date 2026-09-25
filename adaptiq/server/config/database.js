const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adaptiq';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if local mongo isn't active
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Warning: ${error.message}`);
    console.warn(`💡 Running in resilient mode. Database operations will attempt to reconnect or use in-memory fallback.`);
    isConnected = false;
    return null;
  }
};

const getDbStatus = () => isConnected;

module.exports = {
  connectDB,
  getDbStatus
};
