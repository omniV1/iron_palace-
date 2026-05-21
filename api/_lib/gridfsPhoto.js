import { ObjectId } from "mongodb";
import { getBucket, getDb } from "./mongo.js";

function toObjectId(id) {
  return id instanceof ObjectId ? id : new ObjectId(String(id));
}

export async function uploadPhoto(bucketName, buffer, { filename, contentType, metadata = {} }) {
  const bucket = await getBucket(bucketName);
  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
    metadata: { contentType, ...metadata },
  });

  await new Promise((resolve, reject) => {
    uploadStream.on("error", reject);
    uploadStream.on("finish", resolve);
    uploadStream.end(buffer);
  });

  return uploadStream.id;
}

export async function streamPhoto(bucketName, id, res) {
  const objectId = toObjectId(id);
  const db = await getDb();
  const file = await db.collection(`${bucketName}.files`).findOne({ _id: objectId });
  if (!file) return null;

  const contentType = file.metadata?.contentType ?? file.contentType ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(file.length));
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");

  const bucket = await getBucket(bucketName);
  bucket.openDownloadStream(objectId).on("error", (err) => {
    console.error(`[gridfsPhoto] stream ${bucketName}`, err);
    if (!res.headersSent) res.end();
  }).pipe(res);

  return file;
}

export async function deletePhotoById(bucketName, id) {
  if (!id) return;
  const bucket = await getBucket(bucketName);
  await bucket.delete(toObjectId(id));
}
