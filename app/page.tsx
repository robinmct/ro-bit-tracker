"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { HabitTracker } from "@/components/habit-tracker";
import { useHabitStore } from "@/store/habit-store";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const setUserId = useHabitStore((s) => s.setUserId);
  const resetState = useHabitStore((s) => s.resetState);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      resetState();
      router.replace("/login");
    } else {
      setUserId(user.uid);
    }
  }, [user, loading, router, setUserId, resetState]);

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-[3px] border-primary/20 border-t-primary"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-muted-foreground"
        >
          Loading your habits...
        </motion.p>
      </div>
    );
  }

  if (!user) return null;

  return <HabitTracker />;
}
