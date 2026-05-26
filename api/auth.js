import {
  verifyPassword,
  makeSessionCookie,
  clearSessionCookie,
  isAuthenticated,
} from "./_lib/auth.js";
import { readJsonBody } from "./_lib/body.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ authenticated: isAuthenticated(req) });
    }

    if (req.method === "POST") {
      const body = await readJsonBody(req);
      const action = body?.action;

      if (action === "login") {
        if (!verifyPassword(body?.password)) {
          return res.status(401).json({ error: "invalid password" });
        }
        res.setHeader("Set-Cookie", makeSessionCookie());
        return res.status(200).json({ ok: true });
      }

      if (action === "logout") {
        res.setHeader("Set-Cookie", clearSessionCookie());
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: "action must be login or logout" });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/auth]", err);
    return res.status(status).json({ error: err.message || "auth failed" });
  }
}
