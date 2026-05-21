import { ObjectId } from "mongodb";
import { getDb } from "../_lib/mongo.js";
import { requireAdmin } from "../_lib/auth.js";

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const id = parseId(req.query.id);
    const db = await getDb();
    const col = db.collection("day_stones");

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const result = await col.deleteOne({ _id: id });
      if (!result.deletedCount) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    const status = err.statusCode || 500;
    console.error("[api/day-stones/[id]]", err);
    return res.status(status).json({ error: err.message || "server error" });
  }
}
