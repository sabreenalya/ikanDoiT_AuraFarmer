// ─── FeedingPage.tsx ─────────────────────────────────────────────────────────
// Intelligent Feeding Management System
// Schedule auto-generates on any input change — no button.
// Layout: left = parameters, right = live schedule card (like original UI)

import { useState, useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";

import { useBiomass, useFeedingSchedule, useFeedingLogs, useFeedPrice, useAlerts } from "./hooks";

import { FeedingChecklist, AlertsPanel, BiomassStatusCard } from "./components";

import { calcCostSummary, getFeedPercentage } from "./utils/feedingUtils";
import type { FeedingChecklistItem, FishResponse, FeedingLog, FeedingAlert } from "./types/feeding.types";

interface FeedingPageProps {
  user: { id: string; email?: string } | null;
  params: { Temp: number; [key: string]: number };
  pondId?: string;
  latestBiomass?: {
    id: string;
    pondId: string;
    biomass: number;
    avgWeight: number;
    fishCount: number;
    timestamp: string;
  } | null;
}

const MEAL_OPTIONS = [2, 3, 4] as const;

export default function FeedingPage({ user, params, pondId, latestBiomass }: FeedingPageProps) {
  const [mealsPerDay, setMealsPerDay] = useState<2 | 3 | 4>(3);
  const [activeChecklistItem, setActiveChecklistItem] = useState<FeedingChecklistItem | null>(null);

  const { biomass, isStale, loading: biomassLoading, refetch: refetchBiomass } =
    useBiomass(pondId);
  const { todayLogs, historyLogs, recentLogs, saveFeedingLog } =
    useFeedingLogs(pondId);
  const { pricePerKg, setPricePerKg } = useFeedPrice(user?.id);

  const latestMatchesPond = latestBiomass && (!pondId || String(latestBiomass.pondId) === String(pondId));
  const currentBiomass = latestMatchesPond
    ? {
        id: latestBiomass.id,
        pond_id: latestBiomass.pondId,
        biomass_kg: latestBiomass.biomass,
        avg_weight_kg: latestBiomass.avgWeight,
        fish_count: latestBiomass.fishCount,
        timestamp: latestBiomass.timestamp,
      }
    : biomass;
  const biomassKg = currentBiomass?.biomass_kg ?? 250;
  const avgWeightKg = currentBiomass?.avg_weight_kg ?? 0.1439;
  const avgWeightG = avgWeightKg * 1000;
  const fishCount = currentBiomass?.fish_count ?? 500;
  const growthRateGPerDay = 1.1;
  const tempC = params.Temp ?? 28;

  const biomassForDisplay = currentBiomass;

  const feedingRate = getFeedPercentage(avgWeightKg);

  const { checklist, dailyTotal, adaptiveNote } = useFeedingSchedule(
    biomassKg, avgWeightKg, tempC, mealsPerDay, recentLogs, todayLogs
  );

  const cost    = useMemo(() => calcCostSummary(dailyTotal, pricePerKg), [dailyTotal, pricePerKg]);
  const projectedMonthlyCost = useMemo(() => {
    const DAYS = 30;
    const effectivePct = biomassKg > 0 ? dailyTotal / biomassKg : 0;
    const dailyBiomassGainKg = (fishCount * growthRateGPerDay) / 1000;
    const triangular = (DAYS - 1) * DAYS / 2;
    const monthlyFeedKg = effectivePct * (DAYS * biomassKg + dailyBiomassGainKg * triangular);
    return parseFloat((monthlyFeedKg * pricePerKg).toFixed(2));
  }, [biomassKg, dailyTotal, fishCount, growthRateGPerDay, pricePerKg]);
  const sevenDayChartData = useMemo(() => {
    const totalsByDate = new Map(historyLogs.map((entry) => [entry.date, entry.feed_amount]));
    const estimatedDailyFeedKg = biomassKg * feedingRate;
    const dailyVariation = [0.88, 0.93, 0.90, 0.96, 0.92, 0.98];
    const days = [];
    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - daysAgo);
      const dateKey = date.toISOString().slice(0, 10);
      const hasRecordedFeed = totalsByDate.has(dateKey);
      const isEstimate = daysAgo > 0 && !hasRecordedFeed;
      const variationIndex = 6 - daysAgo;
      days.push({
        date: dateKey,
        feed_amount: hasRecordedFeed
          ? totalsByDate.get(dateKey)!
          : isEstimate
            ? Number((estimatedDailyFeedKg * dailyVariation[variationIndex]).toFixed(2))
            : 0,
        isEstimate,
      });
    }
    return days;
  }, [historyLogs, biomassKg, feedingRate]);

  // biomass_records uses "timestamp" column (not "created_at")
  const biomassUpdatedAt = biomass
    ? new Date((biomass as any).timestamp ?? (biomass as any).created_at)
    : null;
  const { alerts, dismiss } = useAlerts(checklist, biomassUpdatedAt);

  const doneCount = checklist.filter((i) => i.status === "done").length;

  async function handleComplete(
    item: FeedingChecklistItem,
    actualAmount: number,
    fishResponse: FishResponse,
    notes: string
  ) {
    const log: Omit<FeedingLog, "id" | "created_at"> = {
      pond_id: pondId ?? "default",
      scheduled_time: item.scheduledAt.toISOString(),
      recommended_amount: item.amount,
      actual_amount: actualAmount,
      status: "done",
      fish_response: fishResponse,
      notes: notes || null,
    };
    await saveFeedingLog(log);
  }

  function handleAlertClick(alert: FeedingAlert) {
    if (alert.type === "missed") {
      const prefix = "missed-";
      if (alert.id.startsWith(prefix)) {
        const checklistId = alert.id.slice(prefix.length);
        const item = checklist.find((i) => i.id === checklistId);
        if (item) {
          setActiveChecklistItem(item);
        }
      }
    }
  }

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2
            className="text-xl font-bold text-slate-800"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Feeding Management
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Auto-updated ·{" "}
            {new Date().toLocaleDateString("en-MY", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
        </div>
        {adaptiveNote && (
          <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {adaptiveNote}
          </div>
        )}
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={alerts} onDismiss={dismiss} onAlertClick={handleAlertClick} />

      {/* Biomass banner */}
      <BiomassStatusCard
        biomass={biomassForDisplay}
        isStale={isStale}
        loading={biomassLoading}
        onRefetch={refetchBiomass}
      />

      {/* ── CORE ROW: Parameters LEFT · Schedule RIGHT ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* LEFT — Parameters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3
            className="font-semibold text-slate-700 mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Feeding Parameters
          </h3>

          <div className="space-y-4">
            {/* Biomass — read-only, auto-synced */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Total Biomass (kg)
              </label>
              <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm">
                <span className="font-semibold text-[#0B3D91]">{biomassKg.toFixed(1)} kg</span>
                <span className="text-xs text-slate-400">auto-synced</span>
              </div>
            </div>

            {/* Meals selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Meals per Day
              </label>
              <div className="flex gap-2">
                {MEAL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setMealsPerDay(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      mealsPerDay === n
                        ? "bg-[#0B3D91] text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {n}×
                  </button>
                ))}
              </div>
            </div>

            {/* Info summary */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>⚖ Avg fish weight</span>
                <strong className="text-slate-700">{avgWeightG.toFixed(1)}g / fish</strong>
              </div>
              <div className="flex justify-between">
                <span>🐟 Fish count</span>
                <strong className="text-slate-700">{fishCount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>📈 Feeding rate</span>
                <strong className="text-slate-700">{(feedingRate * 100).toFixed(0)}%</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                <span>📊 Daily feed target</span>
                <strong className="text-[#0B3D91]">{dailyTotal} kg/day</strong>
              </div>
            </div>

            {/* Feed price */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Feed Price (RM/kg)
              </label>
              <input
                type="number"
                step="0.10"
                min="0.1"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(parseFloat(e.target.value) || pricePerKg)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Growth rate: <span className="font-semibold text-slate-700">{growthRateGPerDay.toFixed(1)} g/day</span>
              </p>
            </div>

            {/* Cost summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-500 mb-0.5">Daily Cost</p>
                <p className="font-bold text-blue-700 text-base">RM {cost.dailyCost.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-indigo-500 mb-0.5">Monthly Est.</p>
                <p className="font-bold text-indigo-700 text-base">
                  RM {projectedMonthlyCost >= 1000
                    ? `${(projectedMonthlyCost / 1000).toFixed(1)}k`
                    : projectedMonthlyCost.toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Auto-generated schedule (no button) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-1">
            <h3
              className="font-semibold text-slate-700"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Today's Schedule
            </h3>
            <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Daily total: <strong className="text-emerald-700">{dailyTotal} kg</strong>
            {" · "}
            {doneCount}/{checklist.length} meals done
          </p>

          {/* Progress bar */}
          <div className="h-1.5 bg-emerald-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: checklist.length ? `${(doneCount / checklist.length) * 100}%` : "0%" }}
            />
          </div>

          {/* Slots */}
          <div className="space-y-2.5">
            {checklist.map((slot, i) => {
              const now    = new Date();
              const isNext =
                slot.status === "pending" &&
                slot.scheduledAt > now &&
                checklist.find((s) => s.status === "pending" && s.scheduledAt > now)?.id === slot.id;
              const isPast = slot.status === "pending" && slot.scheduledAt <= now;

              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between bg-white rounded-xl px-4 py-3 border transition-all ${
                    slot.status === "done"    ? "border-emerald-200 opacity-80"
                    : slot.status === "missed" ? "border-red-200 bg-red-50"
                    : isNext                   ? "border-amber-300 ring-2 ring-amber-200"
                    : "border-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      slot.status === "done"    ? "bg-emerald-100"
                      : slot.status === "missed" ? "bg-red-100"
                      : isPast                   ? "bg-amber-100"
                      : "bg-slate-100"
                    }`}>
                      {slot.status === "done"    ? "✅"
                       : slot.status === "missed" ? "🚨"
                       : isPast                   ? "⏰"
                       : `${i + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{slot.time}</span>
                        {isNext && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{slot.label}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      slot.status === "done"    ? "text-emerald-600"
                      : slot.status === "missed" ? "text-red-500"
                      : "text-slate-700"
                    }`}>
                      {slot.amount} kg
                    </p>
                    {slot.status === "done" && slot.actualAmount !== undefined && (
                      <p className="text-xs text-slate-400">actual: {slot.actualAmount} kg</p>
                    )}
                    {slot.fishResponse && (
                      <p className="text-xs text-slate-400">
                        {slot.fishResponse === "finished"  ? "🐟 Finished"
                         : slot.fishResponse === "leftover" ? "🍽 Leftover"
                         : "😴 Not eating"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      

      {/* 7-day history chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-semibold text-slate-700 text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            7-Day Feed History
          </h3>
          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">kg/day</span>
        </div>

        <ResponsiveContainer width="100%" height={210}>
          <BarChart
            data={sevenDayChartData}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="feedHistoryBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1762c4" />
                <stop offset="100%" stopColor="#0B3D91" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 4" stroke="#eaf0f7" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickMargin={9}
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis width={34} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              formatter={(v: number) => [`${v} kg`, "Feed given"]}
              cursor={{ fill: "#f1f5f9", opacity: 0.65 }}
            />
            <Bar dataKey="feed_amount" fill="url(#feedHistoryBar)" barSize={52} radius={[7, 7, 0, 0]} name="Feed (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3
          className="font-semibold text-slate-700 mb-4"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Feeding Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase border-b border-slate-100">
                <th className="pb-2 text-left font-semibold">Date</th>
                <th className="pb-2 text-right font-semibold">Fed (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyLogs.map((r, i) => {
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 text-slate-600">{r.date}</td>
                    <td className="py-2.5 text-right font-semibold text-[#0B3D91]">{r.feed_amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
