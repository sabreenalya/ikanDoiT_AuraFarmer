import { createClient } from "@supabase/supabase-js";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { forwardRef } from "react";

// ─── Supabase client ─────────────────────────────────────────────────────────
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://qrzrxgogzvdlnegwuxdv.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyenJ4Z29nenZkbG5lZ3d1eGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzIzNTgsImV4cCI6MjA5MDcwODM1OH0.LtrVFcHPbRAbP9hDLVQ7zB4jTeSDIYPK7oOp5l9rxXw";
export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Mock data helpers ───────────────────────────────────────────────────────
const mockTrend = (base, variance, count = 24) =>
  Array.from({ length: count }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    value: parseFloat(
      (base + (Math.random() - 0.5) * variance * 2).toFixed(2)
    ),
  }));

export const MOCK_READINGS = {
  DO: mockTrend(6.5, 1.5),
  pH: mockTrend(7.2, 0.6),
  Temp: mockTrend(28, 2),
  NH3: mockTrend(0.02, 0.015),
  NO3: mockTrend(8, 3),
  Salinity: mockTrend(5, 1),
};

export const MOCK_FEEDING_HISTORY = [
  { date: "2025-07-01", feed_amount: 12.4 },
  { date: "2025-07-02", feed_amount: 11.8 },
  { date: "2025-07-03", feed_amount: 13.1 },
  { date: "2025-07-04", feed_amount: 12.0 },
  { date: "2025-07-05", feed_amount: 12.9 },
  { date: "2025-07-06", feed_amount: 11.5 },
  { date: "2025-07-07", feed_amount: 13.4 },
];

// ─── Alert logic ─────────────────────────────────────────────────────────────
export function getAlerts(params) {
  const alerts = [];
  if (params.DO < 5)
    alerts.push({
      level: "critical",
      msg: "Low dissolved oxygen — increase aeration immediately",
      param: "DO",
    });
  else if (params.DO < 6)
    alerts.push({
      level: "warning",
      msg: "DO slightly low — monitor aeration",
      param: "DO",
    });

  if (params.pH < 6.5)
    alerts.push({
      level: "critical",
      msg: "pH too acidic — add lime or buffer solution",
      param: "pH",
    });
  else if (params.pH > 8.5)
    alerts.push({
      level: "critical",
      msg: "pH too alkaline — check CO₂ levels",
      param: "pH",
    });
  else if (params.pH < 7.0 || params.pH > 8.0)
    alerts.push({
      level: "warning",
      msg: "pH drifting from ideal range (7–8)",
      param: "pH",
    });

  if (params.Temp > 32)
    alerts.push({
      level: "critical",
      msg: "Water temperature critical — risk of heat stress",
      param: "Temp",
    });
  else if (params.Temp > 30)
    alerts.push({
      level: "warning",
      msg: "Temperature elevated — watch feeding response",
      param: "Temp",
    });

  if (params.NH3 > 0.05)
    alerts.push({
      level: "critical",
      msg: "Ammonia toxic — reduce feeding, increase water exchange",
      param: "NH3",
    });
  else if (params.NH3 > 0.025)
    alerts.push({
      level: "warning",
      msg: "Ammonia rising — partial water change recommended",
      param: "NH3",
    });

  if (params.NO3 > 20)
    alerts.push({
      level: "warning",
      msg: "Nitrate high — consider water exchange",
      param: "NO3",
    });

  return alerts;
}

// ─── Feed calculation ────────────────────────────────────────────────────────
export function calcFeedAmount(biomass, avgWeight, temp) {
  let pct = 0.04;
  if (avgWeight < 0.05) pct = 0.05;
  else if (avgWeight > 0.3) pct = 0.03;
  if (temp > 30) pct *= 0.85;
  else if (temp < 24) pct *= 0.9;
  return parseFloat((biomass * pct).toFixed(2));
}

// ─── Tilapia weight formula ──────────────────────────────────────────────────
export const TILAPIA_A = 0.0209;
export const TILAPIA_B = 2.95;
export function calcWeight(lengthCm) {
  return parseFloat(
    ((TILAPIA_A * Math.pow(lengthCm, TILAPIA_B)) / 1000).toFixed(4)
  ); // kg
}

// ─── Color helpers ───────────────────────────────────────────────────────────
export const statusColor = {
  normal: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  critical: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

export function getParamStatus(key, val) {
  const ranges = {
    DO: { warn: [5, 6], ok: [6, 12] },
    pH: { warn: [6.5, 7, 8, 8.5], ok: [7, 8] },
    Temp: { warn: [25, 28, 30, 32], ok: [26, 30] },
    NH3: { warnMax: 0.025, critMax: 0.05 },
    NO3: { warnMax: 15, critMax: 20 },
    Salinity: { ok: [0, 10] },
  };
  const r = ranges[key];
  if (!r) return "normal";
  if (r.critMax !== undefined) {
    if (val > r.critMax) return "critical";
    if (val > r.warnMax) return "warning";
    return "normal";
  }
  if (r.warnMax !== undefined) {
    if (val > r.warnMax) return "warning";
    return "normal";
  }
  if (key === "pH") {
    if (val < 6.5 || val > 8.5) return "critical";
    if (val < 7 || val > 8) return "warning";
    return "normal";
  }
  return "normal";
}

// ─── UI Primitives ───────────────────────────────────────────────────────────
export const Card = forwardRef(({ children, className = "" }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export function Badge({ status, children }) {
  const c = statusColor[status] || statusColor.normal;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {children}
    </span>
  );
}

export function AlertBanner({ alerts }) {
  if (!alerts.length)
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        All parameters within normal range
      </div>
    );
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => {
        const c = statusColor[a.level];
        return (
          <div
            key={i}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${c.bg}`}
          >
            <span
              className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${c.dot}`}
            />
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${c.text}`}
              >
                {a.level}
              </span>
              <p className={`text-sm mt-0.5 ${c.text}`}>{a.msg}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatCard({ label, value, unit, param, trend }) {
  const status = getParamStatus(param, value);
  const c = statusColor[status];
  return (
    <Card className={`p-4 border ${c.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        <Badge status={status}>{status}</Badge>
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>
        {value}{" "}
        <span className="text-sm font-normal opacity-70">{unit}</span>
      </div>
      {trend && (
        <div className="mt-2 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trend.slice(-8)}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  status === "critical"
                    ? "#ef4444"
                    : status === "warning"
                    ? "#f59e0b"
                    : "#10b981"
                }
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ─── Modern Minimalist Logo ──────────────────────────────────────────────────
export function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Modern circular gradient background */}
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0B3D91' }} />
          <stop offset="100%" style={{ stopColor: '#0288D1' }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#logoGrad)" />
      
      {/* Simplified modern fish outline */}
      <g transform="translate(40,60)">
        {/* Fish body - cleaner, more geometric */}
        <path
          d="M105,40 C85,15 35,18 15,40 C10,46 10,54 15,60 C35,85 85,82 105,57 C110,50 110,47 105,40Z"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Tail - minimalist triangle */}
        <path
          d="M15,48 C8,38 2,25 12,15 C20,25 18,38 15,48Z"
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Eye - simple gold accent */}
        <circle cx="85" cy="45" r="6" fill="#F59E0B" />
        {/* Gill marks - minimal lines */}
        <path
          d="M50,35 Q60,40 50,50"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M65,32 Q75,40 65,53"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
