"use client";

import { motion } from "framer-motion";
import { useHabitStore } from "@/store/habit-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { getDbInstance, doc, setDoc } from "@/lib/firebase";

interface HabitSidebarProps {
  onAddHabit: () => void;
  onEditHabit: () => void;
}

export function HabitSidebar({ onAddHabit, onEditHabit }: HabitSidebarProps) {
  const { user } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const currentHabitId = useHabitStore((s) => s.currentHabitId);
  const setCurrentHabit = useHabitStore((s) => s.setCurrentHabit);
  const monthCompletionPercent = useHabitStore((s) => s.monthCompletionPercent);
  const swapHabit = useHabitStore((s) => s.swapHabit);

  const handleSwap = async (id: string, dir: "up" | "down") => {
    const before = useHabitStore.getState().habits;
    swapHabit(id, dir);
    const after = useHabitStore.getState().habits;

    if (!user) return;

    const changed = after.filter(
      (h, i) => before[i]?.id !== h.id || before[i]?.order !== h.order
    );
    const db = getDbInstance();
    changed.forEach((h) => {
      setDoc(doc(db, "users", user.uid, "habits", h.id), { order: h.order }, { merge: true }).catch(
        () => {}
      );
    });
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Your Habits
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg transition-all hover:bg-accent/50"
          onClick={onAddHabit}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-2 pr-2"
        >
          {habits.map((habit, index) => {
            const isSelected = habit.id === currentHabitId;
            const pct = monthCompletionPercent(habit);
            return (
              <div
                key={habit.id}
                onClick={() => setCurrentHabit(habit.id)}
                className={cn(
                  "group relative flex flex-col gap-2 rounded-xl border px-3 py-3 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-primary/30 bg-primary/8 shadow-lg shadow-primary/5"
                    : "border-border/30 bg-card/20 hover:border-border/60 hover:bg-card/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate text-left text-sm font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all"
                        style={{
                          backgroundColor: habit.color,
                          boxShadow: isSelected ? `0 0 12px ${habit.color}50` : "none",
                        }}
                      />
                      <span>
                        {habit.icon ? `${habit.icon} ` : ""}
                        {habit.name}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwap(habit.id, "up");
                      }}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-all",
                        index === 0
                          ? "opacity-0 pointer-events-none"
                          : "opacity-0 group-hover:opacity-60 hover:bg-accent/50 hover:text-foreground hover:opacity-100"
                      )}
                      title="Move up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === habits.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSwap(habit.id, "down");
                      }}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-all",
                        index === habits.length - 1
                          ? "opacity-0 pointer-events-none"
                          : "opacity-0 group-hover:opacity-60 hover:bg-accent/50 hover:text-foreground hover:opacity-100"
                      )}
                      title="Move down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    {isSelected && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-60 transition-all hover:bg-accent/50 hover:text-foreground hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditHabit();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            onEditHabit();
                          }
                        }}
                        title="Edit habit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: habit.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </ScrollArea>

      <Button
        variant="ghost"
        className="group relative w-full gap-2 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-primary/[0.02] py-5 text-sm font-semibold text-primary transition-all hover:border-primary/40 hover:from-primary/[0.14] hover:to-primary/[0.06] hover:shadow-lg hover:shadow-primary/15"
        onClick={onAddHabit}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Add Habit
        </span>
      </Button>
    </div>
  );
}
