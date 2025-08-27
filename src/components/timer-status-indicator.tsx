"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Timer, Play } from "lucide-react";
import { useJobTimerStore } from "@/stores/job-timer-store";

/**
 * A small component that shows active timers in the header/navbar
 * This demonstrates the persistent state across page navigation
 */
export function TimerStatusIndicator() {
  const [mounted, setMounted] = useState(false);
  const { getActiveTimers, getTimerStats } = useJobTimerStore();

  // Prevent hydration mismatch by only rendering after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeTimers = getActiveTimers();
  const stats = getTimerStats();

  if (activeTimers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Timer className="h-4 w-4 text-green-500" />
      <Badge variant="secondary" className="flex items-center gap-1">
        <Play className="h-3 w-3" />
        {stats.activeTimers} Active
      </Badge>
      {activeTimers.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {activeTimers[0].customerName}
          {activeTimers.length > 1 && ` +${activeTimers.length - 1} more`}
        </span>
      )}
    </div>
  );
}
