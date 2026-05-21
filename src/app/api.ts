/**
 * Tiny fetch wrapper for the Vercel functions under /api.
 * Always sends cookies so the admin session is preserved.
 */

export type EventRecord = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GalleryPhoto = {
  id: string;
  filename: string;
  contentType: string;
  caption: string;
  size: number;
  uploadedAt: string;
  url: string;
};

export type LibraryFile = {
  id: string;
  filename: string;
  contentType: string;
  title: string;
  description: string;
  size: number;
  uploadedAt: string;
  url: string;
};

export type DayStoneEntry = {
  id: string;
  name: string;
  category: "straps" | "no_straps";
  liftedAt: string;
  notes?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async me(): Promise<{ authenticated: boolean }> {
    const res = await fetch("/api/auth", { credentials: "include" });
    return handle(res);
  },

  async login(password: string): Promise<{ ok: true }> {
    const res = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return handle(res);
  },

  async logout(): Promise<{ ok: true }> {
    const res = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    return handle(res);
  },

  async listEvents(): Promise<EventRecord[]> {
    const res = await fetch("/api/events", { credentials: "include" });
    const data = await handle<{ events: EventRecord[] }>(res);
    return data.events;
  },

  async createEvent(payload: Omit<EventRecord, "id">): Promise<EventRecord> {
    const res = await fetch("/api/events", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handle<{ event: EventRecord }>(res);
    return data.event;
  },

  async updateEvent(id: string, payload: Partial<EventRecord>): Promise<EventRecord> {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handle<{ event: EventRecord }>(res);
    return data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handle(res);
  },

  async listGallery(): Promise<GalleryPhoto[]> {
    const res = await fetch("/api/gallery", { credentials: "include" });
    const data = await handle<{ photos: GalleryPhoto[] }>(res);
    return data.photos;
  },

  async uploadGallery(file: File, caption: string): Promise<GalleryPhoto> {
    const res = await fetch("/api/gallery", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-filename": encodeURIComponent(file.name),
        "x-caption": encodeURIComponent(caption),
      },
      body: file,
    });
    const data = await handle<{ photo: GalleryPhoto }>(res);
    return data.photo;
  },

  async deleteGallery(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handle(res);
  },

  async listLibrary(): Promise<LibraryFile[]> {
    const res = await fetch("/api/library", { credentials: "include" });
    const data = await handle<{ files: LibraryFile[] }>(res);
    return data.files;
  },

  async uploadLibrary(file: File, title: string, description: string): Promise<LibraryFile> {
    const res = await fetch("/api/library", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-filename": encodeURIComponent(file.name),
        "x-title": encodeURIComponent(title || file.name),
        "x-description": encodeURIComponent(description),
      },
      body: file,
    });
    const data = await handle<{ file: LibraryFile }>(res);
    return data.file;
  },

  async deleteLibrary(id: string): Promise<void> {
    const res = await fetch(`/api/library/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handle(res);
  },

  async listDayStones(): Promise<DayStoneEntry[]> {
    const res = await fetch("/api/day-stones", { credentials: "include" });
    const data = await handle<{ entries: DayStoneEntry[] }>(res);
    return data.entries;
  },

  async createDayStone(payload: Omit<DayStoneEntry, "id">): Promise<DayStoneEntry> {
    const res = await fetch("/api/day-stones", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handle<{ entry: DayStoneEntry }>(res);
    return data.entry;
  },

  async deleteDayStone(id: string): Promise<void> {
    const res = await fetch(`/api/day-stones/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    await handle(res);
  },

  async uploadDayStonePhoto(entryId: string, file: File): Promise<DayStoneEntry> {
    const res = await fetch(`/api/day-stones/${encodeURIComponent(entryId)}/photo`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-filename": encodeURIComponent(file.name),
      },
      body: file,
    });
    const data = await handle<{ entry: DayStoneEntry }>(res);
    return data.entry;
  },

  async deleteDayStonePhoto(entryId: string): Promise<DayStoneEntry> {
    const res = await fetch(`/api/day-stones/${encodeURIComponent(entryId)}/photo`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await handle<{ entry: DayStoneEntry }>(res);
    return data.entry;
  },
};
