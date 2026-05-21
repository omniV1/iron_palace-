import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readRawBody } from "../_lib/body.js";
import { streamPhoto, uploadPhoto } from "../_lib/gridfsPhoto.js";
import {
  COLLECTION,
  PHOTO_BUCKET,
  deleteEntryPhoto,
  parseObjectId,
  serializeEntry,
} from "./_lib.js";

export const config = {
  api: { bodyParser: false },
};

const MAX_UPLOAD = 4 * 1024 * 1024;

function routeSegments(req) {
  const path = req.query.path;
  if (Array.isArray(path)) return path;
  if (typeof path === "string" && path.length > 0) return [path];
  return [];
}

async function handlePhotoStream(req, res, photoIdRaw) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method not allowed" });
  }

  const photoId = parseObjectId(photoIdRaw);
  const file = await streamPhoto(PHOTO_BUCKET, photoId, res);
  if (!file) return res.status(404).json({ error: "not found" });
}

async function handleEntryPhoto(req, res, entryIdRaw) {
  const entryId = parseObjectId(entryIdRaw);
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
    const buf = await readRawBody(req, MAX_UPLOAD);
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

async function handleDeleteEntry(req, res, entryIdRaw) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "method not allowed" });
  }

  if (!requireAdmin(req, res)) return;

  const id = parseObjectId(entryIdRaw);
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
}

export default async function handler(req, res) {
  try {
    const parts = routeSegments(req);

    if (parts.length === 2 && parts[0] === "photos") {
      return handlePhotoStream(req, res, parts[1]);
    }

    if (parts.length === 2 && parts[1] === "photo") {
      return handleEntryPhoto(req, res, parts[0]);
    }

    if (parts.length === 1) {
      return handleDeleteEntry(req, res, parts[0]);
    }

    return res.status(404).json({ error: "not found" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones/[...path]]", err);
    if (!res.headersSent) {
      return res.status(status).json({ error: err.message || "server error" });
    }
  }
}
