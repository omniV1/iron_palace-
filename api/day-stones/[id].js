import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { sendError } from "../_lib/respond.js";
import {
  COLLECTION,
  parseObjectId,
  deleteEntryPhoto,
} from "../_lib/dayStones.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", "DELETE");
      return res.status(405).json({ error: "method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const id = parseObjectId(req.query.id);
    const db = await getDb();
    const col = db.collection(COLLECTION);
    const entry = await col.findOne({ _id: id });
    if (!entry) return res.status(404).json({ error: "not found" });

    if (entry.photoId) {
      await deleteEntryPhoto(entry.photoId);
    }

    const result = await col.deleteOne({ _id: id });
    if (!result.deletedCount) return res.status(404).json({ error: "not found" });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return sendError(res, err, "[api/day-stones/[id]]");
  }
}
