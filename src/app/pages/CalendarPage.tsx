import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, MapPin, Clock, ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

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
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: CalendarDay[] = [];
  
  // Previous month's trailing days
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
  
  // Current month's days
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
  
  // Next month's leading days to fill the grid
  const remainingDays = 42 - days.length; // 6 rows × 7 days
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

  const calendarDays = useMemo(() => {
    const days = getDaysInMonth(year, month);
    // Attach events to each day
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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-wide uppercase mb-2">Events Calendar</h1>
          <p className="text-zinc-400 text-sm">Click any date to see events</p>
        </motion.div>

        {loading && <p className="text-zinc-400 text-sm text-center">Loading events…</p>}
        {error && <p className="text-red-400 text-sm text-center">Couldn't load events: {error}</p>}

        {!loading && !error && (
          <>
            {/* Calendar Header with Month Navigation */}
            <div className="flex items-center justify-between mb-6 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-6 h-6 text-amber-500" />
              </button>
              <h2 className="text-xl md:text-2xl font-light tracking-wide uppercase">{monthName}</h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-6 h-6 text-amber-500" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 overflow-hidden">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs md:text-sm font-medium text-amber-500 uppercase tracking-wider py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
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
                      ${day.isToday ? "border-amber-500 bg-amber-500/10" : "border-white/10"}
                      ${day.events.length > 0 && day.isCurrentMonth
                        ? "hover:border-amber-500/50 hover:bg-white/5 cursor-pointer"
                        : "cursor-default"
                      }
                      ${selectedDay?.date.getTime() === day.date.getTime()
                        ? "bg-amber-500/20 border-amber-500"
                        : ""
                      }
                    `}
                  >
                    <span className={`block ${day.isToday ? "font-bold text-amber-500" : ""}`}>
                      {day.dayOfMonth}
                    </span>
                    {day.events.length > 0 && day.isCurrentMonth && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {day.events.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-amber-500" />
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Selected Day Events Panel */}
            <AnimatePresence>
              {selectedDay && selectedDay.events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 bg-zinc-900/60 backdrop-blur-md border border-amber-500/50 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-medium mb-1">
                        {selectedDay.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {selectedDay.events.length} event{selectedDay.events.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedDay.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-4 bg-black/40 border border-white/10 rounded-xl"
                      >
                        <div className="bg-amber-600/10 p-2 rounded-lg ring-1 ring-amber-600/20 shrink-0">
                          <Calendar className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{event.title}</h4>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400 mb-2">
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
                            <p className="text-zinc-300 text-sm whitespace-pre-line">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
