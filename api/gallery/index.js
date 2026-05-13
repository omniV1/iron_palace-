import { getDb, getBucket } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";
import { readRawBody } from "../_lib/body.js";

export const config = {
  api: { bodyParser: false },
};

const BUCKET = "gallery";
const MAX_UPLOAD = 4 * 1024 * 1024; // 4 MB — Vercel Hobby request body cap is 4.5 MB

function serializeFile(file) {
  return {
    id: file._id.toString(),
    filename: file.filename,
    contentType: file.metadata?.contentType ?? file.contentType ?? "application/octet-stream",
    caption: file.metadata?.caption ?? "",
    size: file.length,
    uploadedAt: file.uploadDate,
    url: `/api/gallery/${file._id.toString()}`,
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
      return res.status(200).json({ photos: files.map(serializeFile) });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;

      const contentType = req.headers["content-type"] || "application/octet-stream";
      if (!contentType.startsWith("image/")) {
        return res.status(415).json({ error: "only image uploads are allowed in the gallery" });
      }

      const filename = decodeURIComponent(req.headers["x-filename"] || "upload");
      const caption = req.headers["x-caption"] ? decodeURIComponent(req.headers["x-caption"]) : "";

      const buf = await readRawBody(req, MAX_UPLOAD);
      const bucket = await getBucket(BUCKET);
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: { contentType, caption },
      });

      await new Promise((resolve, reject) => {
        uploadStream.on("error", reject);
        uploadStream.on("finish", resolve);
        uploadStream.end(buf);
      });

      const db = await getDb();
      const doc = await db.collection(`${BUCKET}.files`).findOne({ _id: uploadStream.id });
      return res.status(201).json({ photo: serializeFile(doc) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/gallery]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
