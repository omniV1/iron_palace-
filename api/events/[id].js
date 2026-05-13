import { ObjectId } from "mongodb";
import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";

function serialize(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const id = parseId(req.query.id);
    const db = await getDb();
    const col = db.collection("events");

    if (req.method === "PUT" || req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;
      const body = await readJsonBody(req);
      const update = {};
      for (const key of ["title", "date", "time", "location", "description"]) {
        if (typeof body?.[key] === "string") update[key] = body[key].trim();
      }
      if (!Object.keys(update).length) {
        return res.status(400).json({ error: "no fields to update" });
      }
      update.updatedAt = new Date();
      const result = await col.findOneAndUpdate(
        { _id: id },
        { $set: update },
        { returnDocument: "after" }
      );
      const doc = result?.value ?? result;
      if (!doc) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ event: serialize(doc) });
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const result = await col.deleteOne({ _id: id });
      if (!result.deletedCount) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "PUT, PATCH, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/events/[id]]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
