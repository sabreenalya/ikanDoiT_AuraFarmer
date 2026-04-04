import { useMemo } from "react";
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

export default function DashboardPage({ user, params, setParams }) {
  const alerts = useMemo(() => getAlerts(params), [params]);
  const combinedTrend = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, "0")}:00`,
        DO: MOCK_READINGS.DO[i].value,
        pH: MOCK_READINGS.pH[i].value,
        Temp: MOCK_READINGS.Temp[i].value,
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
            <Line
              dataKey="DO"
              name="DO (mg/L)"
              stroke="#0B3D91"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="pH"
              name="pH"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Temp"
              name="Temp (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-700 mb-4 text-sm">
          Quick Parameter Update
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.keys(params).map((key) => (
            <div key={key}>
              <label className="block text-xs text-slate-500 mb-1">
                {key}
              </label>
              <input
                type="number"
                step="0.01"
                value={params[key]}
                onChange={(e) =>
                  setParams((p) => ({
                    ...p,
                    [key]: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-400 outline-none"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Changes update alert status in real-time.
        </p>
      </Card>
    </div>
  );
}
