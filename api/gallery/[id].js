import { ObjectId } from "mongodb";
import { getDb, getBucket } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";

const BUCKET = "gallery";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const id = parseId(req.query.id);
    const db = await getDb();
    const file = await db.collection(`${BUCKET}.files`).findOne({ _id: id });
    if (!file) return res.status(404).json({ error: "not found" });

    if (req.method === "GET") {
      const contentType = file.metadata?.contentType ?? file.contentType ?? "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", String(file.length));
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      const bucket = await getBucket(BUCKET);
      bucket.openDownloadStream(id).on("error", (err) => {
        console.error("[api/gallery/[id]] stream", err);
        res.end();
      }).pipe(res);
      return;
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const bucket = await getBucket(BUCKET);
      await bucket.delete(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/gallery/[id]]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
