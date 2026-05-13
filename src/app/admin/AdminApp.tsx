import { useState } from "react";
import { Calendar, FileText, Image as ImageIcon, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "./LoginPage";
import { EventsAdmin } from "./EventsAdmin";
import { GalleryAdmin } from "./GalleryAdmin";
import { LibraryAdmin } from "./LibraryAdmin";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

type Tab = "events" | "gallery" | "library";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "library", label: "Library", icon: FileText },
];

export default function AdminApp() {
  const { authenticated, error, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("events");

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={login} error={error} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={imgNewLogo} alt="Iron Palace" className="h-9 w-auto" />
            <span className="text-sm uppercase tracking-wider text-zinc-400 hidden sm:inline">Admin</span>
          </a>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-amber-500"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider border-b-2 transition-colors ${
                  active
                    ? "text-amber-500 border-amber-500"
                    : "text-zinc-400 border-transparent hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "events" && <EventsAdmin />}
        {tab === "gallery" && <GalleryAdmin />}
        {tab === "library" && <LibraryAdmin />}
      </main>
    </div>
  );
}
