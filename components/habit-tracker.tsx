"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getAuthInstance, signOut, getDbInstance, doc, setDoc, collection, getDocs, onSnapshot } from "@/lib/firebase";
import { useHabitStore } from "@/store/habit-store";
import { HabitSidebar } from "@/components/habit-sidebar";
import { CalendarGrid } from "@/components/calendar-grid";
import { StatsPanel } from "@/components/stats-panel";
import { MonthPicker } from "@/components/month-picker";
import { HabitDialog } from "@/components/habit-dialog";
import { ProgressDialog } from "@/components/progress-dialog";
import { CommandMenu } from "@/components/command-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, ChevronLeft, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function HabitTracker() {
  const { user } = useAuth();
  const habits = useHabitStore((s) => s.habits);
  const currentHabitId = useHabitStore((s) => s.currentHabitId);
  const viewYear = useHabitStore((s) => s.viewYear);
  const viewMonth = useHabitStore((s) => s.viewMonth);
  const navigateMonth = useHabitStore((s) => s.navigateMonth);
  const resetState = useHabitStore((s) => s.resetState);

  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [editHabitOpen, setEditHabitOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressDay, setProgressDay] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentHabit = useMemo(
    () => habits.find((h) => h.id === currentHabitId) || habits[0],
    [habits, currentHabitId]
  );

  // Listen for command palette events
  useEffect(() => {
    const addHandler = () => setHabitDialogOpen(true);
    const editHandler = () => setEditHabitOpen(true);
    window.addEventListener("robit:add-habit", addHandler);
    window.addEventListener("robit:edit-habit", editHandler);
    return () => {
      window.removeEventListener("robit:add-habit", addHandler);
      window.removeEventListener("robit:edit-habit", editHandler);
    };
  }, []);

  // Load habits from Firestore
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDocs(collection(getDbInstance(), "users", user.uid, "habits"));
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "Habit",
          type: data.type || "binary",
          goal: data.goal != null ? data.goal : 1,
          color: data.color || "#a78bfa",
          icon: data.icon || "",
          order: typeof data.order === "number" ? data.order : 0,
        };
      });
      const store = useHabitStore.getState();
      if (list.length) {
        store.loadFromRemote(list);
      } else if (store.habits.length === 0) {
        const h = store.addHabit({
          name: "Exercise",
          type: "binary",
          goal: 1,
          color: "#a78bfa",
          icon: "💪",
        });
        await setDoc(doc(getDbInstance(), "users", user.uid, "habits", h.id), {
          name: h.name,
          type: h.type,
          goal: h.goal,
          color: h.color,
          icon: h.icon,
          order: h.order,
        });
      }
    };
    load();
  }, [user]);

  // Subscribe to month data for all habits so percentages load async on mount
  useEffect(() => {
    if (!user || !habits.length) return;
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const unsubs: (() => void)[] = [];
    const setRemoteData = useHabitStore.getState().setRemoteData;

    habits.forEach((habit) => {
      const ref = doc(getDbInstance(), "users", user.uid, "habits", habit.id, "months", key);
      const unsub = onSnapshot(ref, (snap) => {
        const data = snap.exists() ? snap.data() || {} : {};
        let marks: Record<string, string | number> = {};
        if (data.marks && typeof data.marks === "object") {
          marks = { ...data.marks };
        }
        Object.keys(data).forEach((k) => {
          if (k.startsWith("marks.")) {
            const day = k.split(".")[1];
            if (day && marks[day] === undefined) marks[day] = data[k];
          }
        });
        setRemoteData(habit.id, key, marks);
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [user, habits, viewYear, viewMonth]);

  const handleSignOut = async () => {
    try {
      resetState();
      await signOut(getAuthInstance());
      window.location.reload();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleDayClick = useCallback(
    (day: number) => {
      if (!currentHabit) return;
      const store = useHabitStore.getState();
      if (currentHabit.type === "binary") {
        const md = store.getMonthData(currentHabit.id, viewYear, viewMonth);
        const curr = md[day];
        const next = curr === "done" ? "miss" : curr === "miss" ? null : "done";
        store.setMark(day, next);
        if (user) {
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
          const ref = doc(getDbInstance(), "users", user.uid, "habits", currentHabit.id, "months", key);
          const payload: Record<string, any> = {};
          if (next == null) {
            payload[`marks.${day}`] = null;
          } else {
            payload[`marks.${day}`] = next;
          }
          setDoc(ref, payload, { merge: true }).catch(() => {});
        }
      } else {
        setProgressDay(day);
        setProgressOpen(true);
      }
    },
    [currentHabit, viewYear, viewMonth, user]
  );

  const handleProgressSave = (day: number, val: number) => {
    const store = useHabitStore.getState();
    store.setMark(day, val);
    if (user && currentHabit) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
      const ref = doc(getDbInstance(), "users", user.uid, "habits", currentHabit.id, "months", key);
      setDoc(ref, { [`marks.${day}`]: val }, { merge: true }).catch(() => {});
    }
    setProgressOpen(false);
  };

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const titleName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <div className="flex h-svh flex-col">
      {/* Glass Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl sm:px-6">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger className="inline-flex items-center justify-center rounded text-sm font-medium transition-all hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 w-10 md:hidden">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] border-border/40 bg-background/80 pt-12 pb-4 px-4 backdrop-blur-2xl">
            <SheetTitle className="sr-only">Habits</SheetTitle>
            <SheetDescription className="sr-only">
              Select a habit to view and track your progress.
            </SheetDescription>
            <HabitSidebar
              onAddHabit={() => {
                setSidebarOpen(false);
                setHabitDialogOpen(true);
              }}
              onEditHabit={() => {
                setSidebarOpen(false);
                setEditHabitOpen(true);
              }}
              showTopAddButton={false}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 ring-1 ring-primary/20">
            <Sparkles className="h-[1.125rem] w-[1.125rem] text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            {titleName ? `${titleName}'s Ro-bit` : "Ro-bit"}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <CommandMenu />
          <Badge
            variant="secondary"
            className="hidden rounded border border-border/30 bg-card/60 px-2.5 py-1 text-xs font-normal text-muted-foreground backdrop-blur-sm sm:inline-flex"
          >
            {user?.email}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-9 w-9 rounded transition-all hover:bg-accent/50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[280px] flex-col gap-4 border-r border-border/40 bg-card/30 p-4 backdrop-blur-sm md:flex">
          <HabitSidebar
            onAddHabit={() => setHabitDialogOpen(true)}
            onEditHabit={() => setEditHabitOpen(true)}
          />
        </aside>

        {/* Calendar + Stats */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Month Navigation */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 sm:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-9 w-9 rounded transition-all hover:bg-accent/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                onClick={() => setMonthPickerOpen(true)}
                className="flex h-9 items-center justify-center px-2 min-w-[160px] text-center text-xl font-bold tracking-tight transition-colors hover:text-muted-foreground sm:min-w-[200px] sm:text-2xl"
              >
                {monthLabel}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-9 w-9 rounded transition-all hover:bg-accent/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {currentHabit && (
              <div className="hidden min-w-0 items-center gap-2 sm:flex">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: currentHabit.color }}
                />
                <span className="truncate text-sm font-semibold text-foreground">
                  {currentHabit.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 min-h-0 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
            {/* Calendar Card */}
            <motion.div
              layout
              className="glass flex flex-1 min-h-0 flex-col rounded p-4 sm:p-5 shadow-xl shadow-black/10 shadow-primary/[0.07] ring-1 ring-primary/[0.08]"
            >
              <CalendarGrid onDayClick={handleDayClick} />
            </motion.div>

            {/* Stats Row */}
            <StatsPanel />
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <MonthPicker open={monthPickerOpen} onOpenChange={setMonthPickerOpen} />
      <HabitDialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen} mode="add" />
      <HabitDialog open={editHabitOpen} onOpenChange={setEditHabitOpen} mode="edit" />
      {progressDay != null && (
        <ProgressDialog
          open={progressOpen}
          onOpenChange={setProgressOpen}
          day={progressDay}
          onSave={handleProgressSave}
        />
      )}
    </div>
  );
}
