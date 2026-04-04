// ─── feedingUtils.ts ─────────────────────────────────────────────────────────
// Pure utility functions — no React, no Supabase, fully testable

import type {
  ScheduleSlot,
  FeedingLog,
  FeedingInsight,
  AdaptiveAdjustment,
  CostSummary,
  FeedingAlert,
  FeedingChecklistItem,
  FeedingStatus,
} from "../types/feeding.types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MEAL_TIMES: Record<number, { time: string; label: string }[]> = {
  2: [
    { time: "07:00", label: "Morning Feed" },
    { time: "17:00", label: "Evening Feed" },
  ],
  3: [
    { time: "06:00", label: "Morning Feed" },
    { time: "12:00", label: "Midday Feed" },
    { time: "18:00", label: "Evening Feed" },
  ],
  4: [
    { time: "06:00", label: "Morning Feed" },
    { time: "10:00", label: "Late Morning" },
    { time: "14:00", label: "Afternoon Feed" },
    { time: "18:00", label: "Evening Feed" },
  ],
};

// ─── Schedule Generator ───────────────────────────────────────────────────────

/**
 * Calculates base feed percentage based on average fish weight.
 * Smaller fish eat relatively more (higher %); larger fish eat less.
 */
export function getFeedPercentage(avgWeightKg: number): number {
  if (avgWeightKg < 0.05) return 0.05;   // fingerlings: 5%
  if (avgWeightKg < 0.1)  return 0.045;
  if (avgWeightKg < 0.2)  return 0.04;   // juvenile: 4%
  if (avgWeightKg < 0.35) return 0.035;
  return 0.03;                             // adult: 3%
}

/**
 * Temperature adjustment factor for feed amount.
 * Fish are ectotherms — metabolism slows at extremes.
 */
export function getTempFactor(tempC: number): number {
  if (tempC > 32) return 0.70;   // critical heat stress
  if (tempC > 30) return 0.85;   // warm — reduce
  if (tempC < 22) return 0.80;   // cold — metabolism slow
  if (tempC < 24) return 0.90;
  return 1.0;                     // optimal 24–30°C
}

/**
 * Adaptive adjustment based on recent fish response history.
 * Reduces feed if leftovers/not eating; increases if consistently finished.
 */
export function getAdaptiveFactor(recentLogs: FeedingLog[]): AdaptiveAdjustment {
  if (recentLogs.length === 0) return { factor: 1.0, reason: "No history yet" };

  const recent = recentLogs.slice(0, 6); // last 6 feedings
  const responses = recent
    .filter((l) => l.fish_response !== null)
    .map((l) => l.fish_response);

  if (responses.length === 0) return { factor: 1.0, reason: "No response data" };

  const leftoverCount = responses.filter((r) => r === "leftover").length;
  const notEatingCount = responses.filter((r) => r === "not_eating").length;
  const finishedCount = responses.filter((r) => r === "finished").length;
  const total = responses.length;

  if (notEatingCount / total >= 0.5) return { factor: 0.75, reason: "Fish not eating — reduce feed 25%" };
  if (leftoverCount / total >= 0.5)  return { factor: 0.85, reason: "Consistent leftovers — reduce feed 15%" };
  if (leftoverCount / total >= 0.33) return { factor: 0.92, reason: "Some leftovers — slight reduction" };
  if (finishedCount / total >= 0.83) return { factor: 1.08, reason: "Consistently finishing — slight increase" };

  return { factor: 1.0, reason: "Normal consumption" };
}

/**
 * Main schedule generator — reactive to biomass, temp, meals, history.
 * No button needed: call this in a useMemo/useEffect.
 */
export function generateFeedingSchedule(
  biomassKg: number,
  avgWeightKg: number,
  tempC: number,
  mealsPerDay: 2 | 3 | 4,
  recentLogs: FeedingLog[] = []
): { slots: ScheduleSlot[]; dailyTotal: number; adaptiveNote: string } {
  const basePct = getFeedPercentage(avgWeightKg);
  const tempFactor = getTempFactor(tempC);
  const adaptive = getAdaptiveFactor(recentLogs);

  const dailyTotal = parseFloat(
    (biomassKg * basePct * tempFactor * adaptive.factor).toFixed(2)
  );
  const amountPerMeal = parseFloat((dailyTotal / mealsPerDay).toFixed(3));

  const slots: ScheduleSlot[] = MEAL_TIMES[mealsPerDay].map((m) => ({
    ...m,
    amount: amountPerMeal,
  }));

  return { slots, dailyTotal, adaptiveNote: adaptive.reason };
}

// ─── Checklist Builder ────────────────────────────────────────────────────────

/**
 * Converts schedule slots into today's checklist items with full timestamps.
 */
export function buildChecklist(
  slots: ScheduleSlot[],
  existingLogs: FeedingLog[]
): FeedingChecklistItem[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  return slots.map((slot) => {
    const [h, m] = slot.time.split(":").map(Number);
    const scheduledAt = new Date(today);
    scheduledAt.setHours(h, m, 0, 0);

    const id = `${todayStr}-${slot.time}`;
    const existing = existingLogs.find(
      (l) => l.scheduled_time.includes(`${todayStr}T${slot.time}`)
    );

    // Determine status
    let status: FeedingStatus = "pending";
    if (existing) {
      status = existing.status as FeedingStatus;
    } else if (scheduledAt < new Date() && !existing) {
      // Grace period: 15 min past slot → missed
      const missedThreshold = new Date(scheduledAt.getTime() + 15 * 60 * 1000);
      if (new Date() > missedThreshold) status = "missed";
    }

    return {
      ...slot,
      id,
      scheduledAt,
      status,
      actualAmount: existing?.actual_amount,
      fishResponse: existing?.fish_response ?? undefined,
      notes: existing?.notes ?? undefined,
      completedAt: existing?.created_at ? new Date(existing.created_at) : undefined,
    };
  });
}

// ─── Cost Calculator ──────────────────────────────────────────────────────────

export function calcCostSummary(
  dailyFeedKg: number,
  pricePerKg: number
): CostSummary {
  const dailyCost = parseFloat((dailyFeedKg * pricePerKg).toFixed(2));
  return {
    dailyFeed: dailyFeedKg,
    dailyCost,
    monthlyCost: parseFloat((dailyCost * 30).toFixed(2)),
    pricePerKg,
  };
}

// ─── Alert Logic ─────────────────────────────────────────────────────────────

/**
 * Generates alerts from checklist state + biomass staleness.
 * Designed to run on a 60-second interval.
 */
export function generateAlerts(
  checklist: FeedingChecklistItem[],
  biomassUpdatedAt: Date | null
): FeedingAlert[] {
  const alerts: FeedingAlert[] = [];
  const now = new Date();

  // Biomass staleness warning
  if (biomassUpdatedAt) {
    const hoursStale = (now.getTime() - biomassUpdatedAt.getTime()) / 3_600_000;
    if (hoursStale > 24) {
      alerts.push({
        id: "biomass-stale",
        type: "abnormal",
        severity: "warning",
        message: `Biomass data is ${Math.floor(hoursStale)}h old — update recommended`,
        triggeredAt: now,
        dismissed: false,
      });
    }
  }

  checklist.forEach((item) => {
    const minsUntil = (item.scheduledAt.getTime() - now.getTime()) / 60_000;

    // Upcoming reminder (15 min window)
    if (item.status === "pending" && minsUntil > 0 && minsUntil <= 15) {
      alerts.push({
        id: `reminder-${item.id}`,
        type: "reminder",
        severity: "info",
        message: `⏰ ${item.label} in ${Math.round(minsUntil)} min — prepare ${item.amount} kg`,
        triggeredAt: now,
        dismissed: false,
      });
    }

    // Missed feeding
    if (item.status === "missed") {
      alerts.push({
        id: `missed-${item.id}`,
        type: "missed",
        severity: "critical",
        message: `⏰ Feeding Overdue: ${item.label} at ${item.time} — please log it now`,
        triggeredAt: now,
        dismissed: false,
      });
    }

    // Abnormal: fish not eating
    if (item.fishResponse === "not_eating") {
      alerts.push({
        id: `noteat-${item.id}`,
        type: "abnormal",
        severity: "warning",
        message: `🐟 Fish not eating at ${item.time} — check water quality & health`,
        triggeredAt: now,
        dismissed: false,
      });
    }
  });

  return alerts;
}

// ─── Feed Insights ────────────────────────────────────────────────────────────

/**
 * Analyzes 7-day log history for trends, overfeeding, and drops.
 */
export function analyzeFeedingInsights(
  logs: { date: string; feed_amount: number }[]
): FeedingInsight {
  if (logs.length < 4) return { type: "normal", message: "Not enough data for insights yet" };

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));

  const avgFirst = firstHalf.reduce((s, r) => s + r.feed_amount, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, r) => s + r.feed_amount, 0) / secondHalf.length;
  const pct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

  if (avgSecond > 15 && pct > 15) return {
    type: "overfeeding",
    message: `⚠️ Possible overfeeding detected — feed up ${pct.toFixed(0)}% this week`,
    percentage: pct,
  };
  if (pct > 20) return {
    type: "trend_up",
    message: `📈 Feeding increased ${pct.toFixed(0)}% this week — review biomass data`,
    percentage: pct,
  };
  if (pct < -20) return {
    type: "drop",
    message: `📉 Feeding dropped ${Math.abs(pct).toFixed(0)}% this week — check fish appetite`,
    percentage: pct,
  };
  if (pct > 10) return {
    type: "trend_up",
    message: `Feeding up ${pct.toFixed(0)}% vs. last period — growth on track`,
    percentage: pct,
  };

  return { type: "normal", message: "✅ Feeding pattern is stable this week", percentage: pct };
}
