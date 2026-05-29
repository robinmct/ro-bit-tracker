"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useHabitStore, fmt } from "@/store/habit-store";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  onDayClick: (day: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ onDayClick }: CalendarGridProps) {
  const viewYear = useHabitStore((s) => s.viewYear);
  const viewMonth = useHabitStore((s) => s.viewMonth);
  const currentHabitId = useHabitStore((s) => s.currentHabitId);
  const habits = useHabitStore((s) => s.habits);
  const habitData = useHabitStore((s) => s.habitData);
  const remoteData = useHabitStore((s) => s.remoteData);
  const userId = useHabitStore((s) => s.userId);

  const habit = useMemo(
    () => habits.find((h) => h.id === currentHabitId) || habits[0],
    [habits, currentHabitId]
  );

  const md = useMemo(() => {
    if (!habit) return {};
    const key = fmt(viewYear, viewMonth);
    if (userId && remoteData[habit.id]?.[key]) {
      return remoteData[habit.id][key];
    }
    return habitData[habit.id]?.[key] || {};
  }, [habit, viewYear, viewMonth, habitData, remoteData, userId]);

  if (!habit) return null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const today = new Date();
  const isTodayMonth =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;

  const goal = Number(habit.goal) || 1;

  const totalCells = firstDayOfWeek + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2">
      {/* Weekday headers */}
      <div className="grid shrink-0 grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground sm:text-xs"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div
        key={`${viewYear}-${viewMonth}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="grid flex-1 grid-cols-7 gap-1.5 sm:gap-2"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {/* Empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const val = md[day];
          const done = val === "done";
          const miss = val === "miss";
          const isToday = isTodayMonth && today.getDate() === day;

          let progressPct = 0;
          let showValue = "";
          if (habit.type !== "binary" && val != null) {
            const v = Math.max(0, Number(val));
            progressPct = Math.min(100, Math.round((v / goal) * 100));
            showValue = String(v);
          }

          const ringRadius = 16;
          const ringCircumference = 2 * Math.PI * ringRadius;
          const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference;

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-lg border text-sm font-semibold transition-all min-h-[48px] sm:min-h-[64px]",
                "hover:scale-[1.04] active:scale-95 duration-150",
                done
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  : miss
                  ? "border-rose-500/40 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                  : "border-border/70 bg-card/55 text-foreground hover:border-primary/40 hover:bg-primary/10",
                isToday && "ring-2 ring-primary/60 ring-offset-2 ring-offset-background shadow-lg shadow-primary/10"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1.5 text-[11px] font-bold sm:top-1.5 sm:left-2 sm:text-xs",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}
              >
                {day}
              </span>

              {habit.type === "binary" ? (
                <span className="text-lg sm:text-xl">
                  {done ? "✅" : miss ? "❌" : ""}
                </span>
              ) : (
                <div className="flex flex-col items-center justify-center gap-0.5">
                  {showValue ? (
                    <span className="hidden text-[10px] font-bold tabular-nums sm:block sm:text-xs">
                      {showValue}
                    </span>
                  ) : null}
                  <svg
                    className="h-7 w-7 sm:h-9 sm:w-9"
                    viewBox="0 0 40 40"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted/30"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={ringRadius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      className="text-primary progress-ring-circle"
                      style={{
                        filter: "drop-shadow(0 0 4px rgba(139,92,246,0.4))",
                      }}
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
