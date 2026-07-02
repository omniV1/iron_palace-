import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { PageShell } from "../components/PageShell";
import { SiteHeader } from "../components/SiteHeader";
import { SectionHeading } from "../components/SectionHeading";
import { GlassCard } from "../components/GlassCard";
import { IconWell } from "../components/IconWell";
import { EASE, tapScaleSm } from "../motion/variants";

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
        <SectionHeading title="Events Calendar" subtitle="Highlighted days have events — tap to see details" />

        {loading && <p className="text-muted-foreground text-sm text-center">Loading events…</p>}
        {error && <p className="text-destructive text-sm text-center">Couldn't load events: {error}</p>}

        {!loading && !error && (
          <>
            <GlassCard className="flex items-center justify-between mb-6 p-4">
              <motion.button
                {...tapScaleSm}
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-6 h-6 text-crimson-bright" />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={monthName}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="font-display text-xl md:text-2xl font-light tracking-wide uppercase"
                >
                  {monthName}
                </motion.h2>
              </AnimatePresence>
              <motion.button
                {...tapScaleSm}
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-6 h-6 text-crimson-bright" />
              </motion.button>
            </GlassCard>

            <GlassCard className="p-4 md:p-6 overflow-hidden">
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-crimson bg-crimson-muted" aria-hidden />
                  Event scheduled
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-crimson bg-crimson/20 ring-1 ring-crimson" aria-hidden />
                  Today
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs md:text-sm font-medium text-crimson uppercase tracking-wider py-2 font-display"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {calendarDays.map((day, idx) => {
                  const hasEvents = day.isCurrentMonth && day.events.length > 0;

                  return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.008, 0.3), duration: 0.25, ease: EASE }}
                    whileHover={hasEvents ? { scale: 1.04, y: -2 } : undefined}
                    whileTap={hasEvents ? { scale: 0.97 } : undefined}
                    onClick={() => hasEvents && setSelectedDay(day)}
                    disabled={!hasEvents}
                    aria-label={
                      hasEvents
                        ? `${day.dayOfMonth}: ${day.events.map((e) => e.title).join(", ")}`
                        : `${day.dayOfMonth}`
                    }
                    className={`
                      relative flex flex-col items-start gap-0.5 aspect-square p-1.5 md:p-2 rounded-lg border transition-colors text-left overflow-hidden
                      ${!day.isCurrentMonth ? "opacity-30 cursor-default" : ""}
                      ${hasEvents
                        ? "border-crimson bg-crimson-muted shadow-[inset_0_0_0_1px_rgba(220,38,38,0.25)] cursor-pointer hover:border-crimson-bright hover:bg-crimson/20"
                        : day.isToday
                          ? "border-crimson bg-crimson/10"
                          : "border-border-subtle cursor-default"
                      }
                      ${selectedDay?.date.getTime() === day.date.getTime()
                        ? "ring-2 ring-crimson-bright bg-crimson/25 border-crimson-bright"
                        : ""
                      }
                    `}
                  >
                    <div className="flex w-full items-start justify-between gap-1">
                      <span
                        className={`font-display text-sm md:text-base leading-none ${
                          hasEvents ? "font-semibold text-crimson-bright" : day.isToday ? "font-bold text-crimson" : ""
                        }`}
                      >
                        {day.dayOfMonth}
                      </span>
                      {hasEvents && (
                        <span className="shrink-0 rounded-full bg-crimson px-1.5 py-0.5 text-[10px] font-display uppercase tracking-wide text-black">
                          {day.events.length}
                        </span>
                      )}
                    </div>
                    {hasEvents && (
                      <div className="mt-auto w-full space-y-0.5">
                        <p className="truncate text-[10px] md:text-xs font-medium text-foreground leading-tight">
                          {day.events[0].title}
                        </p>
                        {day.events.length > 1 && (
                          <p className="text-[10px] text-crimson-bright/80">+{day.events.length - 1} more</p>
                        )}
                      </div>
                    )}
                  </motion.button>
                  );
                })}
              </div>
            </GlassCard>

            <AnimatePresence>
              {selectedDay && selectedDay.events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="mt-6"
                >
                  <GlassCard className="p-6 border-border-crimson">
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
                      <motion.button
                        {...tapScaleSm}
                        onClick={() => setSelectedDay(null)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
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
