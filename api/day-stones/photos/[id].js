import { streamPhoto } from "../../_lib/gridfsPhoto.js";
import { PHOTO_BUCKET, parseObjectId } from "../_lib.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }

    const photoId = parseObjectId(req.query.id);
    const file = await streamPhoto(PHOTO_BUCKET, photoId, res);
    if (!file) return res.status(404).json({ error: "not found" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones/photos/[id]]", err);
    if (!res.headersSent) {
      return res.status(status).json({ error: err.message || "server error" });
    }
  }
}
