import { requireAdmin } from "../_lib/auth.js";
import {
  getBucketConfig,
  parseObjectId,
  listFiles,
  uploadFile,
  streamFile,
  deleteFile,
  getFileDoc,
} from "../_lib/storage.js";
import { sendError } from "../_lib/respond.js";

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

    if (slug.length === 1) {
      const config = getBucketConfig(slug[0]);

      if (req.method === "GET") {
        const items = await listFiles(config);
        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json({ [config.listKey]: items });
      }

      if (req.method === "POST") {
        if (!requireAdmin(req, res)) return;
        const doc = await uploadFile(config, req);
        return res.status(201).json({ [config.itemKey]: config.serialize(doc, config) });
      }

      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "method not allowed" });
    }

    if (slug.length === 2) {
      const config = getBucketConfig(slug[0]);
      const id = parseObjectId(slug[1]);

      if (req.method === "GET") {
        const download = req.query.download != null;
        const file = await streamFile(config, id, res, { download });
        if (!file) return res.status(404).json({ error: "not found" });
        return;
      }

      if (req.method === "DELETE") {
        if (!requireAdmin(req, res)) return;
        const existing = await getFileDoc(config, id);
        if (!existing) return res.status(404).json({ error: "not found" });
        await deleteFile(config, id);
        return res.status(200).json({ ok: true });
      }

      res.setHeader("Allow", "GET, DELETE");
      return res.status(405).json({ error: "method not allowed" });
    }

    return res.status(404).json({ error: "not found" });
  } catch (err) {
    return sendError(res, err, "[api/storage]");
  }
}
