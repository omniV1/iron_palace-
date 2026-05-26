import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readJsonBody, readRawBody } from "../_lib/body.js";
import { uploadPhoto, streamPhotoFromBuckets } from "../_lib/gridfsPhoto.js";
import { sendError } from "../_lib/respond.js";
import {
  COLLECTION,
  PHOTO_BUCKET,
  PHOTO_READ_BUCKETS,
  MAX_PHOTO_UPLOAD,
  normalizeEntry,
  serializeEntry,
  parseObjectId,
  deleteEntryPhoto,
} from "../_lib/dayStones.js";

export const config = {
  api: { bodyParser: false },
};

function getSlug(req) {
  const raw = req.query.slug;
  if (raw == null || raw === "") return [];
  const parts = Array.isArray(raw) ? raw : [raw];
  return parts.flatMap((segment) => String(segment).split("/").filter(Boolean));
}

export default async function handler(req, res) {
  try {
    const slug = getSlug(req);
    const db = await getDb();
    const col = db.collection(COLLECTION);

    if (slug.length === 0) {
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
    }

    if (slug.length === 1) {
      const id = parseObjectId(slug[0]);

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
    }

    if (slug.length === 2 && slug[1] === "photo") {
      const entryId = parseObjectId(slug[0]);

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
        const photoId = await uploadPhoto(PHOTO_BUCKET, buf, {
          filename,
          contentType,
          metadata: { entryId: entryId.toString() },
        });

        if (entry.photoId) {
          await deleteEntryPhoto(entry.photoId);
        }

        const now = new Date();
        const result = await col.findOneAndUpdate(
          { _id: entryId },
          { $set: { photoId, updatedAt: now } },
          { returnDocument: "after" },
        );
        const doc = result?.value ?? result;
        return res.status(200).json({ entry: serializeEntry(doc) });
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
    }

    if (slug.length === 2 && slug[0] === "photos" && req.method === "GET") {
      const photoId = parseObjectId(slug[1]);
      const file = await streamPhotoFromBuckets(PHOTO_READ_BUCKETS, photoId, res);
      if (!file) return res.status(404).json({ error: "not found" });
      return;
    }

    return res.status(404).json({ error: "not found" });
  } catch (err) {
    if (res.headersSent) return;
    return sendError(res, err, "[api/day-stones]");
  }
}
