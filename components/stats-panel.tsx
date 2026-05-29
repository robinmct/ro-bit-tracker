"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useHabitStore } from "@/store/habit-store";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  TrendingUp,
} from "lucide-react";

export function StatsPanel() {
  const viewYear = useHabitStore((s) => s.viewYear);
  const viewMonth = useHabitStore((s) => s.viewMonth);
  const currentHabitId = useHabitStore((s) => s.currentHabitId);
  const habitData = useHabitStore((s) => s.habitData);
  const remoteData = useHabitStore((s) => s.remoteData);
  const userId = useHabitStore((s) => s.userId);
  const calculateStats = useHabitStore((s) => s.calculateStats);

  const stats = useMemo(
    () => calculateStats(),
    [calculateStats, viewYear, viewMonth, currentHabitId, habitData, remoteData, userId]
  );

  const items = [
    {
      label: "Completed",
      value: stats.done,
      icon: CheckCircle2,
      tone: "text-emerald-400",
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/15",
      ring: "ring-emerald-500/20",
    },
    {
      label: "Missed",
      value: stats.miss,
      icon: XCircle,
      tone: "text-rose-400",
      bg: "bg-rose-500/8",
      border: "border-rose-500/15",
      ring: "ring-rose-500/20",
    },
    {
      label: "Best Streak",
      value: stats.longest,
      icon: Trophy,
      tone: "text-amber-400",
      bg: "bg-amber-500/8",
      border: "border-amber-500/15",
      ring: "ring-amber-500/20",
    },
    {
      label: "Current Streak",
      value: stats.curr,
      icon: Flame,
      tone: "text-orange-400",
      bg: "bg-orange-500/8",
      border: "border-orange-500/15",
      ring: "ring-orange-500/20",
    },
    {
      label: "Success Rate",
      value: stats.rate,
      suffix: "%",
      icon: TrendingUp,
      tone: "text-primary",
      bg: "bg-primary/8",
      border: "border-primary/15",
      ring: "ring-primary/20",
      large: true,
    },
  ];

  return (
    <div className="grid shrink-0 grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
          className={cn(
            "glass flex flex-col items-center justify-center gap-0.5 rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all hover:shadow-lg",
            item.border
          )}
        >
          <div className={cn("flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:gap-1.5 sm:text-[11px]")}>
            <item.icon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", item.tone)} />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.split(" ")[0]}</span>
          </div>
          <div className={cn("flex items-baseline gap-0.5 text-base font-bold tabular-nums sm:text-2xl", item.tone)}>
            <NumberFlow
              value={item.value}
              className="tabular-nums"
            />
            {item.suffix && (
              <span className="text-xs font-semibold opacity-70 sm:text-sm">{item.suffix}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
