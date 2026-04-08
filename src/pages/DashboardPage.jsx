import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  AlertBanner,
  StatCard,
  MOCK_READINGS,
  getAlerts,
} from "../shared/aquaCore";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const PARAM_CONFIG = [
  { key: "DO", label: "DO", name: "DO (mg/L)", color: "#0B3D91" },
  { key: "pH", label: "pH", name: "pH", color: "#8b5cf6" },
  { key: "Temp", label: "Temp", name: "Temp (°C)", color: "#f59e0b" },
  { key: "NH3", label: "NH3", name: "NH₃ (mg/L)", color: "#ef4444" },
  { key: "NO3", label: "NO3", name: "NO₃ (mg/L)", color: "#10b981" },
  { key: "Salinity", label: "Salinity", name: "Salinity (ppt)", color: "#06b6d4" },
];

export default function DashboardPage({ user, params, setParams }) {
  const [selectedParams, setSelectedParams] = useState(["DO", "pH", "Temp"]);

  const alerts = useMemo(() => getAlerts(params), [params]);
  const combinedTrend = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, "0")}:00`,
        DO: MOCK_READINGS.DO?.[i]?.value ?? null,
        pH: MOCK_READINGS.pH?.[i]?.value ?? null,
        Temp: MOCK_READINGS.Temp?.[i]?.value ?? null,
        NH3: MOCK_READINGS.NH3?.[i]?.value ?? null,
        NO3: MOCK_READINGS.NO3?.[i]?.value ?? null,
        Salinity: MOCK_READINGS.Salinity?.[i]?.value ?? null,
      })),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold text-slate-800"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Overview
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Welcome back, {user?.email?.split("@")[0] || "Farmer"}
        </p>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Dissolved O₂", param: "DO", unit: "mg/L" },
          { label: "pH Level", param: "pH", unit: "" },
          { label: "Temperature", param: "Temp", unit: "°C" },
          { label: "Ammonia (NH₃)", param: "NH3", unit: "mg/L" },
          { label: "Nitrate (NO₃)", param: "NO3", unit: "mg/L" },
          { label: "Salinity", param: "Salinity", unit: "ppt" },
        ].map((s) => (
          <StatCard
            key={s.param}
            label={s.label}
            param={s.param}
            value={params[s.param]}
            unit={s.unit}
            trend={MOCK_READINGS[s.param]}
          />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">
          24-hour Water Quality Trend
        </h3>
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[11px] font-medium text-slate-500">
              Toggle parameters to compare trends
            </p>
            <ToggleGroup
              type="multiple"
              value={selectedParams}
              onValueChange={(values) => {
                // Prevent empty selection to keep chart meaningful
                if (!values.length) return;
                setSelectedParams(values);
              }}
              className="flex-wrap justify-end gap-1"
            >
              {PARAM_CONFIG.map((p) => (
                <ToggleGroupItem
                  key={p.key}
                  value={p.key}
                  className="text-[11px] px-2.5 h-8"
                >
                  {p.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <p className="text-[11px] text-slate-400">
            Water Basics: DO, pH, Temp · Chemical Levels: NH3, NO3, Salinity
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={combinedTrend}
            margin={{ top: 0, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            {PARAM_CONFIG.filter((p) => selectedParams.includes(p.key)).map(
              (p) => (
                <Line
                  key={p.key}
                  type="monotone"
                  dataKey={p.key}
                  name={p.name}
                  stroke={p.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      
    </div>
  );
}
