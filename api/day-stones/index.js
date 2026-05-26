import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";
import { COLLECTION, normalizeEntry, serializeEntry } from "./_lib.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (req.method === "GET") {
      const docs = await col.find({}).sort({ liftedAt: 1, createdAt: 1 }).toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ entries: docs.map(serializeEntry) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const data = normalizeEntry(body);
      const now = new Date();
      const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
      const doc = await col.findOne({ _id: result.insertedId });
      return res.status(201).json({ entry: serializeEntry(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
