import { CHANNEL_ID, fetchLatestVideos } from "../_lib/youtube.js";
import { sendError } from "../_lib/respond.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }

    const videos = await fetchLatestVideos();
    if (!videos) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(502).json({ error: "youtube feed unavailable" });
    }

    // CDN keeps it for 10 minutes and serves the last good copy while refreshing,
    // so new uploads show up within minutes without hammering YouTube.
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
    return res.status(200).json({
      channelId: CHANNEL_ID,
      fetchedAt: new Date().toISOString(),
      videos,
    });
  } catch (err) {
    return sendError(res, err, "[api/youtube]");
  }
}
