// ─── FeedingChecklist.tsx ─────────────────────────────────────────────────────
// Interactive feeding checklist. Each slot can be marked done with a modal
// capturing actual amount and fish response.

import { useState } from "react";
import type {
  FeedingChecklistItem,
  FishResponse,
  FeedingStatus,
} from "../types/feeding.types";

interface ChecklistProps {
  items: FeedingChecklistItem[];
  onComplete: (
    item: FeedingChecklistItem,
    actualAmount: number,
    fishResponse: FishResponse,
    notes: string
  ) => void;
  activeItem?: FeedingChecklistItem | null;
  onChangeActiveItem?: (item: FeedingChecklistItem | null) => void;
}

const STATUS_CONFIG: Record<
  FeedingStatus,
  { bg: string; border: string; badge: string; badgeText: string; icon: string }
> = {
  pending: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-500",
    badgeText: "Pending",
    icon: "⏳",
  },
  done: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    badgeText: "Done",
    icon: "✅",
  },
  missed: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-600",
    badgeText: "Missed",
    icon: "🚨",
  },
};

const FISH_RESPONSES: { value: FishResponse; label: string; emoji: string; desc: string }[] = [
  { value: "finished", label: "All finished", emoji: "🐟", desc: "Fish ate all the feed" },
  { value: "leftover", label: "Leftover", emoji: "🍽️", desc: "Feed remaining in pond" },
  { value: "not_eating", label: "Not eating", emoji: "😴", desc: "Fish ignored feed" },
];

interface DoneModalProps {
  item: FeedingChecklistItem;
  onSubmit: (actual: number, response: FishResponse, notes: string) => void;
  onClose: () => void;
}

function DoneModal({ item, onSubmit, onClose }: DoneModalProps) {
  const [actual, setActual] = useState(String(item.amount));
  const [response, setResponse] = useState<FishResponse | null>(null);
  const [notes, setNotes] = useState("");

  return (
    /* Faux viewport wrapper — required for correct iframe height */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4
              className="font-bold text-slate-800"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Log Feeding — {item.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled: {item.time} · Recommended: {item.amount} kg
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {/* Actual amount */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Actual feed given (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-center focus:border-blue-400 outline-none"
          />
        </div>

        {/* Fish response */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-2">
            Did fish finish the feed?
          </label>
          <div className="space-y-2">
            {FISH_RESPONSES.map((r) => (
              <button
                key={r.value}
                onClick={() => setResponse(r.value)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${
                  response === r.value
                    ? "border-[#0B3D91] bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-xl">{r.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{r.label}</p>
                  <p className="text-xs text-slate-400">{r.desc}</p>
                </div>
                {response === r.value && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#0B3D91] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Notes (optional)
          </label>
          <input
            type="text"
            placeholder="Any observations…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-400 outline-none"
          />
        </div>

        <button
          disabled={!response}
          onClick={() => {
            const amt = parseFloat(actual) || item.amount;
            onSubmit(amt, response!, notes);
          }}
          className="w-full py-3 bg-[#0B3D91] text-white rounded-xl font-bold text-sm hover:bg-[#1565C0] transition-all shadow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Feeding Log
        </button>
      </div>
    </div>
  );
}

export default function FeedingChecklist({ items, onComplete, activeItem, onChangeActiveItem }: ChecklistProps) {
  const [internalActive, setInternalActive] = useState<FeedingChecklistItem | null>(null);

  const activeModal = activeItem ?? internalActive;
  const setActiveModal = onChangeActiveItem ?? setInternalActive;

  const now = new Date();
  const doneCount = items.filter((i) => i.status === "done").length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3
          className="font-semibold text-slate-700"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Today's Feeding Schedule
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {doneCount}/{items.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {items.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const isUpcoming =
            item.status === "pending" &&
            item.scheduledAt.getTime() - now.getTime() < 15 * 60_000 &&
            item.scheduledAt > now;
          const isPast = item.status === "pending" && item.scheduledAt <= now;

          return (
            <div
              key={item.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl border transition-all ${cfg.bg} ${cfg.border} ${
                isUpcoming ? "ring-2 ring-amber-400 ring-offset-1" : ""
              }`}
            >
              {/* Status icon / checkbox */}
              {item.status === "pending" ? (
                <button
                  onClick={() => setActiveModal(item)}
                  aria-label="Log this feeding"
                  title="Log this feeding"
                  className={`w-9 h-9 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all text-xs font-bold ${
                    isPast
                      ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-slate-300 bg-white text-slate-500 hover:border-[#0B3D91] hover:bg-blue-50 hover:text-[#0B3D91]"
                  }`}
                >
                  ✓
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm">
                  {cfg.icon}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800">{item.time}</span>
                  <span className="text-xs text-slate-500">{item.label}</span>
                  {isUpcoming && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      Soon
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-slate-500">
                    Rec: <strong>{item.amount} kg</strong>
                  </span>
                  {item.status === "done" && item.actualAmount !== undefined && (
                    <span className="text-xs text-emerald-600">
                      Actual: <strong>{item.actualAmount} kg</strong>
                    </span>
                  )}
                  {item.fishResponse && (
                    <span className="text-xs text-slate-400">
                      {FISH_RESPONSES.find((r) => r.value === item.fishResponse)?.emoji}{" "}
                      {FISH_RESPONSES.find((r) => r.value === item.fishResponse)?.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.badgeText}
                </span>
                {item.status === "pending" && (
                  <button
                    onClick={() => setActiveModal(item)}
                    className="text-xs text-[#0B3D91] hover:underline font-medium whitespace-nowrap"
                  >
                    Log feed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Done modal */}
      {activeModal && (
        <DoneModal
          item={activeModal}
          onSubmit={(actual, response, notes) => {
            onComplete(activeModal, actual, response, notes);
            setActiveModal(null);
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
