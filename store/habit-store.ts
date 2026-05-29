import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HabitType = "binary" | "step" | "time";

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  goal: number;
  color: string;
  icon: string;
}

export interface MonthData {
  [day: number]: string | number;
}

export interface HabitDataMap {
  [habitId: string]: {
    [monthKey: string]: MonthData;
  };
}

interface HabitState {
  habits: Habit[];
  habitData: HabitDataMap;
  currentHabitId: string | null;
  viewYear: number;
  viewMonth: number;
  remoteData: HabitDataMap;
  userId: string | null;

  setUserId: (id: string | null) => void;
  addHabit: (habit: Omit<Habit, "id">) => Habit;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id">>) => void;
  deleteHabit: (id: string) => boolean;
  setCurrentHabit: (id: string) => void;
  getCurrentHabit: () => Habit | undefined;
  navigateMonth: (dir: "prev" | "next") => void;
  setView: (year: number, month: number) => void;
  getMonthKey: () => string;
  getMonthData: (habitId?: string, year?: number, month?: number) => MonthData;
  setMark: (day: number, val: string | number | null, habitId?: string, year?: number, month?: number) => void;
  setRemoteData: (habitId: string, monthKey: string, data: MonthData) => void;
  loadFromRemote: (habits: Habit[]) => void;
  calculateStats: () => { done: number; miss: number; longest: number; curr: number; rate: number };
  monthCompletionPercent: (habit: Habit, year?: number, month?: number) => number;
}

const STORAGE_KEY = "robit-habits";

export const fmt = (y: number, m: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}`;

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      habitData: {},
      currentHabitId: null,
      viewYear: new Date().getFullYear(),
      viewMonth: new Date().getMonth(),
      remoteData: {},
      userId: null,

      setUserId: (id) => set({ userId: id }),

      addHabit: (habit) => {
        const id = String(Date.now());
        const newHabit: Habit = {
          id,
          name: habit.name.trim() || "New Habit",
          type: habit.type,
          goal: habit.type === "binary" ? 1 : Number(habit.goal) || 1,
          color: habit.color || "#a78bfa",
          icon: habit.icon.trim(),
        };
        set((s) => ({
          habits: [...s.habits, newHabit],
          currentHabitId: id,
          habitData: { ...s.habitData, [id]: {} },
        }));
        return newHabit;
      },

      updateHabit: (id, updates) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...updates,
                  name: updates.name?.trim() || h.name,
                  goal:
                    updates.type === "binary"
                      ? 1
                      : Number(updates.goal) || h.goal,
                  color: updates.color || h.color,
                  icon: updates.icon?.trim() ?? h.icon,
                }
              : h
          ),
        }));
      },

      deleteHabit: (id) => {
        const s = get();
        if (s.habits.length <= 1) return false;
        const newHabits = s.habits.filter((h) => h.id !== id);
        const newData = { ...s.habitData };
        delete newData[id];
        set({
          habits: newHabits,
          habitData: newData,
          currentHabitId:
            s.currentHabitId === id
              ? newHabits[0]?.id ?? null
              : s.currentHabitId,
        });
        return true;
      },

      setCurrentHabit: (id) => {
        if (get().habits.find((h) => h.id === id)) {
          set({ currentHabitId: id });
        }
      },

      getCurrentHabit: () => {
        const s = get();
        return (
          s.habits.find((h) => h.id === s.currentHabitId) || s.habits[0]
        );
      },

      navigateMonth: (dir) => {
        const s = get();
        const d = new Date(s.viewYear, s.viewMonth + (dir === "prev" ? -1 : 1), 1);
        set({ viewYear: d.getFullYear(), viewMonth: d.getMonth() });
      },

      setView: (year, month) => set({ viewYear: year, viewMonth: month }),

      getMonthKey: () => fmt(get().viewYear, get().viewMonth),

      getMonthData: (habitId, year, month) => {
        const s = get();
        const hId = habitId || s.currentHabitId;
        const y = year ?? s.viewYear;
        const m = month ?? s.viewMonth;
        if (!hId) return {};
        const key = fmt(y, m);
        if (s.userId && s.remoteData[hId]?.[key]) {
          return s.remoteData[hId][key];
        }
        return s.habitData[hId]?.[key] || {};
      },

      setMark: (day, val, habitId, year, month) => {
        const s = get();
        const hId = habitId || s.currentHabitId;
        const y = year ?? s.viewYear;
        const m = month ?? s.viewMonth;
        if (!hId) return;
        const key = fmt(y, m);

        set((state) => {
          const data = { ...state.habitData };
          data[hId] = { ...data[hId] };
          data[hId][key] = { ...data[hId][key] };
          if (val == null || val === "") {
            delete data[hId][key][day];
          } else {
            data[hId][key][day] = val;
          }
          return { habitData: data };
        });
      },

      setRemoteData: (habitId, monthKey, data) => {
        set((s) => ({
          remoteData: {
            ...s.remoteData,
            [habitId]: { ...s.remoteData[habitId], [monthKey]: data },
          },
        }));
      },

      loadFromRemote: (habits) => {
        set((s) => {
          const merged = [...s.habits];
          const data = { ...s.habitData };
          habits.forEach((h) => {
            if (!merged.find((x) => x.id === h.id)) {
              merged.push(h);
            }
            data[h.id] = data[h.id] || {};
          });
          return {
            habits: merged,
            habitData: data,
            currentHabitId: s.currentHabitId || habits[0]?.id || null,
          };
        });
      },

      calculateStats: () => {
        const s = get();
        const h = s.getCurrentHabit();
        if (!h) return { done: 0, miss: 0, longest: 0, curr: 0, rate: 0 };

        const y = s.viewYear;
        const m = s.viewMonth;
        const md = s.getMonthData(h.id, y, m);
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const now = new Date();

        const isDone = (dayVal: string | number | undefined) => {
          if (h.type === "binary") return dayVal === "done";
          const goal = Number(h.goal) || 1;
          const v = Math.max(0, Number(dayVal || 0));
          return v >= goal;
        };

        let done = 0, miss = 0, rate = 0;

        if (h.type === "binary") {
          for (let d = 1; d <= daysInMonth; d++) {
            if (md[d] === "done") done++;
            else if (md[d] === "miss") miss++;
          }
          rate = Math.round((done / daysInMonth) * 100);
        } else {
          const goal = Number(h.goal) || 1;
          let completed = 0, total = 0;
          for (let d = 1; d <= daysInMonth; d++) {
            const v = Math.max(0, Number(md[d] || 0));
            total += Math.min(goal, v);
            if (v >= goal) completed++;
          }
          done = completed;
          miss = daysInMonth - completed;
          rate = Math.round((total / (goal * daysInMonth)) * 100);
        }

        // Cross-month streaks
        const source = s.userId
          ? s.remoteData[h.id] || {}
          : s.habitData[h.id] || {};
        let monthKeys = Object.keys(source).sort();
        const currKey = fmt(y, m);
        if (!monthKeys.includes(currKey)) monthKeys.push(currKey);
        monthKeys.sort();

        const parseKey = (k: string) => {
          const [yy, mm] = k.split("-").map(Number);
          return new Date(yy, mm - 1, 1);
        };
        const start = monthKeys.length
          ? parseKey(monthKeys[0])
          : new Date(y, m, 1);
        const end = new Date(y, m, 1);
        const fullKeys: string[] = [];
        for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
          fullKeys.push(fmt(d.getFullYear(), d.getMonth()));
        }

        let longest = 0, cur = 0;
        for (let i = 0; i < fullKeys.length; i++) {
          const [yy, mm] = fullKeys[i].split("-").map(Number);
          const daysIn = new Date(yy, mm, 0).getDate();
          const data = source[fullKeys[i]] || (yy === y && mm === m + 1 ? md : {});
          for (let d = 1; d <= daysIn; d++) {
            if (isDone(data[d])) {
              cur++;
              if (cur > longest) longest = cur;
            } else {
              cur = 0;
            }
          }
        }

        const endDay =
          y === now.getFullYear() && m === now.getMonth()
            ? now.getDate()
            : daysInMonth;
        let curr = 0;
        for (let i = fullKeys.length - 1; i >= 0; i--) {
          const [yy, mm] = fullKeys[i].split("-").map(Number);
          const data = source[fullKeys[i]] || (yy === y && mm === m + 1 ? md : {});
          const daysIn = new Date(yy, mm, 0).getDate();
          let startD = daysIn;
          if (yy === y && mm === m + 1) startD = endDay;
          for (let d = startD; d >= 1; d--) {
            if (isDone(data[d])) {
              curr++;
            } else {
              i = -1;
              break;
            }
          }
        }

        return { done, miss, longest, curr, rate };
      },

      monthCompletionPercent: (habit, year, month) => {
        const s = get();
        const y = year ?? s.viewYear;
        const m = month ?? s.viewMonth;
        const md = s.getMonthData(habit.id, y, m);
        const days = new Date(y, m + 1, 0).getDate();

        if (habit.type === "binary") {
          let done = 0;
          for (let d = 1; d <= days; d++) {
            if (md[d] === "done") done++;
          }
          return Math.round((done / days) * 100);
        } else {
          const goal = Number(habit.goal) || 1;
          let completed = 0;
          for (let d = 1; d <= days; d++) {
            const v = Math.max(0, Number(md[d] || 0));
            if (v >= goal) completed++;
          }
          return Math.round((completed / days) * 100);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        habits: state.habits,
        habitData: state.habitData,
        currentHabitId: state.currentHabitId,
      }),
    }
  )
);
