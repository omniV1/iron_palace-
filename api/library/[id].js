import { requireAdmin } from "../_lib/auth.js";
import {
  getBucketConfig,
  parseObjectId,
  streamFile,
  deleteFile,
  getFileDoc,
} from "../_lib/storage.js";
import { sendError } from "../_lib/respond.js";

const bucket = getBucketConfig("library");

export default async function handler(req, res) {
  try {
    const id = parseObjectId(req.query.id);
    const download = req.query.download != null;

    if (req.method === "GET") {
      const file = await streamFile(bucket, id, res, { download });
      if (!file && !res.headersSent) {
        return res.status(404).json({ error: "not found" });
      }
      return;
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const existing = await getFileDoc(bucket, id);
      if (!existing) return res.status(404).json({ error: "not found" });
      await deleteFile(bucket, id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    if (res.headersSent) return;
    return sendError(res, err, "[api/library/[id]]");
  }
}
