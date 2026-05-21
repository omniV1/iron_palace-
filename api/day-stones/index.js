import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";

function serialize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function normalizeEntry(input) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const category = typeof input?.category === "string" ? input.category.trim() : "";
  const liftedAt = typeof input?.liftedAt === "string" ? input.liftedAt.trim() : "";

  if (!name) {
    const err = new Error("name is required");
    err.statusCode = 400;
    throw err;
  }
  if (category !== "straps" && category !== "no_straps") {
    const err = new Error("category must be straps or no_straps");
    err.statusCode = 400;
    throw err;
  }
  if (!liftedAt) {
    const err = new Error("liftedAt is required");
    err.statusCode = 400;
    throw err;
  }

  return {
    name,
    category,
    liftedAt,
    notes: typeof input?.notes === "string" ? input.notes.trim() : "",
  };
}

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const col = db.collection("day_stones");

    if (req.method === "GET") {
      const docs = await col.find({}).sort({ liftedAt: 1, createdAt: 1 }).toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ entries: docs.map(serialize) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const data = normalizeEntry(body);
      const now = new Date();
      const result = await col.insertOne({ ...data, createdAt: now, updatedAt: now });
      const doc = await col.findOne({ _id: result.insertedId });
      return res.status(201).json({ entry: serialize(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
