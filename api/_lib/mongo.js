/**
 * Cached MongoDB client + GridFS buckets. Vercel keeps warm function instances
 * around between invocations, so caching the client on the global object avoids
 * a fresh TLS handshake on every request.
 */
import { MongoClient, GridFSBucket } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "ironpalace";

if (!URI) {
  console.warn("[api] MONGODB_URI is not set — Mongo-backed endpoints will fail until it is configured.");
}

const cache = globalThis.__ipMongo ?? (globalThis.__ipMongo = { client: null, promise: null });

async function getClient() {
  if (cache.client) return cache.client;
  if (!URI) {
    const err = new Error("MONGODB_URI is not configured");
    err.statusCode = 503;
    throw err;
  }
  if (!cache.promise) {
    cache.promise = MongoClient.connect(URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    }).then((client) => {
      cache.client = client;
      return client;
    }).catch((err) => {
      cache.promise = null;
      throw err;
    });
  }
  return cache.promise;
}

export async function getDb() {
  const client = await getClient();
  return client.db(DB_NAME);
}

export async function getBucket(name) {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: name });
}
