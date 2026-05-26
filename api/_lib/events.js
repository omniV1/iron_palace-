import { ObjectId } from "mongodb";

export const COLLECTION = "events";

export function serializeEvent(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

export function normalizeEvent(input) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const date = typeof input?.date === "string" ? input.date.trim() : "";
  if (!title) {
    const err = new Error("title is required");
    err.statusCode = 400;
    throw err;
  }
  if (!date) {
    const err = new Error("date is required");
    err.statusCode = 400;
    throw err;
  }
  return {
    title,
    date,
    time: typeof input?.time === "string" ? input.time.trim() : "",
    location: typeof input?.location === "string" ? input.location.trim() : "",
    description: typeof input?.description === "string" ? input.description.trim() : "",
  };
}

export function parseEventId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}
