import { ObjectId } from "mongodb";
import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";
import { sendError } from "../_lib/respond.js";

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

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

function getSlug(req) {
  const raw = req.query.slug;
  if (raw == null || raw === "") return [];
  return Array.isArray(raw) ? raw : [raw];
}

export default async function handler(req, res) {
  try {
    const slug = getSlug(req);
    const db = await getDb();
    const col = db.collection("events");

    if (slug.length === 0) {
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
    }

    if (slug.length === 1) {
      const id = parseId(slug[0]);

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
    }

    return res.status(404).json({ error: "not found" });
  } catch (err) {
    return sendError(res, err, "[api/events]");
  }
}
