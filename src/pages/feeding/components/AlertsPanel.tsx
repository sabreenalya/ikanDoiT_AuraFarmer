// ─── AlertsPanel.tsx ─────────────────────────────────────────────────────────
// Renders active feeding alerts with dismiss support.

import type { FeedingAlert } from "../types/feeding.types";

interface AlertsPanelProps {
  alerts: FeedingAlert[];
  onDismiss: (id: string) => void;
  onAlertClick?: (alert: FeedingAlert) => void;
}

const SEVERITY_STYLE = {
  info:     { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",  dot: "bg-blue-500",   label: "Info" },
  warning:  { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-400",  label: "Warning" },
  critical: { bg: "bg-red-50 border-red-200",     text: "text-red-700",   dot: "bg-red-500",    label: "Critical" },
};

export default function AlertsPanel({ alerts, onDismiss, onAlertClick }: AlertsPanelProps) {
  if (alerts.length === 0) return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      All feeding tasks on track — no active alerts
    </div>
  );

  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const cfg = SEVERITY_STYLE[a.severity];
        return (
          <div
            key={a.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${onAlertClick ? "cursor-pointer" : ""}`}
            onClick={() => onAlertClick?.(a)}
            role={onAlertClick ? "button" : undefined}
          >
            <span className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>
                {cfg.label}
              </span>
              <p className={`text-sm mt-0.5 ${cfg.text}`}>{a.message}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(a.id); }}
              className="text-slate-400 hover:text-slate-600 flex-shrink-0 mt-0.5 transition-colors"
              aria-label="Dismiss alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
