// ─── useFeedingLogs.ts ───────────────────────────────────────────────────────
// Fetches today's feeding logs + 7-day history. Supports realtime updates.

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../shared/aquaCore";
import type { FeedingLog } from "../types/feeding.types";

// Mock data for demo mode
const MOCK_LOGS: { date: string; feed_amount: number }[] = [
  { date: "2025-07-01", feed_amount: 12.4 },
  { date: "2025-07-02", feed_amount: 11.8 },
  { date: "2025-07-03", feed_amount: 13.1 },
  { date: "2025-07-04", feed_amount: 12.0 },
  { date: "2025-07-05", feed_amount: 12.9 },
  { date: "2025-07-06", feed_amount: 11.5 },
  { date: "2025-07-07", feed_amount: 13.4 },
];

interface UseFeedingLogsResult {
  todayLogs: FeedingLog[];
  historyLogs: { date: string; feed_amount: number }[];
  recentLogs: FeedingLog[];
  loading: boolean;
  saveFeedingLog: (log: Omit<FeedingLog, "id" | "created_at">) => Promise<void>;
  refetch: () => void;
}

export function useFeedingLogs(pondId?: string): UseFeedingLogsResult {
  const [todayLogs, setTodayLogs] = useState<FeedingLog[]>([]);
  const [historyLogs, setHistoryLogs] = useState<{ date: string; feed_amount: number }[]>(MOCK_LOGS);
  const [recentLogs, setRecentLogs] = useState<FeedingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Today's detailed logs
      const { data: today } = await supabase
        .from("feeding_logs")
        .select("*")
        .gte("scheduled_time", `${todayStr}T00:00:00`)
        .lte("scheduled_time", `${todayStr}T23:59:59`)
        .order("scheduled_time");

      if (today) setTodayLogs(today);

      // 7-day history aggregated by date
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: history } = await supabase
        .from("feeding_logs")
        .select("scheduled_time, actual_amount")
        .gte("scheduled_time", sevenDaysAgo.toISOString())
        .eq("status", "done");

      if (history) {
        // Aggregate by date
        const byDate: Record<string, number> = {};
        history.forEach((r) => {
          const date = r.scheduled_time.split("T")[0];
          byDate[date] = (byDate[date] || 0) + (r.actual_amount || 0);
        });
        setHistoryLogs(
          Object.entries(byDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, feed_amount]) => ({ date, feed_amount: parseFloat(feed_amount.toFixed(2)) }))
        );
      }

      // Recent logs for adaptive adjustment (last 10)
      const { data: recent } = await supabase
        .from("feeding_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (recent) setRecentLogs(recent);
    } catch {
      // Demo mode — keep mock data
    } finally {
      setLoading(false);
    }
  }, [todayStr, pondId, tick]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Realtime subscription for live checklist updates
  useEffect(() => {
    const channel = supabase
      .channel("feeding-log-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feeding_logs" },
        () => setTick((t) => t + 1)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const saveFeedingLog = useCallback(
    async (log: Omit<FeedingLog, "id" | "created_at">) => {
      try {
        await supabase.from("feeding_logs").upsert([log], {
          onConflict: "pond_id,scheduled_time",
        });
        setTick((t) => t + 1);
      } catch {
        // Demo mode: optimistic local update
        setTodayLogs((prev) => [
          ...prev.filter((l) => l.scheduled_time !== log.scheduled_time),
          { ...log, id: Math.random().toString(), created_at: new Date().toISOString() },
        ]);
      }
    },
    []
  );

  return {
    todayLogs,
    historyLogs,
    recentLogs,
    loading,
    saveFeedingLog,
    refetch: () => setTick((t) => t + 1),
  };
}
