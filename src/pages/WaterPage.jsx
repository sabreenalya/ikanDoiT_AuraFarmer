import { useState, useMemo, useEffect, useRef } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "../components/ui/sonner";
import {
  Card, Badge, AlertBanner, statusColor, getParamStatus, MOCK_READINGS, getAlerts,
} from "../shared/aquaCore";

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative inline-flex items-center" style={{ marginLeft: 4 }}>
      <button
        onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}
        aria-label="More info"
        className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center hover:bg-[#0B3D91] hover:text-white transition-colors flex-shrink-0"
      >?</button>
      {visible && (
        <div className="absolute left-0 top-6 z-50 w-60 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl leading-relaxed pointer-events-none">
          {text}
          <div className="absolute left-2 bottom-full border-4 border-transparent border-b-slate-800" />
        </div>
      )}
    </div>
  );
}

// ─── Collapsible Ideal Tip pill ───────────────────────────────────────────────
function IdealTip({ ideal, explain }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-700 hover:bg-emerald-200 transition-colors w-full justify-between"
      >
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ideal: {ideal}
        </span>
        <svg className={`w-3 h-3 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-slate-600 leading-relaxed">
          {explain}
        </div>
      )}
    </div>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell({ ponds }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const notifications = useMemo(() => {
    const notifs = [];

    const safePonds = Array.isArray(ponds) ? ponds : [];
    safePonds.forEach((pond) => {
      const p = pond?.params;
      if (!p) return;

      const pondName = pond?.name || "Your pond";

      if (p.DO < 5) notifs.push({ level: "critical", title: `${pondName}: Low Oxygen — Act Now!`, body: `DO is ${p.DO} mg/L. Turn on aerators immediately.`, time: "Just now" });
      else if (p.DO < 6) notifs.push({ level: "warning", title: `${pondName}: Oxygen Below Ideal`, body: `DO is ${p.DO} mg/L. Increase aeration.`, time: "Just now" });

      if (p.NH3 > 0.05) notifs.push({ level: "critical", title: `${pondName}: Toxic Ammonia Level!`, body: `Ammonia is ${p.NH3} mg/L. Change 30–50% of water now.`, time: "Just now" });
      else if (p.NH3 > 0.025) notifs.push({ level: "warning", title: `${pondName}: Elevated Ammonia`, body: `Ammonia is ${p.NH3} mg/L. Do a partial water change.`, time: "Just now" });

      if (p.pH < 6.5 || p.pH > 8.5) notifs.push({ level: "critical", title: `${pondName}: pH Too ${p.pH < 6.5 ? "Acidic" : "Alkaline"}`, body: `pH is ${p.pH}. Adjust gradually over 1–2 days.`, time: "Just now" });
      if (p.Temp > 32 || p.Temp < 24) notifs.push({ level: "critical", title: `${pondName}: Temperature ${p.Temp > 32 ? "Too High" : "Too Low"}`, body: `Temp is ${p.Temp}°C. ${p.Temp > 32 ? "Cool the water." : "Warm gradually."}`, time: "Just now" });
      if (p.NO3 > 20) notifs.push({ level: "warning", title: `${pondName}: High Nitrate`, body: `Nitrate is ${p.NO3} mg/L. Schedule a water change.`, time: "Just now" });
    });

    if (notifs.length === 0) notifs.push({ level: "good", title: "All Good!", body: "All ponds' water parameters are within safe ranges.", time: "Just now" });
    return notifs;
  }, [ponds]);

  const criticalCount = notifications.filter(n => n.level === "critical").length;
  const warningCount = notifications.filter(n => n.level === "warning").length;
  const badgeCount = criticalCount + warningCount;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all" title="Notifications">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {badgeCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center ${criticalCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}>
            {badgeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">All Ponds Alerts</h4>
            <span className="text-xs text-slate-500">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((n, i) => {
              const styles = { critical: "border-l-4 border-red-500 bg-red-50", warning: "border-l-4 border-amber-400 bg-amber-50", good: "border-l-4 border-emerald-500 bg-emerald-50" };
              const icons = { critical: "⚠️", warning: "⚡", good: "✅" };
              return (
                <div key={i} className={`px-4 py-3 ${styles[n.level]}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{icons[n.level]}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">💡 Important alerts will also be sent via email.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gemini AI call ───────────────────────────────────────────────────────────
const callGeminiForRecommendations = async (params) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const prompt = `You are an expert aquaculture advisor helping fish farmers who may not have technical knowledge.
Analyze these water quality readings and give simple, actionable advice in plain language:
- Dissolved Oxygen (DO): ${params.DO} mg/L (ideal: 6-8)
- pH: ${params.pH} (ideal: 7.0-8.0)
- Temperature: ${params.Temp}°C (ideal: 26-30)
- Ammonia (NH3): ${params.NH3} mg/L (ideal: <0.025)
- Nitrate (NO3): ${params.NO3} mg/L (ideal: <15)
- Salinity: ${params.Salinity} ppt (ideal: 0-10)

Respond with a JSON array of recommendations. Each item must have:
- severity: "critical", "warning", or "good"
- parameter: the parameter name
- issue: one short sentence describing the problem in simple terms
- action: one clear action to take
- details: 2-3 sentences of simple explanation a farmer would understand
- icon: an appropriate emoji

Return ONLY valid JSON, no markdown, no explanation outside the array.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) { return null; }
};

const getLocalRecommendations = (params) => {
  const recs = [];
  if (params.DO < 5) recs.push({ severity:"critical", parameter:"Dissolved Oxygen", issue:"Oxygen is dangerously low", action:"Turn on aerators immediately", details:"Fish need oxygen to breathe. When DO drops below 5 mg/L, fish become stressed and may die within hours. Add air pumps or aerators right away.", icon:"⚠️" });
  else if (params.DO < 6) recs.push({ severity:"warning", parameter:"Dissolved Oxygen", issue:"Oxygen is lower than ideal", action:"Increase aeration", details:"Turn on backup air pumps. If fish are swimming near the surface or gasping, that is a sign of low oxygen.", icon:"⚡" });
  if (params.pH < 6.5 || params.pH > 8.5) recs.push({ severity:"critical", parameter:"pH Level", issue:`Water is too ${params.pH < 6.5 ? "acidic":"alkaline"}`, action:`Add ${params.pH < 6.5 ? "lime or baking soda":"organic acids"}`, details:`Fish thrive best between pH 7.0–8.0. ${params.pH < 6.5 ? "Too acidic weakens fish.":"Too alkaline makes ammonia more toxic."} Adjust slowly over 1–2 days.`, icon:"🧪" });
  else if (params.pH < 7 || params.pH > 8) recs.push({ severity:"warning", parameter:"pH Level", issue:"pH is slightly off", action:"Monitor closely", details:"Keep pH test kits ready. Check water 2–3 times per day to catch changes early.", icon:"📊" });
  if (params.Temp > 32 || params.Temp < 24) recs.push({ severity:"critical", parameter:"Temperature", issue:`Water is too ${params.Temp > 32 ? "hot":"cold"}`, action:params.Temp > 32 ? "Cool the water now":"Warm water gradually", details:params.Temp > 32 ? "Hot water holds less oxygen. Add shade or increase water flow.":"Cold water slows fish metabolism. Reduce feeding and watch for disease.", icon:"🌡️" });
  if (params.NH3 > 0.05) recs.push({ severity:"critical", parameter:"Ammonia", issue:"Ammonia level is toxic", action:"Change 30–50% of water immediately", details:"Ammonia is fish waste. At high levels it poisons fish. Stop feeding for 24 hours and change a large portion of water now.", icon:"☠️" });
  else if (params.NH3 > 0.025) recs.push({ severity:"warning", parameter:"Ammonia", issue:"Ammonia is elevated", action:"Partial water change (20–30%)", details:"Reduce feeding by half and change some water. Test daily until ammonia drops below 0.02 mg/L.", icon:"⚠️" });
  if (params.NO3 > 20) recs.push({ severity:"warning", parameter:"Nitrate", issue:"Nitrate is building up", action:"Plan a water change within 24 hours", details:"Change 25–30% of water. Adding water plants can help absorb nitrates naturally.", icon:"🌊" });
  if (params.Salinity > 10) recs.push({ severity:"warning", parameter:"Salinity", issue:"Salinity too high", action:"Add fresh water slowly", details:"Too salty water stresses freshwater fish. Add clean fresh water gradually over a few hours.", icon:"🧂" });
  if (recs.length === 0) recs.push({ severity:"good", parameter:"All Parameters", issue:"Your pond water looks great!", action:"Keep up your current routine", details:"All measurements are within safe ranges. Do a routine 10–15% water change each week.", icon:"✅" });
  return recs;
};

const generateHistoricalData = () => {
  const data = []; const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today); date.setDate(date.getDate() - i);
    data.push({ date: date.toISOString().split("T")[0], timestamp: date.getTime(),
      DO: +(6.5 + Math.random() * 2 - 1).toFixed(2), pH: +(7.2 + Math.random() * 0.6 - 0.3).toFixed(2),
      Temp: +(28 + Math.random() * 3 - 1.5).toFixed(1), NH3: +(0.015 + Math.random() * 0.02 - 0.01).toFixed(3),
      NO3: +(8 + Math.random() * 6 - 3).toFixed(1), Salinity: +(4.5 + Math.random() * 2 - 1).toFixed(1),
    });
  }
  return data;
};

// ─── Random params with realistic pond scenarios ──────────────────────────────
const POND_SCENARIOS = [
  // Good pond
  () => ({ DO: +(6.5 + Math.random() * 1.5).toFixed(1), pH: +(7.2 + Math.random() * 0.4).toFixed(1), Temp: +(27 + Math.random() * 2).toFixed(1), NH3: +(0.008 + Math.random() * 0.008).toFixed(3), NO3: +(7 + Math.random() * 5).toFixed(1), Salinity: +(3 + Math.random() * 3).toFixed(1) }),
  // Low oxygen warning
  () => ({ DO: +(4.5 + Math.random() * 1).toFixed(1), pH: +(7 + Math.random() * 0.5).toFixed(1), Temp: +(30 + Math.random() * 2).toFixed(1), NH3: +(0.018 + Math.random() * 0.008).toFixed(3), NO3: +(12 + Math.random() * 6).toFixed(1), Salinity: +(4 + Math.random() * 2).toFixed(1) }),
  // High ammonia warning
  () => ({ DO: +(6 + Math.random() * 1).toFixed(1), pH: +(7.5 + Math.random() * 0.3).toFixed(1), Temp: +(28 + Math.random() * 1).toFixed(1), NH3: +(0.03 + Math.random() * 0.02).toFixed(3), NO3: +(18 + Math.random() * 5).toFixed(1), Salinity: +(4 + Math.random() * 2).toFixed(1) }),
  // High nitrate warning
  () => ({ DO: +(6.2 + Math.random() * 0.8).toFixed(1), pH: +(7.3 + Math.random() * 0.3).toFixed(1), Temp: +(28 + Math.random() * 1).toFixed(1), NH3: +(0.015 + Math.random() * 0.005).toFixed(3), NO3: +(22 + Math.random() * 8).toFixed(1), Salinity: +(4 + Math.random() * 2).toFixed(1) }),
  // pH off warning
  () => ({ DO: +(6.5 + Math.random() * 1).toFixed(1), pH: +(8.2 + Math.random() * 0.3).toFixed(1), Temp: +(28 + Math.random() * 1).toFixed(1), NH3: +(0.01 + Math.random() * 0.008).toFixed(3), NO3: +(10 + Math.random() * 5).toFixed(1), Salinity: +(4 + Math.random() * 2).toFixed(1) }),
];

// First pond is always good, new ponds cycle through warning/mixed scenarios
const makeFirstPondParams = () => POND_SCENARIOS[0]();
const makeNewPondParams = () => {
  // Randomly pick one of the warning scenarios (index 1–4)
  const idx = 1 + Math.floor(Math.random() * (POND_SCENARIOS.length - 1));
  return POND_SCENARIOS[idx]();
};

const PARAM_INFO = [
  { key:"DO", label:"Dissolved Oxygen", unit:"mg/L", ideal:"6–8 mg/L", color:"#0B3D91", tooltip:"DO measures how much oxygen is in your water. Fish need this to breathe. Aim for 6–8 mg/L. Below 5 is an emergency.", idealExplain:"Fish need 6–8 mg/L to breathe well. Below 5 = danger zone. Use aerators to raise oxygen levels." },
  { key:"pH", label:"pH Level", unit:"", ideal:"7.0–8.0", color:"#8b5cf6", tooltip:"pH tells you if water is acidic or basic. 7.0 is neutral. Fish do best between 7.0–8.0.", idealExplain:"Keep between 7.0–8.0. Below 6.5 = too acidic. Above 8.5 = too alkaline. Both harm fish health." },
  { key:"Temp", label:"Temperature", unit:"°C", ideal:"26–30°C", color:"#f59e0b", tooltip:"Water temperature affects oxygen levels and fish growth. Most tropical fish do best at 26–30°C.", idealExplain:"Best at 26–30°C. Hot water holds less oxygen. Add shade or increase water flow if too high." },
  { key:"NH3", label:"Ammonia", unit:"mg/L", ideal:"< 0.025 mg/L", color:"#ef4444", tooltip:"Ammonia comes from fish waste and uneaten food. Even tiny amounts are toxic. Keep this as low as possible.", idealExplain:"Should be near zero. Above 0.025 = warning. Above 0.05 = emergency — stop feeding and change water immediately." },
  { key:"NO3", label:"Nitrate", unit:"mg/L", ideal:"< 15 mg/L", color:"#10b981", tooltip:"Nitrate builds up slowly from ammonia breakdown. Less harmful than ammonia but causes stress at high levels.", idealExplain:"Keep below 15 mg/L. Change 20–30% of water regularly. Water plants help absorb nitrate naturally." },
  { key:"Salinity", label:"Salinity", unit:"ppt", ideal:"0–10 ppt", color:"#06b6d4", tooltip:"Salinity measures salt content. Freshwater fish need low salinity (0–5 ppt).", idealExplain:"Freshwater fish: keep 0–5 ppt. A little salt (1–3 ppt) helps fight disease. Above 10 ppt stresses freshwater fish." },
];

// ─── Pond status helper ───────────────────────────────────────────────────────
const getPondStatusInfo = (pondAlerts) => {
  const hasCritical = pondAlerts.some(a => a.level === "critical");
  const hasWarning = pondAlerts.some(a => a.level === "warning");
  if (hasCritical) return { dot: "bg-red-500", label: "Needs attention", emoji: "⚠️", cardBorder: "border-red-200", cardBg: "bg-red-50", textColor: "text-red-700", badgeBg: "bg-red-100 text-red-700", activeText: "text-red-600" };
  if (hasWarning) return { dot: "bg-amber-500", label: "Monitor closely", emoji: "⚡", cardBorder: "border-amber-200", cardBg: "bg-amber-50", textColor: "text-amber-700", badgeBg: "bg-amber-100 text-amber-700", activeText: "text-amber-600" };
  return { dot: "bg-emerald-500", label: "All good", emoji: "✓", cardBorder: "border-emerald-200", cardBg: "bg-emerald-50", textColor: "text-emerald-700", badgeBg: "bg-emerald-100 text-emerald-700", activeText: "text-emerald-600" };
};

export default function WaterPage({ user, params: globalParams, setParams, connectedDevice, onBuySensor, onConnectDevice, onDisconnectDevice }) {
  const [devices, setDevices] = useState(() =>
    connectedDevice ? [{ ...connectedDevice, params: makeFirstPondParams() }] : []
  );
  const [activeDeviceIdx, setActiveDeviceIdx] = useState(0);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState("");
  const [newDeviceName, setNewDeviceName] = useState("");
  const [addDeviceError, setAddDeviceError] = useState("");
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState("7days");
  const [selectedParameter, setSelectedParameter] = useState("DO");
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPoweredByGemini, setAiPoweredByGemini] = useState(false);

  const activeDevice = devices[activeDeviceIdx] || null;
  const params = activeDevice?.params || globalParams;
  const allPondsAlerts = useMemo(() => {
    return devices.flatMap((dev) => {
      const pondAlerts = getAlerts(dev.params);
      if (!pondAlerts?.length) return [];
      const pondName = dev?.name || "Your pond";
      const pondId = dev?.id;
      return pondAlerts.map((a) => ({
        ...a,
        pondId,
        pondName,
        msg: `${pondName}: ${a.msg}`,
      }));
    });
  }, [devices]);

  const lastNotifiedAlertsRef = useRef({});
  const allPondsAlertsSignature = useMemo(() => {
    if (!allPondsAlerts?.length) return "";
    return allPondsAlerts
      .map((a) => `${a.level}:${a.param}:${a.msg}`)
      .sort()
      .join("|");
  }, [allPondsAlerts]);

  useEffect(() => {
    const key = "all-ponds";
    const prevSig = lastNotifiedAlertsRef.current[key];
    if (prevSig === allPondsAlertsSignature) return;
    lastNotifiedAlertsRef.current[key] = allPondsAlertsSignature;

    if (!allPondsAlerts?.length) return;

    const hasCritical = allPondsAlerts.some((a) => a.level === "critical");
    const hasWarning = allPondsAlerts.some((a) => a.level === "warning");
    if (!hasCritical && !hasWarning) return;

    const pondCount = new Set(allPondsAlerts.map((a) => a.pondId || a.pondName)).size;
    const title = hasCritical
      ? `⚠️ ${pondCount} pond${pondCount === 1 ? "" : "s"} need attention`
      : `⚡ ${pondCount} pond${pondCount === 1 ? "" : "s"} need monitoring`;

    const description = allPondsAlerts
      .slice(0, 3)
      .map((a) => a.msg)
      .join(" • ");

    const toastFn = hasCritical
      ? (toast.error || toast)
      : (toast.warning || toast);

    toastFn(title, {
      id: "pond-alert-all",
      description,
      duration: 7000,
    });
  }, [allPondsAlerts, allPondsAlertsSignature, devices.length]);

  useEffect(() => {
    const load = async () => {
      setAiLoading(true);
      const geminiResult = await callGeminiForRecommendations(params);
      if (geminiResult && Array.isArray(geminiResult) && geminiResult.length > 0) {
        setAiRecommendations(geminiResult); setAiPoweredByGemini(true);
      } else {
        setAiRecommendations(getLocalRecommendations(params)); setAiPoweredByGemini(false);
      }
      setAiLoading(false);
    };
    load();
  }, [activeDeviceIdx]);

  useEffect(() => { setHistoricalData(generateHistoricalData()); }, [activeDeviceIdx]);
  useEffect(() => { if (connectedDevice && devices.length === 0) setDevices([{ ...connectedDevice, params: makeFirstPondParams() }]); }, [connectedDevice]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setLastUpdated(new Date()); setIsRefreshing(false);
  };

  const handleAddDevice = () => {
    setAddDeviceError("");
    const id = newDeviceId.trim().toUpperCase();
    if (!id.startsWith("IK-") || id.length < 9) { setAddDeviceError("Device ID must be in format IK-XXXXXX (e.g. IK-A1B2C3)"); return; }
    if (devices.find(d => d.id === id)) { setAddDeviceError("This device is already connected."); return; }
    const newDevice = { id, name: newDeviceName.trim() || `Pond ${devices.length + 1}`, status:"online", lastSeen: new Date(), sensors:6, params: makeNewPondParams() };
    const updated = [...devices, newDevice];
    setDevices(updated); setActiveDeviceIdx(updated.length - 1);
    setNewDeviceId(""); setNewDeviceName(""); setShowAddDeviceModal(false);
  };

  const handleDisconnectDevice = (idx) => {
    const updated = devices.filter((_, i) => i !== idx);
    setDevices(updated); setActiveDeviceIdx(Math.max(0, idx - 1));
    setShowDisconnectModal(false);
    if (updated.length === 0) onDisconnectDevice();
  };

  const getFilteredHistoricalData = () => {
    if (!historicalData.length) return [];
    const now = Date.now();
    const ranges = { "24hours":24*60*60*1000, "7days":7*24*60*60*1000, "30days":30*24*60*60*1000 };
    return historicalData.filter(d => d.timestamp >= now - (ranges[selectedDateRange] || ranges["7days"]));
  };

  // ── Empty state ──
  if (!connectedDevice && devices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-2xl w-full">
          <Card className="p-12 text-center border-2 border-dashed border-slate-300 bg-slate-50">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6">
              <svg className="w-14 h-14 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>No Sensor Kit Connected</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">Connect your ikanDoiT Sensor Kit to start monitoring water quality in real-time.</p>
            <div className="bg-white rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 text-center">Getting Started</h3>
              <div className="space-y-3">
                {["Purchase an ikanDoiT Sensor Kit","Connect it using the Device ID on the label","Start monitoring in real-time"].map((s,i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs font-bold flex items-center justify-center">{i+1}</div>
                    <p className="text-sm text-slate-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onBuySensor} className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Buy ikanDoiT Sensor Kit
            </button>
            <p className="text-sm text-slate-500 mt-6">Already have a sensor kit? <button onClick={onConnectDevice} className="text-[#0B3D91] font-semibold hover:underline">Connect it now</button></p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Add Device Modal */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Add Another Pond</h3>
            <p className="text-sm text-slate-500 mb-5">Enter the Device ID from the yellow label on your sensor kit.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Device ID <span className="text-red-500">*</span></label>
                <input type="text" value={newDeviceId} onChange={e => { setNewDeviceId(e.target.value.toUpperCase()); setAddDeviceError(""); }} placeholder="IK-A1B2C3" maxLength={9}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-lg outline-none transition-all ${addDeviceError ? "border-red-400 bg-red-50":"border-slate-300 focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100"}`} />
                {addDeviceError && <p className="text-xs text-red-600 mt-1">{addDeviceError}</p>}
                <p className="text-xs text-slate-500 mt-1">Format: IK- followed by 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pond Name <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input type="text" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} placeholder="e.g. Pond A, Front Pond"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddDeviceModal(false); setAddDeviceError(""); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={handleAddDevice} className="flex-1 py-2.5 rounded-xl bg-[#0B3D91] text-white text-sm font-semibold hover:bg-[#1565C0] transition-all">Add Pond</button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Remove This Pond?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This will remove <span className="font-semibold text-slate-700">{activeDevice?.name || "this pond"}</span>. You can add it back anytime.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisconnectModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={() => handleDisconnectDevice(activeDeviceIdx)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Real-Time Water Quality Monitoring</h2>
          <p className="text-slate-500 text-sm mt-0.5">Live readings from your pond sensors</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <NotificationBell ponds={devices} />
          <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all disabled:opacity-50" title="Refresh data">
            <svg className={`w-4 h-4 ${isRefreshing ? "animate-spin":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <p className="text-xs text-slate-400">Updated: {lastUpdated.toLocaleTimeString("en-MY", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}</p>
        </div>
      </div>

      {/* ── Pond Switcher ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="font-bold text-slate-800 text-sm" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>My Ponds</span>
            <InfoTooltip text="Each card is one pond. Tap to switch between ponds. A coloured dot shows the pond's health at a glance — green means good, orange means check it, red means act now." />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {devices.length > 1 && (
              <button onClick={() => setShowSummaryTable(!showSummaryTable)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${showSummaryTable ? "bg-[#0B3D91] text-white border-[#0B3D91]":"bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`}>
                {showSummaryTable ? "Hide":"Show"} All Ponds Summary
              </button>
            )}
            <button onClick={() => setShowAddDeviceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3D91] text-white text-xs font-semibold hover:bg-[#1565C0] transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Pond
            </button>
          </div>
        </div>

        {/* ── Pond Cards ── */}
        <div className="flex gap-3 flex-wrap">
          {devices.map((dev, idx) => {
            const devAlerts = getAlerts(dev.params);
            const s = getPondStatusInfo(devAlerts);
            const isActive = activeDeviceIdx === idx;
            return (
              <button key={dev.id} onClick={() => setActiveDeviceIdx(idx)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${isActive ? `${s.cardBorder} ${s.cardBg}` : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}>

                {/* Status dot */}
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot} ${isActive ? "animate-pulse" : ""}`} />

                <div>
                  <p className={`text-sm font-bold leading-none ${isActive ? s.activeText : "text-slate-800"}`}>{dev.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{dev.id}</p>
                  {/* Friendly status badge */}
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${s.badgeBg}`}>
                    {s.emoji} {s.label}
                  </span>
                </div>

                {/* Remove button (only on active) */}
                {isActive && (
                  <button onClick={e => { e.stopPropagation(); setShowDisconnectModal(true); }}
                    className="ml-1 text-slate-300 hover:text-red-400 transition-colors self-start" title="Remove pond">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Summary Table ── */}
        {showSummaryTable && devices.length > 1 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Pond</th>
                  {PARAM_INFO.map(p => <th key={p.key} className="text-center px-3 py-3 font-semibold text-slate-700">{p.label.split(" ")[0]}</th>)}
                  <th className="text-center px-3 py-3 font-semibold text-slate-700">Health</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((dev, idx) => {
                  const devAlerts = getAlerts(dev.params);
                  const s = getPondStatusInfo(devAlerts);
                  return (
                    <tr key={dev.id} className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${activeDeviceIdx === idx ? "bg-blue-50" : ""}`} onClick={() => setActiveDeviceIdx(idx)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.dot}`} />
                          <div>
                            <p className="font-semibold text-slate-800">{dev.name}</p>
                            <p className="text-xs text-slate-400">{dev.id}</p>
                          </div>
                        </div>
                      </td>
                      {PARAM_INFO.map(p => {
                        const st = getParamStatus(p.key, dev.params[p.key]);
                        const c = statusColor[st];
                        return (
                          <td key={p.key} className="text-center px-3 py-3">
                            <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>{dev.params[p.key]}</span>
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${s.badgeBg}`}>
                          {s.emoji} {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 px-4 py-2 bg-slate-50">Tap any row to switch to that pond's detailed readings.</p>
          </div>
        )}
      </div>

      <AlertBanner alerts={allPondsAlerts} />

      {/* AI Recommendations */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>AI Recommendations</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${aiPoweredByGemini ? "bg-blue-100 text-blue-700 border-blue-200":"bg-slate-100 text-slate-500 border-slate-200"}`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                  {aiPoweredByGemini ? "Powered by Gemini":"Powered by Gemini"}
                </span>
              </div>
              <p className="text-sm text-slate-600">{aiLoading ? "Analysing your pond..." : `${aiRecommendations.length} insight${aiRecommendations.length !== 1 ? "s":""} for ${activeDevice?.name || "your pond"}`}</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {aiLoading ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <svg className="w-6 h-6 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <p className="text-sm text-slate-500">Gemini is analysing your water quality...</p>
            </div>
          ) : aiRecommendations.map((rec, idx) => {
            const sevStyle = { critical:"border-red-200 bg-red-50", warning:"border-amber-200 bg-amber-50", good:"border-emerald-200 bg-emerald-50" };
            const badgeStyle = { critical:"bg-red-100 text-red-700", warning:"bg-amber-100 text-amber-700", good:"bg-emerald-100 text-emerald-700" };
            return (
              <div key={idx} className={`border-2 rounded-xl p-4 ${sevStyle[rec.severity]}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1 flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900">{rec.parameter}</h4>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${badgeStyle[rec.severity]}`}>{rec.severity}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">{rec.issue}</p>
                    <div className="flex items-center gap-2 mb-2 bg-white/70 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-[#0B3D91] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-sm font-semibold text-[#0B3D91]">{rec.action}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rec.details}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Live Readings */}
      <div>
        <div className="flex items-center gap-1 mb-3">
          <h3 className="font-bold text-slate-800" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Live Readings</h3>
          <InfoTooltip text="These 6 cards show your current water measurements. Green = good, Yellow/Orange = needs attention, Red = danger. Tap the green Ideal pill on each card for a simple explanation." />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PARAM_INFO.map((p) => {
            const status = getParamStatus(p.key, params[p.key]);
            const c = statusColor[status];
            return (
              <Card key={p.key} className={`p-4 border-2 ${c.bg} relative`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs font-bold text-slate-600 uppercase">{p.label}</span>
                    <InfoTooltip text={p.tooltip} />
                  </div>
                  <Badge status={status}>{status}</Badge>
                </div>
                <div className={`text-3xl font-bold mt-1 ${c.text}`}>
                  {params[p.key]} <span className="text-sm font-normal text-slate-500">{p.unit}</span>
                </div>
                <IdealTip ideal={p.ideal} explain={p.idealExplain} />
                <div className="mt-3 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_READINGS[p.key].slice(-12)} margin={{ top:0, right:0, bottom:0, left:0 }}>
                      <defs>
                        <linearGradient id={`g${p.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={p.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={p.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={p.color} fill={`url(#g${p.key})`} strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Historical Data */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D91] to-[#0288D1] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-slate-900" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Historical Data & Trends</h3>
                <InfoTooltip text="This chart shows how your water quality has changed over time. Use it to spot patterns — for example, if ammonia rises every Monday after feeding." />
              </div>
              <p className="text-sm text-slate-600">Track how your water quality changes over time</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Time Range</label>
              <div className="flex gap-2">
                {[{ value:"24hours", label:"24 Hours" }, { value:"7days", label:"7 Days" }, { value:"30days", label:"30 Days" }].map(r => (
                  <button key={r.value} onClick={() => setSelectedDateRange(r.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${selectedDateRange === r.value ? "bg-[#0B3D91] text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Parameter</label>
              <select value={selectedParameter} onChange={e => setSelectedParameter(e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 text-sm font-semibold focus:border-[#0B3D91] focus:ring-2 focus:ring-blue-100 outline-none">
                {PARAM_INFO.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFilteredHistoricalData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize:11 }} tickFormatter={date => {
                    const d = new Date(date);
                    return selectedDateRange === "24hours" ? d.toLocaleTimeString("en-MY", { hour:"2-digit", minute:"2-digit" }) : d.toLocaleDateString("en-MY", { month:"short", day:"numeric" });
                  }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip contentStyle={{ backgroundColor:"white", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"12px" }} labelFormatter={date => new Date(date).toLocaleString("en-MY")} />
                  <Line type="monotone" dataKey={selectedParameter} stroke={PARAM_INFO.find(p => p.key === selectedParameter)?.color} strokeWidth={2} dot={{ r:2 }} activeDot={{ r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              Showing {PARAM_INFO.find(p => p.key === selectedParameter)?.label} for {selectedDateRange === "24hours" ? "24 hours" : selectedDateRange === "7days" ? "7 days" : "30 days"}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(() => {
              const filtered = getFilteredHistoricalData();
              const values = filtered.map(d => d[selectedParameter]);
              if (!values.length) return null;
              const avg = (values.reduce((a,b) => a+b, 0) / values.length).toFixed(2);
              const min = Math.min(...values).toFixed(2);
              const max = Math.max(...values).toFixed(2);
              return (<>
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                  <p className="text-xs font-bold text-blue-600 mb-1">AVERAGE</p>
                  <p className="text-lg font-bold text-blue-900">{avg}</p>
                  <p className="text-xs text-blue-500">Typical reading</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-600 mb-1">LOWEST</p>
                  <p className="text-lg font-bold text-emerald-900">{min}</p>
                  <p className="text-xs text-emerald-500">Minimum seen</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
                  <p className="text-xs font-bold text-amber-600 mb-1">HIGHEST</p>
                  <p className="text-lg font-bold text-amber-900">{max}</p>
                  <p className="text-xs text-amber-500">Maximum seen</p>
                </div>
              </>);
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}