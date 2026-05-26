import { streamPhotoFromBuckets } from "../../_lib/gridfsPhoto.js";
import { sendError } from "../../_lib/respond.js";
import { PHOTO_READ_BUCKETS, parseObjectId } from "../../_lib/dayStones.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }

    const photoId = parseObjectId(req.query.id);
    const file = await streamPhotoFromBuckets(PHOTO_READ_BUCKETS, photoId, res);
    if (!file && !res.headersSent) {
      return res.status(404).json({ error: "not found" });
    }
  } catch (err) {
    if (res.headersSent) return;
    return sendError(res, err, "[api/day-stones/photos/[id]]");
  }
}
