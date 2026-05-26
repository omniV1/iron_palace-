import { ObjectId } from "mongodb";
import { deletePhotoById } from "./gridfsPhoto.js";

export const PHOTO_BUCKET = "day_stones_photos";
export const COLLECTION = "day_stones";
export const MAX_PHOTO_UPLOAD = 4 * 1024 * 1024;

export function photoUrlFromId(photoId) {
  if (!photoId) return undefined;
  const id = photoId instanceof ObjectId ? photoId.toString() : String(photoId);
  return id ? `/api/day-stones/photos/${id}` : undefined;
}

export function serializeEntry(doc) {
  if (!doc) return null;
  const { _id, photoId, ...rest } = doc;
  const entry = { id: _id.toString(), ...rest };
  const url = photoUrlFromId(photoId);
  if (url) entry.photoUrl = url;
  return entry;
}

export async function deleteEntryPhoto(photoId) {
  if (!photoId) return;
  try {
    await deletePhotoById(PHOTO_BUCKET, photoId);
  } catch (err) {
    console.error("[day-stones] delete photo", err);
  }
}

export function parseObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    const err = new Error("invalid id");
    err.statusCode = 400;
    throw err;
  }
}

export function normalizeEntry(input) {
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const category = typeof input?.category === "string" ? input.category.trim() : "";
  const liftedAt = typeof input?.liftedAt === "string" ? input.liftedAt.trim() : "";

  if (!name) {
    const err = new Error("name is required");
    err.statusCode = 400;
    throw err;
  }
  if (category !== "straps" && category !== "no_straps") {
    const err = new Error("category must be straps or no_straps");
    err.statusCode = 400;
    throw err;
  }
  if (!liftedAt) {
    const err = new Error("liftedAt is required");
    err.statusCode = 400;
    throw err;
  }

  return {
    name,
    category,
    liftedAt,
    notes: typeof input?.notes === "string" ? input.notes.trim() : "",
  };
}
