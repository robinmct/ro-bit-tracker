"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHabitStore } from "@/store/habit-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";

interface MonthPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function MonthPicker({ open, onOpenChange }: MonthPickerProps) {
  const { viewYear, viewMonth, setView } = useHabitStore();
  const [selectedYear, setSelectedYear] = useState(viewYear);
  const [selectedMonth, setSelectedMonth] = useState(viewMonth);

  useEffect(() => {
    setSelectedYear(viewYear);
    setSelectedMonth(viewMonth);
  }, [viewYear, viewMonth, open]);

  const handleApply = () => {
    setView(selectedYear, selectedMonth);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-sm rounded-2xl border-border/40 shadow-2xl shadow-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Select Month
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a month and year to navigate your habit calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m, i) => (
              <motion.button
                key={m}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMonth(i)}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-all ${
                  selectedMonth === i
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card/40 text-foreground hover:bg-card/60 border border-border/30"
                }`}
              >
                {m}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedYear((y) => y - 1)}
              className="h-10 w-10 rounded-xl border-border/60 bg-background/40 transition-all hover:bg-background/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <motion.span
              key={selectedYear}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-[100px] text-center text-xl font-bold tabular-nums"
            >
              {selectedYear}
            </motion.span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedYear((y) => y + 1)}
              className="h-10 w-10 rounded-xl border-border/60 bg-background/40 transition-all hover:bg-background/60"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-border/60"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="rounded-xl shadow-lg shadow-primary/15"
          >
            Go to Month
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
