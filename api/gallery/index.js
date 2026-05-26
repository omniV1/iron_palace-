import { requireAdmin } from "../_lib/auth.js";
import {
  getBucketConfig,
  listFiles,
  uploadFile,
} from "../_lib/storage.js";
import { sendError } from "../_lib/respond.js";

export const config = {
  api: { bodyParser: false },
};

const bucket = getBucketConfig("gallery");

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const photos = await listFiles(bucket);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ photos });
    }

    if (req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const doc = await uploadFile(bucket, req);
      return res.status(201).json({ photo: bucket.serialize(doc, bucket) });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    return sendError(res, err, "[api/gallery]");
  }
}
