import { getDb } from "../../_lib/mongo.js";
import { requireAdmin } from "../../_lib/auth.js";
import { readRawBody } from "../../_lib/body.js";
import { uploadPhoto } from "../../_lib/gridfsPhoto.js";
import { rollbackUpload } from "../../_lib/gridfsIntegrity.js";
import { sendError } from "../../_lib/respond.js";
import {
  COLLECTION,
  PHOTO_BUCKET,
  MAX_PHOTO_UPLOAD,
  serializeEntry,
  parseObjectId,
  deleteEntryPhoto,
} from "../../_lib/dayStones.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  try {
    const entryId = parseObjectId(req.query.id);
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;

      const contentType = req.headers["content-type"] || "application/octet-stream";
      if (!contentType.startsWith("image/")) {
        return res.status(415).json({ error: "only image uploads are allowed" });
      }

      const entry = await col.findOne({ _id: entryId });
      if (!entry) return res.status(404).json({ error: "not found" });

      const filename = decodeURIComponent(req.headers["x-filename"] || "lifter-photo");
      const buf = await readRawBody(req, MAX_PHOTO_UPLOAD);
      const oldPhotoId = entry.photoId;
      let photoId;

      try {
        photoId = await uploadPhoto(PHOTO_BUCKET, buf, {
          filename,
          contentType,
          metadata: { entryId: entryId.toString() },
        });

        const now = new Date();
        const result = await col.findOneAndUpdate(
          { _id: entryId },
          { $set: { photoId, updatedAt: now } },
          { returnDocument: "after" },
        );
        const doc = result?.value ?? result;
        if (!doc) {
          await rollbackUpload(PHOTO_BUCKET, photoId);
          return res.status(404).json({ error: "not found" });
        }

        if (oldPhotoId) {
          await deleteEntryPhoto(oldPhotoId);
        }

        return res.status(200).json({ entry: serializeEntry(doc) });
      } catch (uploadErr) {
        if (photoId) await rollbackUpload(PHOTO_BUCKET, photoId);
        throw uploadErr;
      }
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;

      const entry = await col.findOne({ _id: entryId });
      if (!entry) return res.status(404).json({ error: "not found" });
      if (!entry.photoId) return res.status(404).json({ error: "no photo on this entry" });

      await deleteEntryPhoto(entry.photoId);
      const now = new Date();
      const result = await col.findOneAndUpdate(
        { _id: entryId },
        { $unset: { photoId: "" }, $set: { updatedAt: now } },
        { returnDocument: "after" },
      );
      const doc = result?.value ?? result;
      return res.status(200).json({ entry: serializeEntry(doc) });
    }

    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    if (res.headersSent) return;
    return sendError(res, err, "[api/day-stones/[id]/photo]");
  }
}
