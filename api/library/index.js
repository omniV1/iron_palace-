import { getDb, getBucket } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readRawBody } from "../_lib/body.js";

export const config = {
  api: { bodyParser: false },
};

const BUCKET = "library";
const MAX_UPLOAD = 4 * 1024 * 1024; // 4 MB — Vercel Hobby request body cap is 4.5 MB

function serializeFile(file) {
  return {
    id: file._id.toString(),
    filename: file.filename,
    contentType: file.metadata?.contentType ?? file.contentType ?? "application/octet-stream",
    title: file.metadata?.title ?? file.filename,
    description: file.metadata?.description ?? "",
    size: file.length,
    uploadedAt: file.uploadDate,
    url: `/api/library/${file._id.toString()}`,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const db = await getDb();
      const files = await db
        .collection(`${BUCKET}.files`)
        .find({})
        .sort({ uploadDate: -1 })
        .toArray();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ files: files.map(serializeFile) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;

      const contentType = req.headers["content-type"] || "application/octet-stream";
      const filename = decodeURIComponent(req.headers["x-filename"] || "upload");
      const title = req.headers["x-title"] ? decodeURIComponent(req.headers["x-title"]) : filename;
      const description = req.headers["x-description"] ? decodeURIComponent(req.headers["x-description"]) : "";

      const buf = await readRawBody(req, MAX_UPLOAD);
      const bucket = await getBucket(BUCKET);
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: { contentType, title, description },
      });

      await new Promise((resolve, reject) => {
        uploadStream.on("error", reject);
        uploadStream.on("finish", resolve);
        uploadStream.end(buf);
      });

      const db = await getDb();
      const doc = await db.collection(`${BUCKET}.files`).findOne({ _id: uploadStream.id });
      return res.status(201).json({ file: serializeFile(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/library]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
