import { motion } from "motion/react";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

type GroupedEvents = { key: string; label: string; items: ReturnType<typeof useEvents>["events"] }[];

function groupByMonth(events: ReturnType<typeof useEvents>["events"]): GroupedEvents {
  const map = new Map<string, ReturnType<typeof useEvents>["events"]>();
  for (const e of events) {
    const parsed = Date.parse(e.date);
    const key = Number.isFinite(parsed)
      ? new Date(parsed).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : "Upcoming";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries()).map(([key, items]) => ({ key, label: key, items }));
}

export default function CalendarPage() {
  const { events, loading, error } = useEvents();
  const groups = groupByMonth(events);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Back to site</span>
          </a>
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" />
          </a>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase mb-4">Events Calendar</h1>
          <p className="text-zinc-400 text-sm">All upcoming Iron Palace events in one place</p>
        </motion.div>

        {loading && <p className="text-zinc-400 text-sm text-center">Loading events…</p>}
        {error && <p className="text-red-400 text-sm text-center">Couldn't load events: {error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No upcoming events yet. Check back soon.</p>
          </div>
        )}

        <div className="space-y-12">
          {groups.map((group, gIdx) => (
            <motion.section
              key={group.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gIdx * 0.05 }}
            >
              <h2 className="text-2xl font-light tracking-wide uppercase text-amber-500 mb-6 border-b border-amber-500/20 pb-2">
                {group.label}
              </h2>
              <ul className="space-y-4">
                {group.items.map((event, idx) => (
                  <motion.li
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-amber-500/50 hover:bg-zinc-900/80 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-600/10 p-3 rounded-xl ring-1 ring-amber-600/20 shrink-0">
                        <Calendar className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-medium mb-2">{event.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400 mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-zinc-300 text-sm whitespace-pre-line">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}
