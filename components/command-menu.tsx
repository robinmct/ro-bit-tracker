"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import { useHabitStore } from "@/store/habit-store";
import { auth, signOut } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const { habits, currentHabitId, setCurrentHabit, navigateMonth } = useHabitStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 gap-2 rounded-xl border-border/60 bg-background/40 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-background/60 hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Command</span>
        <kbd className="pointer-events-none ml-1 hidden select-none items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong overflow-hidden rounded-2xl border border-border/40 p-0 shadow-2xl shadow-primary/5 sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>
              Search habits and execute commands using the keyboard.
            </DialogDescription>
          </DialogHeader>
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-list]]:max-h-[400px] [&_[cmdk-list]]:p-2">
            <CommandInput
              placeholder="Type a command or search habits..."
              className="border-b border-border/30 bg-transparent px-4 text-foreground placeholder:text-muted-foreground outline-none"
            />
            <CommandList className="max-h-[400px] overflow-y-auto p-2">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>

              <CommandGroup
                heading="Navigation"
                className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                <CommandItem
                  onSelect={() => {
                    navigateMonth("prev");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  Previous Month
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    navigateMonth("next");
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  Next Month
                </CommandItem>
              </CommandGroup>

              <CommandSeparator className="mx-2 my-1 bg-border/30" />

              <CommandGroup
                heading="Habits"
                className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                {habits.map((habit) => (
                  <CommandItem
                    key={habit.id}
                    onSelect={() => {
                      setCurrentHabit(habit.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground",
                      currentHabitId === habit.id && "bg-primary/5"
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="flex-1 truncate">
                      {habit.icon ? `${habit.icon} ` : ""}
                      {habit.name}
                    </span>
                    {currentHabitId === habit.id && (
                      <Target className="h-3.5 w-3.5 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator className="mx-2 my-1 bg-border/30" />

              <CommandGroup
                heading="Actions"
                className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("robit:add-habit"));
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  Add New Habit
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    window.dispatchEvent(new CustomEvent("robit:edit-habit"));
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Edit Current Habit
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    handleSignOut();
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-foreground transition-colors aria-selected:bg-primary/10 aria-selected:text-foreground"
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Sign Out
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
