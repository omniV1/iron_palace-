import { ObjectId } from "mongodb";
import { getDb, getBucket } from "./mongo.js";
import { readRawBody } from "./body.js";

export const MAX_UPLOAD = 4 * 1024 * 1024; // 4 MB — Vercel Hobby request body cap is 4.5 MB

/** @type {Record<string, import("./storage.js").BucketConfig>} */
export const BUCKETS = {
  gallery: {
    name: "gallery",
    listKey: "photos",
    itemKey: "photo",
    urlPrefix: "/api/gallery",
    imagesOnly: true,
    buildMetadata(headers, filename) {
      const caption = headers["x-caption"] ? decodeURIComponent(headers["x-caption"]) : "";
      return { caption };
    },
    serialize(file, config) {
      return {
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.metadata?.contentType ?? file.contentType ?? "application/octet-stream",
        caption: file.metadata?.caption ?? "",
        size: file.length,
        uploadedAt: file.uploadDate,
        url: `${config.urlPrefix}/${file._id.toString()}`,
      };
    },
  },
  library: {
    name: "library",
    listKey: "files",
    itemKey: "file",
    urlPrefix: "/api/library",
    imagesOnly: false,
    buildMetadata(headers, filename) {
      const title = headers["x-title"] ? decodeURIComponent(headers["x-title"]) : filename;
      const description = headers["x-description"] ? decodeURIComponent(headers["x-description"]) : "";
      return { title, description };
    },
    serialize(file, config) {
      return {
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.metadata?.contentType ?? file.contentType ?? "application/octet-stream",
        title: file.metadata?.title ?? file.filename,
        description: file.metadata?.description ?? "",
        size: file.length,
        uploadedAt: file.uploadDate,
        url: `${config.urlPrefix}/${file._id.toString()}`,
      };
    },
  },
};

export function getBucketConfig(name) {
  const config = BUCKETS[name];
  if (!config) {
    const err = new Error("invalid bucket");
    err.statusCode = 400;
    throw err;
  }
  return config;
}

export function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

export function safeFilename(name) {
  return String(name || "download").replace(/[\r\n"\\]/g, "_");
}

async function hasFileChunks(bucketName, id) {
  const db = await getDb();
  const chunk = await db.collection(`${bucketName}.chunks`).findOne({ files_id: id });
  return chunk != null;
}

export async function listFiles(config) {
  const db = await getDb();
  const files = await db
    .collection(`${config.name}.files`)
    .aggregate([
      { $sort: { uploadDate: -1 } },
      {
        $lookup: {
          from: `${config.name}.chunks`,
          localField: "_id",
          foreignField: "files_id",
          as: "_chunks",
        },
      },
      { $match: { "_chunks.0": { $exists: true } } },
      { $project: { _chunks: 0 } },
    ])
    .toArray();

  return files.map((file) => config.serialize(file, config));
}

export async function uploadFile(config, req) {
  const contentType = req.headers["content-type"] || "application/octet-stream";
  if (config.imagesOnly && !contentType.startsWith("image/")) {
    const err = new Error("only image uploads are allowed in the gallery");
    err.statusCode = 415;
    throw err;
  }

  const filename = decodeURIComponent(req.headers["x-filename"] || "upload");
  const extraMeta = config.buildMetadata(req.headers, filename);
  const buf = await readRawBody(req, MAX_UPLOAD);
  const bucket = await getBucket(config.name);
  const uploadStream = bucket.openUploadStream(filename, {
    contentType,
    metadata: { contentType, ...extraMeta },
  });

  await new Promise((resolve, reject) => {
    uploadStream.on("error", reject);
    uploadStream.on("finish", resolve);
    uploadStream.end(buf);
  });

  const db = await getDb();
  return db.collection(`${config.name}.files`).findOne({ _id: uploadStream.id });
}

export async function getFileDoc(config, id) {
  const db = await getDb();
  return db.collection(`${config.name}.files`).findOne({ _id: id });
}

export async function streamFile(config, id, res, { download = false } = {}) {
  const file = await getFileDoc(config, id);
  if (!file) return null;
  if (!(await hasFileChunks(config.name, id))) return null;

  const contentType = file.metadata?.contentType ?? file.contentType ?? "application/octet-stream";
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(file.length));
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");

  if (config.name === "library") {
    const disposition = download ? "attachment" : "inline";
    res.setHeader("Content-Disposition", `${disposition}; filename="${safeFilename(file.filename)}"`);
  }

  const bucket = await getBucket(config.name);
  await new Promise((resolve, reject) => {
    bucket
      .openDownloadStream(id)
      .on("error", (err) => {
        console.error(`[api/storage/${config.name}] stream`, err);
        reject(err);
      })
      .pipe(res)
      .on("finish", resolve)
      .on("error", reject);
  });
  return file;
}

export async function deleteFile(config, id) {
  const bucket = await getBucket(config.name);
  await bucket.delete(id);
}
