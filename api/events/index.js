import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";
import { sendError } from "../_lib/respond.js";
import { COLLECTION, normalizeEvent, serializeEvent } from "../_lib/events.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (req.method === "GET") {
      const docs = await col.find({}).sort({ date: 1, createdAt: 1 }).toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ events: docs.map(serializeEvent) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const data = normalizeEvent(body);
      const now = new Date();
      const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
      const doc = await col.findOne({ _id: result.insertedId });
      return res.status(201).json({ event: serializeEvent(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    return sendError(res, err, "[api/events]");
  }
}
