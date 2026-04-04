// ─── useAlerts.ts ─────────────────────────────────────────────────────────────
// Generates and manages feeding alerts. Runs on 60-second intervals.

import { useState, useEffect, useCallback } from "react";
import { generateAlerts } from "../utils/feedingUtils";
import type { FeedingAlert, FeedingChecklistItem } from "../types/feeding.types";

export function useAlerts(
  checklist: FeedingChecklistItem[],
  biomassUpdatedAt: Date | null
) {
  const [alerts, setAlerts] = useState<FeedingAlert[]>([]);

  const refresh = useCallback(() => {
    const fresh = generateAlerts(checklist, biomassUpdatedAt);
    setAlerts((prev) => {
      // Preserve dismissed state across refreshes
      const dismissedIds = new Set(prev.filter((a) => a.dismissed).map((a) => a.id));
      return fresh.map((a) => ({ ...a, dismissed: dismissedIds.has(a.id) }));
    });
  }, [checklist, biomassUpdatedAt]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000); // check every minute
    return () => clearInterval(interval);
  }, [refresh]);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts: activeAlerts, dismiss };
}
