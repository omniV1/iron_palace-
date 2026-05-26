import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { PageShell } from "../components/PageShell";
import { SiteHeader } from "../components/SiteHeader";
import { SectionHeading } from "../components/SectionHeading";
import { GlassCard } from "../components/GlassCard";
import { IconWell } from "../components/IconWell";

type CalendarDay = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: ReturnType<typeof useEvents>["events"];
};

function getDaysInMonth(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      dayOfMonth: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      events: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      events: [],
    });
  }

  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
      events: [],
    });
  }

  return days;
}

function matchEventToDate(event: ReturnType<typeof useEvents>["events"][0], date: Date): boolean {
  const parsed = Date.parse(event.date);
  if (!Number.isFinite(parsed)) return false;
  const eventDate = new Date(parsed);
  return (
    eventDate.getFullYear() === date.getFullYear() &&
    eventDate.getMonth() === date.getMonth() &&
    eventDate.getDate() === date.getDate()
  );
}

export default function CalendarPage() {
  const { events, loading, error } = useEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDays = useMemo(() => {
    const days = getDaysInMonth(year, month);
    days.forEach((day) => {
      day.events = events.filter((event) => matchEventToDate(event, day.date));
    });
    return days;
  }, [year, month, events]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  return (
    <PageShell>
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeading title="Events Calendar" subtitle="Click any date to see events" />
        </motion.div>

        {loading && <p className="text-muted-foreground text-sm text-center">Loading events…</p>}
        {error && <p className="text-destructive text-sm text-center">Couldn't load events: {error}</p>}

        {!loading && !error && (
          <>
            <GlassCard className="flex items-center justify-between mb-6 p-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-6 h-6 text-gold" />
              </button>
              <h2 className="font-display text-xl md:text-2xl font-light tracking-wide uppercase">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-6 h-6 text-gold" />
              </button>
            </GlassCard>

            <GlassCard className="p-4 md:p-6 overflow-hidden">
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs md:text-sm font-medium text-gold uppercase tracking-wider py-2 font-display"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {calendarDays.map((day, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.005 }}
                    onClick={() => day.events.length > 0 && setSelectedDay(day)}
                    disabled={!day.isCurrentMonth || day.events.length === 0}
                    className={`
                      relative aspect-square p-1 md:p-2 rounded-lg border transition-all text-sm md:text-base
                      ${!day.isCurrentMonth ? "opacity-30 cursor-default" : ""}
                      ${day.isToday ? "border-gold bg-gold-muted" : "border-border-subtle"}
                      ${day.events.length > 0 && day.isCurrentMonth
                        ? "hover:border-border-gold hover:bg-white/5 cursor-pointer"
                        : "cursor-default"
                      }
                      ${selectedDay?.date.getTime() === day.date.getTime()
                        ? "bg-gold/20 border-gold"
                        : ""
                      }
                    `}
                  >
                    <span className={`block ${day.isToday ? "font-bold text-gold" : ""}`}>
                      {day.dayOfMonth}
                    </span>
                    {day.events.length > 0 && day.isCurrentMonth && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {day.events.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-gold" />
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            <AnimatePresence>
              {selectedDay && selectedDay.events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <GlassCard className="p-6 border-border-gold">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-medium mb-1 font-display">
                          {selectedDay.date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {selectedDay.events.length} event{selectedDay.events.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDay(null)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedDay.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-4 bg-input-background border border-border-subtle rounded-xl"
                        >
                          <IconWell icon={Calendar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium mb-1">{event.title}</h4>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                              {event.time && (
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {event.time}
                                </span>
                              )}
                              {event.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-foreground/80 text-sm whitespace-pre-line">{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </PageShell>
  );
}
