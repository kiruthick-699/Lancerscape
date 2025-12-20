import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI || "";

if (!DATABASE_URL) {
  console.warn("[db] DATABASE_URL/MONGODB_URI is not set. Database connections will fail.");
}

let cached = (global as any)._mongooseConn as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
if (!cached) {
  cached = (global as any)._mongooseConn = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(DATABASE_URL, {
        // Use modern connection options
        autoIndex: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export function disconnectDB(): Promise<void> {
  if (cached.conn) {
    cached.conn = null;
    cached.promise = null;
    return mongoose.disconnect();
  }
  return Promise.resolve();
}
