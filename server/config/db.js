import mongoose from "mongoose";

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null };
}

const cache = globalCache._mongooseCache;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI no está definido");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log("✅ MongoDB conectado");
        return m;
      });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    console.error("❌ No se pudo conectar a MongoDB:", error.message);
    throw error;
  }

  return cache.conn;
};

export default connectDB;
