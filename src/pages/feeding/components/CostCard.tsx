// ─── CostCard.tsx ─────────────────────────────────────────────────────────────
// Displays daily feed cost and monthly projection.
// Includes inline price-per-kg editor.

import { useState } from "react";
import type { CostSummary } from "../types/feeding.types";

interface CostCardProps {
  cost: CostSummary;
  onPriceChange: (price: number) => void;
  saving?: boolean;
}

export default function CostCard({ cost, onPriceChange, saving }: CostCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(cost.pricePerKg));

  function commitPrice() {
    const val = parseFloat(draft);
    if (!isNaN(val) && val > 0) onPriceChange(val);
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-slate-700 text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Feed Cost Tracker
        </h3>
        {/* Price per kg editor */}
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <span className="text-xs text-slate-500">RM/kg</span>
              <input
                autoFocus
                type="number"
                step="0.10"
                min="0.1"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commitPrice()}
                onBlur={commitPrice}
                className="w-20 px-2 py-1 text-xs rounded-lg border border-blue-300 outline-none text-right font-semibold"
              />
            </>
          ) : (
            <button
              onClick={() => { setDraft(String(cost.pricePerKg)); setEditing(true); }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-all font-medium"
            >
              RM {cost.pricePerKg.toFixed(2)}/kg
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {saving && <span className="text-xs text-slate-400">Saving…</span>}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Daily Feed</p>
          <p className="text-lg font-bold text-slate-800">{cost.dailyFeed}</p>
          <p className="text-xs text-slate-400">kg</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">Daily Cost</p>
          <p className="text-lg font-bold text-blue-700">
            RM {cost.dailyCost.toFixed(2)}
          </p>
          <p className="text-xs text-blue-400">today</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-xs text-indigo-600 mb-1">Monthly Est.</p>
          <p className="text-lg font-bold text-indigo-700">
            RM {cost.monthlyCost >= 1000
              ? `${(cost.monthlyCost / 1000).toFixed(1)}k`
              : cost.monthlyCost.toFixed(0)}
          </p>
          <p className="text-xs text-indigo-400">projected</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        Based on {cost.dailyFeed} kg/day × RM {cost.pricePerKg.toFixed(2)}/kg × 30 days
      </p>
    </div>
  );
}
