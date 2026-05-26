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

async function hasFileChunks(bucketName, id) {
  const db = await getDb();
  const chunk = await db.collection(`${bucketName}.chunks`).findOne({ files_id: id });
  return chunk != null;
}

export async function findPhotoFile(id, bucketNames) {
  const objectId = toObjectId(id);
  const db = await getDb();

  for (const bucketName of bucketNames) {
    const file = await db.collection(`${bucketName}.files`).findOne({ _id: objectId });
    if (file && (await hasFileChunks(bucketName, objectId))) {
      return { file, bucketName };
    }
  }

  return null;
}

export async function streamPhoto(bucketName, id, res) {
  return streamPhotoFromBuckets([bucketName], id, res);
}

export async function streamPhotoFromBuckets(bucketNames, id, res) {
  const objectId = toObjectId(id);
  const found = await findPhotoFile(objectId, bucketNames);
  if (!found) return null;

  const { file, bucketName } = found;
  const contentType = file.metadata?.contentType ?? file.contentType ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(file.length));
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");

  const bucket = await getBucket(bucketName);
  await new Promise((resolve, reject) => {
    bucket
      .openDownloadStream(objectId)
      .on("error", (err) => {
        console.error(`[gridfsPhoto] stream ${bucketName}`, err);
        reject(err);
      })
      .pipe(res)
      .on("finish", resolve)
      .on("error", reject);
  });

  return file;
}

export async function deletePhotoById(bucketName, id) {
  if (!id) return;
  const bucket = await getBucket(bucketName);
  await bucket.delete(toObjectId(id));
}

export async function deletePhotoFromBuckets(bucketNames, id) {
  const found = await findPhotoFile(id, bucketNames);
  if (!found) return false;
  await deletePhotoById(found.bucketName, id);
  return true;
}
