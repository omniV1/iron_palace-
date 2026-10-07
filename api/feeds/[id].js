/**
 * Public read-only feeds, combined into one function to stay under
 * Vercel's serverless function limit:
 *   GET /api/feeds/shop     — Shopify products
 *   GET /api/feeds/youtube  — latest uploads as { videos, shorts, live }
 */
import { SHOP_URL, fetchShopProducts } from "../_lib/shop.js";
import { CHANNEL_ID, fetchLatestFeed } from "../_lib/youtube.js";
import { sendError } from "../_lib/respond.js";

async function shop(res) {
  const products = await fetchShopProducts();
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).json({ products, shopUrl: SHOP_URL });
}

async function youtube(res) {
  const feed = await fetchLatestFeed();
  if (!feed) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "youtube feed unavailable" });
  }

  // CDN keeps it for 10 minutes and serves the last good copy while refreshing,
  // so new uploads show up within minutes without hammering YouTube.
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=86400");
  return res.status(200).json({
    channelId: CHANNEL_ID,
    fetchedAt: new Date().toISOString(),
    ...feed,
  });
}

const feeds = { shop, youtube };

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }
    const feed = feeds[req.query.id];
    if (!feed) return res.status(404).json({ error: "unknown feed" });
    return await feed(res);
  } catch (err) {
    return sendError(res, err, "[api/feeds]");
  }
}
