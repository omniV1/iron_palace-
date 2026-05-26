import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody } from "../_lib/body.js";
import { sendError } from "../_lib/respond.js";
import { COLLECTION, parseEventId, serializeEvent } from "../_lib/events.js";

export default async function handler(req, res) {
  try {
    const id = parseEventId(req.query.id);
    const db = await getDb();
    const col = db.collection(COLLECTION);

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
        { returnDocument: "after" },
      );
      const doc = result?.value ?? result;
      if (!doc) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ event: serializeEvent(doc) });
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
    return sendError(res, err, "[api/events/[id]]");
  }
}
