import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";

function serialize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function normalizeEvent(input) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const date = typeof input?.date === "string" ? input.date.trim() : "";
  if (!title) {
    const err = new Error("title is required");
    err.statusCode = 400;
    throw err;
  }
  if (!date) {
    const err = new Error("date is required");
    err.statusCode = 400;
    throw err;
  }
  return {
    title,
    date,
    time: typeof input?.time === "string" ? input.time.trim() : "",
    location: typeof input?.location === "string" ? input.location.trim() : "",
    description: typeof input?.description === "string" ? input.description.trim() : "",
  };
}

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const col = db.collection("events");

    if (req.method === "GET") {
      const docs = await col.find({}).sort({ date: 1, createdAt: 1 }).toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ events: docs.map(serialize) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const data = normalizeEvent(body);
      const now = new Date();
      const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
      const doc = await col.findOne({ _id: result.insertedId });
      return res.status(201).json({ event: serialize(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/events]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
