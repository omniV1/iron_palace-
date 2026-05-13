import { verifyPassword, makeSessionCookie } from "./_lib/auth.js";
import { readJsonBody } from "./_lib/body.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }
  try {
    const body = await readJsonBody(req);
    if (!verifyPassword(body?.password)) {
      return res.status(401).json({ error: "invalid password" });
    }
    res.setHeader("Set-Cookie", makeSessionCookie());
    return res.status(200).json({ ok: true });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/login]", err);
    return res.status(status).json({ error: err.message || "login failed" });
  }
}
