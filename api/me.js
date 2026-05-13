import { isAuthenticated } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ authenticated: isAuthenticated(req) });
}
