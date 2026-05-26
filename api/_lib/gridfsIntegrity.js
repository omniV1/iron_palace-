import { getBucket, getDb } from "./mongo.js";

export async function hasFileChunks(bucketName, id) {
  const db = await getDb();
  const chunk = await db.collection(`${bucketName}.chunks`).findOne({ files_id: id });
  return chunk != null;
}

export async function verifyUploadedFile(bucketName, id, expectedLength) {
  const db = await getDb();
  const file = await db.collection(`${bucketName}.files`).findOne({ _id: id });
  if (!file) return null;
  if (!(await hasFileChunks(bucketName, id))) return null;
  if (expectedLength != null && file.length !== expectedLength) return null;
  return file;
}

export async function rollbackUpload(bucketName, id) {
  if (!id) return;
  try {
    const bucket = await getBucket(bucketName);
    await bucket.delete(id);
  } catch (err) {
    console.error(`[gridfs] rollback ${bucketName}/${id}`, err);
  }
}

/** Remove metadata-only GridFS entries left by interrupted uploads. */
export async function cleanupOrphanedFiles(bucketName) {
  const db = await getDb();
  const orphans = await db
    .collection(`${bucketName}.files`)
    .aggregate([
      {
        $lookup: {
          from: `${bucketName}.chunks`,
          localField: "_id",
          foreignField: "files_id",
          as: "_chunks",
        },
      },
      { $match: { "_chunks.0": { $exists: false } } },
      { $project: { _id: 1 } },
    ])
    .toArray();

  if (!orphans.length) return 0;

  const bucket = await getBucket(bucketName);
  for (const { _id } of orphans) {
    try {
      await bucket.delete(_id);
    } catch (err) {
      console.error(`[gridfs] cleanup orphan ${bucketName}/${_id}`, err);
    }
  }
  return orphans.length;
}

export function uploadIntegrityError(message = "upload did not complete") {
  const err = new Error(message);
  err.statusCode = 500;
  return err;
}
