import { useState } from "react";
import { Calendar, FileText, Image as ImageIcon, LogOut, Trophy } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "./LoginPage";
import { EventsAdmin } from "./EventsAdmin";
import { GalleryAdmin } from "./GalleryAdmin";
import { LibraryAdmin } from "./LibraryAdmin";
import { DayStonesAdmin } from "./DayStonesAdmin";
import { PageShell } from "../components/PageShell";
import { SiteHeader } from "../components/SiteHeader";

type Tab = "events" | "gallery" | "library" | "day-stones";

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "library", label: "Library", icon: FileText },
  { id: "day-stones", label: "Day Stones", icon: Trophy },
];

export default function AdminApp() {
  const { authenticated, error, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("events");

  if (authenticated === null) {
    return (
      <PageShell className="flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </PageShell>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={login} error={error} />;
  }

  return (
    <PageShell>
      <SiteHeader variant="admin" title="Admin">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold-bright font-display"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </SiteHeader>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 border-b border-border-subtle overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm uppercase tracking-wider border-b-2 transition-colors font-display ${
                active
                  ? "text-gold border-gold"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "events" && <EventsAdmin />}
        {tab === "gallery" && <GalleryAdmin />}
        {tab === "library" && <LibraryAdmin />}
        {tab === "day-stones" && <DayStonesAdmin />}
      </main>
    </PageShell>
  );
}
