// ─── useFeedingSchedule.ts ───────────────────────────────────────────────────
// Reactively generates feeding schedule when inputs change.
// NO button required — schedule updates automatically.

import { useMemo } from "react";
import { generateFeedingSchedule, buildChecklist } from "../utils/feedingUtils";
import type { FeedingLog, ScheduleSlot, FeedingChecklistItem } from "../types/feeding.types";

interface UseFeedingScheduleResult {
  slots: ScheduleSlot[];
  checklist: FeedingChecklistItem[];
  dailyTotal: number;
  adaptiveNote: string;
}

export function useFeedingSchedule(
  biomassKg: number,
  avgWeightKg: number,
  tempC: number,
  mealsPerDay: 2 | 3 | 4,
  recentLogs: FeedingLog[],
  todayLogs: FeedingLog[]
): UseFeedingScheduleResult {
  // Schedule auto-regenerates on any input change (no button)
  const { slots, dailyTotal, adaptiveNote } = useMemo(
    () => generateFeedingSchedule(biomassKg, avgWeightKg, tempC, mealsPerDay, recentLogs),
    [biomassKg, avgWeightKg, tempC, mealsPerDay, recentLogs]
  );

  // Checklist reflects today's log state
  const checklist = useMemo(
    () => buildChecklist(slots, todayLogs),
    [slots, todayLogs]
  );

  return { slots, checklist, dailyTotal, adaptiveNote };
}
