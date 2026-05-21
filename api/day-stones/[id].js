import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { COLLECTION, deleteEntryPhoto, parseObjectId, serializeEntry } from "./_lib.js";

export default async function handler(req, res) {
  try {
    const id = parseObjectId(req.query.id);
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const entry = await col.findOne({ _id: id });
      if (!entry) return res.status(404).json({ error: "not found" });

      if (entry.photoId) {
        await deleteEntryPhoto(entry.photoId);
      }

      const result = await col.deleteOne({ _id: id });
      if (!result.deletedCount) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones/[id]]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
