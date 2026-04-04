// ─── BiomassStatusCard.tsx ───────────────────────────────────────────────────
// Displays the auto-fetched biomass. Shows staleness warning if > 24h old.

import type { BiomassRecord } from "../types/feeding.types";

interface BiomassStatusCardProps {
  biomass: BiomassRecord | null;
  isStale: boolean;
  loading: boolean;
  onRefetch: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BiomassStatusCard({
  biomass,
  isStale,
  loading,
  onRefetch,
}: BiomassStatusCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isStale
          ? "bg-amber-50 border-amber-200"
          : "bg-gradient-to-br from-[#0B3D91]/5 to-[#0288D1]/5 border-blue-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Active Biomass
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-slate-200 rounded animate-pulse" />
          ) : biomass ? (
            <>
              <p className="text-3xl font-bold text-[#0B3D91]">
                {biomass.biomass_kg.toFixed(1)}{" "}
                <span className="text-base font-normal text-slate-500">kg</span>
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-slate-500">
                  {biomass.fish_count?.toLocaleString()} fish
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">
                  avg {((biomass.avg_weight_kg || 0.18) * 1000).toFixed(0)}g/fish
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No biomass data found</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={onRefetch}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0B3D91] hover:border-blue-300 transition-all shadow-sm"
            title="Refresh biomass"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          {biomass && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isStale
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isStale ? "⚠ Stale" : "● Live"} · {timeAgo((biomass as any).timestamp ?? (biomass as any).created_at)}
            </span>
          )}
        </div>
      </div>

      {isStale && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-1.5">
          ⚠ Biomass data is over 24 hours old — feeding estimates may be inaccurate. Please update in the Biomass module.
        </p>
      )}
    </div>
  );
}