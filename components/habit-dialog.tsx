"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getDbInstance, doc, setDoc, deleteDoc } from "@/lib/firebase";
import { useHabitStore, type HabitType } from "@/store/habit-store";
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
import { toast } from "sonner";
import { Trash2, Save, X, Check, Target, Hash, Clock, Palette, Type, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiInput } from "@/components/emoji-input";

const PRESET_COLORS = [
  "#a78bfa", "#8b5cf6", "#6366f1", "#3b82f6",
  "#06b6d4", "#14b8a6", "#10b981", "#84cc16",
  "#eab308", "#f59e0b", "#f97316", "#ef4444",
  "#ec4899", "#d946ef", "#f43f5e", "#78716c",
];

const TYPE_CONFIG: Record<HabitType, { label: string; icon: typeof Check; desc: string }> = {
  binary: { label: "Binary", icon: Check, desc: "Mark as done or missed" },
  step: { label: "Step-based", icon: Hash, desc: "Track a numeric amount" },
  time: { label: "Time-based", icon: Clock, desc: "Track minutes per day" },
};

interface HabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
}

export function HabitDialog({ open, onOpenChange, mode }: HabitDialogProps) {
  const { user } = useAuth();
  const { addHabit, updateHabit, getCurrentHabit, deleteHabit } = useHabitStore();
  const current = getCurrentHabit();

  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("binary");
  const [goal, setGoal] = useState("30");
  const [color, setColor] = useState("#a78bfa");
  const [icon, setIcon] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      return;
    }
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (mode === "edit" && current) {
      setName(current.name);
      setType(current.type);
      setGoal(String(current.goal));
      setColor(current.color);
      setIcon(current.icon);
    } else if (mode === "add") {
      setName("");
      setType("binary");
      setGoal("30");
      setColor("#a78bfa");
      setIcon("");
    }
    setShowDeleteConfirm(false);
  }, [mode, current, open]);

  const handleSave = async () => {
    const trimmedName = name.trim() || "New Habit";
    const numGoal = type === "binary" ? 1 : Number(goal) || 1;
    const safeIcon = icon.trim();
    try {
      if (mode === "add") {
        const habit = addHabit({
          name: trimmedName,
          type,
          goal: numGoal,
          color,
          icon: safeIcon,
        });
        if (user) {
          await setDoc(doc(getDbInstance(), "users", user.uid, "habits", habit.id), {
            name: habit.name,
            type: habit.type,
            goal: habit.goal,
            color: habit.color,
            icon: habit.icon,
            order: habit.order,
          });
        }
        toast.success("Habit created");
      } else if (current) {
        updateHabit(current.id, {
          name: trimmedName,
          type,
          goal: numGoal,
          color,
          icon: safeIcon,
        });
        if (user) {
          await setDoc(doc(getDbInstance(), "users", user.uid, "habits", current.id), {
            name: trimmedName,
            type,
            goal: numGoal,
            color,
            icon: safeIcon,
            order: current.order,
          });
        }
        toast.success("Habit updated");
      }
    } catch (err) {
      toast.error("Failed to save habit");
      console.error(err);
    } finally {
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!current) return;
    const success = deleteHabit(current.id);
    if (success) {
      if (user) {
        await deleteDoc(doc(getDbInstance(), "users", user.uid, "habits", current.id)).catch(() => {});
      }
      toast.success("Habit deleted");
      onOpenChange(false);
    } else {
      toast.error("Cannot delete the last habit");
    }
  };

  const previewName = name.trim() || "Habit Preview";
  const TypeIcon = TYPE_CONFIG[type].icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong sm:max-w-[420px] rounded border-primary/15 p-0 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === "add" ? "Add Habit" : "Edit Habit"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {mode === "add"
              ? "Create a new habit to track daily"
              : "Update your habit details"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          {/* Live Preview Card */}
          <div className="mb-5 rounded border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] p-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-lg"
                style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}40` }}
              >
                {icon.trim() || <TypeIcon className="h-4 w-4" style={{ color }} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{previewName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {TYPE_CONFIG[type].label}
                  {type !== "binary" && ` · Goal: ${goal}`}
                </p>
              </div>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}60` }}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            {/* Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="habit-name" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Type className="h-3 w-3" />
                Name
              </Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Run"
                maxLength={50}
                className="h-10 rounded border-border/50 bg-background/40 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            {/* Icon */}
            <div className="grid gap-1.5">
              <Label htmlFor="habit-icon" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Smile className="h-3 w-3" />
                Icon (emoji)
              </Label>
              <EmojiInput
                id="habit-icon"
                value={icon}
                onChange={setIcon}
                placeholder="Select emoji..."
                className="h-10 rounded border-border/50 bg-background/40"
              />
            </div>

            {/* Type */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Target className="h-3 w-3" />
                Tracking Type
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(TYPE_CONFIG) as HabitType[]).map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const Icon = cfg.icon;
                  const isActive = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded border px-2 py-2.5 text-center transition-all",
                        isActive
                          ? "border-primary/40 bg-primary/10 text-foreground shadow-sm shadow-primary/10"
                          : "border-border/40 bg-card/30 text-muted-foreground hover:border-border/70 hover:bg-card/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      <span className="text-[11px] font-medium leading-tight">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal - only for non-binary */}
            <AnimatePresence>
              {type !== "binary" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-1.5 overflow-hidden"
                >
                  <Label htmlFor="habit-goal" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    Daily Goal
                  </Label>
                  <Input
                    id="habit-goal"
                    type="number"
                    min={1}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="h-10 rounded border-border/50 bg-background/40 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Palette className="h-3 w-3" />
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "relative h-7 w-7 rounded-full transition-all",
                      color === c
                        ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  >
                    {color === c && (
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
                {/* Custom color picker */}
                <div className="relative h-7 w-7">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground transition-all",
                      !PRESET_COLORS.includes(color) && "ring-2 ring-primary/50"
                    )}
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Custom color"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 gap-2">
          {mode === "edit" && (
            <div className="mr-auto">
              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <motion.div
                    key="delete-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="gap-1.5 rounded text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="delete-confirm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2 rounded border border-destructive/20 bg-destructive/5 px-3 py-1.5"
                  >
                    <span className="text-xs text-muted-foreground">Delete?</span>
                    <button
                      onClick={handleDelete}
                      className="rounded px-2 py-0.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      No
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="gap-1.5 rounded border-border/60"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-1.5 rounded shadow-lg shadow-primary/15"
          >
            <Save className="h-3.5 w-3.5" />
            {mode === "add" ? "Create" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
