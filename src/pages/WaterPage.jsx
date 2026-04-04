import { useState, useMemo, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Card,
  Badge,
  AlertBanner,
  statusColor,
  getParamStatus,
  MOCK_READINGS,
  getAlerts,
  supabase,
  supabaseUrl,
} from "../shared/aquaCore";

// AI Alert Recommendations based on water parameters
const getAIRecommendations = (params) => {
  const recommendations = [];

  // Dissolved Oxygen Analysis
  if (params.DO < 5) {
    recommendations.push({
      severity: "critical",
      parameter: "Dissolved Oxygen",
      issue: "Critically low oxygen levels detected",
      action: "Immediate aeration required",
      details: "Install additional aerators or increase oxygen flow immediately. Fish may experience stress or mortality if not addressed within 1-2 hours.",
      icon: "⚠️"
    });
  } else if (params.DO < 6) {
    recommendations.push({
      severity: "warning",
      parameter: "Dissolved Oxygen",
      issue: "Oxygen levels below optimal range",
      action: "Increase aeration",
      details: "Turn on backup aerators or reduce feeding temporarily. Monitor fish behavior for signs of stress (gasping at surface).",
      icon: "⚡"
    });
  }

  // pH Analysis
  if (params.pH < 6.5 || params.pH > 8.5) {
    recommendations.push({
      severity: "critical",
      parameter: "pH Level",
      issue: `pH ${params.pH < 6.5 ? 'too acidic' : 'too alkaline'}`,
      action: `Add ${params.pH < 6.5 ? 'lime or sodium bicarbonate' : 'organic acids'}`,
      details: `Target pH: 7.0-8.0. ${params.pH < 6.5 ? 'Low pH can stress fish and reduce immunity' : 'High pH can cause ammonia toxicity'}. Adjust gradually over 24-48 hours.`,
      icon: "🧪"
    });
  } else if (params.pH < 7 || params.pH > 8) {
    recommendations.push({
      severity: "warning",
      parameter: "pH Level",
      issue: "pH slightly outside optimal range",
      action: "Monitor and prepare for adjustment",
      details: "Keep pH buffers ready. Test water 2-3 times daily to track trends.",
      icon: "📊"
    });
  }

  // Temperature Analysis
  if (params.Temp > 32 || params.Temp < 24) {
    recommendations.push({
      severity: "critical",
      parameter: "Temperature",
      issue: `Water temperature ${params.Temp > 32 ? 'too high' : 'too low'}`,
      action: params.Temp > 32 ? "Cool water immediately" : "Heat water gradually",
      details: params.Temp > 32 
        ? "Add ice packs or increase water circulation. High temps reduce oxygen and increase ammonia toxicity." 
        : "Reduce feeding and monitor for disease. Cold stress weakens immune system.",
      icon: "🌡️"
    });
  }

  // Ammonia Analysis
  if (params.NH3 > 0.05) {
    recommendations.push({
      severity: "critical",
      parameter: "Ammonia",
      issue: "Toxic ammonia levels detected",
      action: "Perform emergency water change",
      details: "Change 30-50% of water immediately. Stop feeding for 24 hours. Check biofilter function and add beneficial bacteria supplements.",
      icon: "☠️"
    });
  } else if (params.NH3 > 0.025) {
    recommendations.push({
      severity: "warning",
      parameter: "Ammonia",
      issue: "Elevated ammonia levels",
      action: "Partial water change recommended",
      details: "Change 20-30% of water. Reduce feeding by 50%. Test daily until levels stabilize below 0.02 mg/L.",
      icon: "⚠️"
    });
  }

  // Nitrate Analysis
  if (params.NO3 > 20) {
    recommendations.push({
      severity: "warning",
      parameter: "Nitrate",
      issue: "High nitrate accumulation",
      action: "Schedule water change",
      details: "Plan 25-30% water change within 24 hours. Consider adding aquatic plants to absorb excess nitrates naturally.",
      icon: "🌊"
    });
  }

  // Salinity Analysis
  if (params.Salinity > 10 || params.Salinity < 0) {
    recommendations.push({
      severity: "warning",
      parameter: "Salinity",
      issue: "Salinity outside recommended range",
      action: params.Salinity > 10 ? "Dilute with fresh water" : "Check sensor calibration",
      details: params.Salinity > 10 
        ? "Gradually add dechlorinated fresh water to reduce salinity. Monitor fish for osmotic stress."
        : "Verify sensor is functioning correctly. Recalibrate if necessary.",
      icon: "🧂"
    });
  }

  // General health check
  if (recommendations.length === 0) {
    recommendations.push({
      severity: "good",
      parameter: "All Parameters",
      issue: "Water quality optimal",
      action: "Continue current practices",
      details: "All parameters within ideal ranges. Maintain regular feeding schedule, monitor daily, and perform routine 10-15% weekly water changes.",
      icon: "✅"
    });
  }

  return recommendations;
};

// Mock historical data (in real app, this would come from Supabase)
const generateHistoricalData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      DO: 6.5 + Math.random() * 2 - 1,
      pH: 7.2 + Math.random() * 0.6 - 0.3,
      Temp: 28 + Math.random() * 3 - 1.5,
      NH3: 0.015 + Math.random() * 0.02 - 0.01,
      NO3: 8 + Math.random() * 6 - 3,
      Salinity: 4.5 + Math.random() * 2 - 1,
    });
  }
  
  return data;
};

export default function WaterPage({ user, params, setParams, connectedDevice, onBuySensor, onConnectDevice, onDisconnectDevice }) {
  const alerts = useMemo(() => getAlerts(params), [params]);
  const aiRecommendations = useMemo(() => getAIRecommendations(params), [params]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const [selectedParameter, setSelectedParameter] = useState('DO');

  useEffect(() => {
    // Load historical data (in real app, fetch from Supabase)
    setHistoricalData(generateHistoricalData());
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getFilteredHistoricalData = () => {
    if (!historicalData.length) return [];
    
    const now = Date.now();
    const ranges = {
      '24hours': 24 * 60 * 60 * 1000,
      '7days': 7 * 24 * 60 * 60 * 1000,
      '30days': 30 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - (ranges[selectedDateRange] || ranges['7days']);
    return historicalData.filter(d => d.timestamp >= cutoff);
  };

  const PARAM_INFO = [
    { key: "DO", label: "Dissolved Oxygen", unit: "mg/L", ideal: "6–8 mg/L", color: "#0B3D91" },
    { key: "pH", label: "pH Level", unit: "", ideal: "7–8", color: "#8b5cf6" },
    { key: "Temp", label: "Temperature", unit: "°C", ideal: "26–30°C", color: "#f59e0b" },
    { key: "NH3", label: "Ammonia", unit: "mg/L", ideal: "< 0.025", color: "#ef4444" },
    { key: "NO3", label: "Nitrate", unit: "mg/L", ideal: "< 15 mg/L", color: "#10b981" },
    { key: "Salinity", label: "Salinity", unit: "ppt", ideal: "0–10 ppt", color: "#06b6d4" },
  ];

  // Empty state - no device connected
  if (!connectedDevice) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-2xl w-full">
          <Card className="p-12 text-center border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6">
              <svg className="w-14 h-14 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              No Sensor Kit Connected
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
              To start monitoring water quality in real-time, you need an ikanDoiT Sensor Kit connected to your account.
            </p>

            <div className="bg-white rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 text-center">Getting Started</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs font-bold flex items-center justify-center">1</div>
                  <p className="text-sm text-slate-700">Purchase an ikanDoiT Sensor Kit</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs font-bold flex items-center justify-center">2</div>
                  <p className="text-sm text-slate-700">Connect it using the Device ID</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs font-bold flex items-center justify-center">3</div>
                  <p className="text-sm text-slate-700">Start monitoring in real-time</p>
                </div>
              </div>
            </div>

            <button
              onClick={onBuySensor}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Buy ikanDoiT Sensor Kit
            </button>

            <p className="text-sm text-slate-500 mt-6">
              Already have a sensor kit?{" "}
              <button onClick={onConnectDevice} className="text-[#0B3D91] font-semibold hover:underline">
                Connect it now
              </button>
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Normal view with connected device
  return (
    <div className="space-y-6">

      {/* ── Disconnect Confirmation Modal ── */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3
              className="text-lg font-bold text-slate-900 text-center mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Disconnect Device?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will disconnect{" "}
              <span className="font-semibold text-slate-700">
                {connectedDevice?.name || "your device"}
              </span>{" "}
              from your pond. You can reconnect it anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDisconnectModal(false);
                  onDisconnectDevice();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Device Status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2
            className="text-xl font-bold text-slate-800"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Water Quality Monitoring
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time sensor data from your ikanDoiT device
          </p>
        </div>

        {/* Device Status & Actions */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg group relative">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-700">
                {connectedDevice?.name || "Device IK-DEMO01"} • Online
              </span>

              <div className="ml-2 relative group/menu">
                <button className="text-emerald-600 hover:text-emerald-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                  <button
                    onClick={onConnectDevice}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Device
                  </button>
                  <button
                    onClick={() => setShowDisconnectModal(true)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disconnect Device
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Last updated: {lastUpdated.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      <AlertBanner alerts={alerts} />

      {/* AI Recommendations Panel */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                AI-Powered Recommendations
              </h3>
              <p className="text-sm text-slate-600">
                {aiRecommendations.length} {aiRecommendations.length === 1 ? 'insight' : 'insights'} based on current water quality
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${showAIPanel ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAIPanel && (
          <div className="px-5 pb-5 space-y-3">
            {aiRecommendations.map((rec, idx) => {
              const severityStyles = {
                critical: "border-red-200 bg-red-50",
                warning: "border-amber-200 bg-amber-50",
                good: "border-emerald-200 bg-emerald-50",
              };
              const iconColor = {
                critical: "text-red-600",
                warning: "text-amber-600",
                good: "text-emerald-600",
              };

              return (
                <div
                  key={idx}
                  className={`border-2 rounded-xl p-4 ${severityStyles[rec.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-slate-900">{rec.parameter}</h4>
                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${iconColor[rec.severity]}`}>
                          {rec.severity}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">{rec.issue}</p>
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="font-semibold">Recommended Action:</span> {rec.action}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{rec.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Parameter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PARAM_INFO.map((p) => {
          const status = getParamStatus(p.key, params[p.key]);
          const c = statusColor[status];
          return (
            <Card key={p.key} className={`p-4 border ${c.bg} relative`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {p.label}
                </span>
                <Badge status={status}>{status}</Badge>
              </div>
              <div className={`text-3xl font-bold mt-1 ${c.text}`}>
                {params[p.key]}{" "}
                <span className="text-sm font-normal">{p.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ideal: {p.ideal}
              </p>
              <div className="mt-3 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={MOCK_READINGS[p.key].slice(-12)}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id={`g${p.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={p.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={p.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={p.color}
                      fill={`url(#g${p.key})`}
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Historical Data Panel */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D91] to-[#0288D1] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Historical Data & Trends
              </h3>
              <p className="text-sm text-slate-600">
                View parameter history and identify patterns
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="px-5 pb-5 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Time Range</label>
                <div className="flex gap-2">
                  {[
                    { value: '24hours', label: '24h' },
                    { value: '7days', label: '7 Days' },
                    { value: '30days', label: '30 Days' },
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setSelectedDateRange(range.value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        selectedDateRange === range.value
                          ? 'bg-[#0B3D91] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Parameter</label>
                <select
                  value={selectedParameter}
                  onChange={(e) => setSelectedParameter(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 text-sm font-semibold focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  {PARAM_INFO.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredHistoricalData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return selectedDateRange === '24hours'
                          ? d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
                          : d.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelFormatter={(date) => new Date(date).toLocaleString('en-MY')}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedParameter}
                      stroke={PARAM_INFO.find(p => p.key === selectedParameter)?.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500">
                  Showing {PARAM_INFO.find(p => p.key === selectedParameter)?.label} over the last{' '}
                  {selectedDateRange === '24hours' ? '24 hours' : selectedDateRange === '7days' ? '7 days' : '30 days'}
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              {(() => {
                const filteredData = getFilteredHistoricalData();
                const values = filteredData.map(d => d[selectedParameter]);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const min = Math.min(...values);
                const max = Math.max(...values);
                
                return (
                  <>
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 mb-1">Average</p>
                      <p className="text-lg font-bold text-blue-900">{avg.toFixed(2)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-600 mb-1">Minimum</p>
                      <p className="text-lg font-bold text-emerald-900">{min.toFixed(2)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200">
                      <p className="text-xs font-semibold text-amber-600 mb-1">Maximum</p>
                      <p className="text-lg font-bold text-amber-900">{max.toFixed(2)}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </Card>

      {/* Info Card about Real-Time Monitoring */}
      <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0B3D91]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-[#0B3D91]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Real-Time Monitoring Active
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Your ikanDoiT sensor kit is continuously measuring water parameters and transmitting data every 30 seconds.
              All readings are stored for historical analysis and AI-powered insights.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-200">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-slate-700">6 Sensors Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-purple-200">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-slate-700">AI Analysis Enabled</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-slate-700">Updates every 30s</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}