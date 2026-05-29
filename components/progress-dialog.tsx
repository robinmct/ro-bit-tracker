"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: number;
  onSave: (day: number, val: number) => void;
}

export function ProgressDialog({
  open,
  onOpenChange,
  day,
  onSave,
}: ProgressDialogProps) {
  const { viewYear, viewMonth, getCurrentHabit, getMonthData } = useHabitStore();
  const habit = getCurrentHabit();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open || !habit) return;
    const md = getMonthData(habit.id, viewYear, viewMonth);
    setValue(md[day] != null ? String(md[day]) : "");
  }, [open, day, habit, viewYear, viewMonth, getMonthData]);

  const handleSave = () => {
    const v = Math.max(0, Math.floor(Number(value) || 0));
    onSave(day, v);
  };

  if (!habit) return null;

  const dateStr = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, day));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-sm rounded border-border/40 shadow-2xl shadow-primary/5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">
            Update Progress
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {dateStr} <span className="mx-1">&bull;</span> {habit.name}{" "}
            {habit.type === "time" ? "(minutes)" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="progress-value" className="text-sm font-medium">
              Value
            </Label>
            <Input
              id="progress-value"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                habit.type === "time" ? "Enter minutes" : "Enter value"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
              className="h-11 rounded border-border/60 bg-background/50 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-1.5 rounded border-border/60"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="gap-1.5 rounded shadow-lg shadow-primary/15"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
