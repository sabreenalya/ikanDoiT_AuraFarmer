import { useState, useMemo, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  supabase,
  supabaseUrl,
} from "../shared/aquaCore";
import processedVideo from "../assets/videos/processed-demo.mp4";

// Species-specific growth formula constants (FishBase)
const SPECIES_CONSTANTS = {
  "Red Tilapia": { A: 0.0209, B: 2.95 },
  "Nile Tilapia": { A: 0.0156, B: 3.05 },
  "Catfish": { A: 0.0073, B: 3.24 },
};

const getSpeciesConstants = (speciesName) => {
  return SPECIES_CONSTANTS[speciesName] || SPECIES_CONSTANTS["Red Tilapia"];
};

// Helper function to calculate weight for any species
const calculateSpeciesWeight = (lengthCm, speciesName) => {
  const { A, B } = getSpeciesConstants(speciesName);
  return parseFloat(((A * Math.pow(lengthCm, B)) / 1000).toFixed(4));
};

export default function BiomassPage({ user, setLatestBiomass, onNavigateToFeeding }) {
  const [fishCount, setFishCount] = useState(500);
  const [avgLength, setAvgLength] = useState(20);
  const [species, setSpecies] = useState("Red Tilapia");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [useVideo, setUseVideo] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const videoResultRef = useRef(null);
  const resultCardRef = useRef(null);
  const calculateButtonRef = useRef(null);

  // Scroll to calculate button when detection completes
  useEffect(() => {
    if (videoResult && calculateButtonRef.current) {
      setTimeout(() => {
        const elementBottom = calculateButtonRef.current.getBoundingClientRect().bottom + window.scrollY;
        window.scrollTo({
          top: elementBottom - window.innerHeight + 20,
          behavior: "smooth"
        });
      }, 100);
    }
  }, [videoResult]);

  // Scroll to result card when calculation completes
  useEffect(() => {
    if (result && resultCardRef.current) {
      setTimeout(() => {
        const offset = 85;
        const elementTop = resultCardRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementTop - offset,
          behavior: "smooth"
        });
      }, 100);
    }
  }, [result]);

  function calculate() {
    const weight = calculateSpeciesWeight(avgLength, species);
    const biomass = parseFloat((weight * fishCount).toFixed(2));
    const r = {
      avgLength,
      avgWeight: weight,
      biomass,
      fishCount,
      species,
      timestamp: new Date().toISOString(),
    };
    setResult(r);
    setLatestBiomass(r);
    setHistory((h) => [{ ...r, id: Date.now() }, ...h.slice(0, 4)]);
    setUseVideo(false);
    if (!supabaseUrl.includes("placeholder")) {
      supabase.from("biomass_records").insert([{ user_id: user?.id, ...r }]);
    }
  }

  function simulateVideo() {
    setSimulating(true);
    setTimeout(() => {
      const mockLength = 18 + Math.random() * 8;
      setAvgLength(parseFloat(mockLength.toFixed(1)));
      // Simulate processed video URL (in real app, this would be from server)
      setVideoResult({
        url: URL.createObjectURL(uploadedFile),
        processedUrl: processedVideo,
      });
      setSimulating(false);
      setUseVideo(false);
    }, 2000);
  }

  const growthData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const l = 5 + i * 3;
        return {
          length: l,
          weight: parseFloat((calculateSpeciesWeight(l, species) * 1000).toFixed(1)),
        };
      }),
    [species]
  );

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes highlightGlow {
          0% {
            box-shadow: 0 0 0 0px rgba(11, 61, 145, 0.4), 0 0 20px rgba(11, 61, 145, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(11, 61, 145, 0.1), 0 0 40px rgba(11, 61, 145, 0.35);
          }
          100% {
            box-shadow: 0 0 0 0px rgba(11, 61, 145, 0), 0 0 20px rgba(11, 61, 145, 0.05);
          }
        }
      `}</style>
      <div>
        <h2
          className="text-xl font-bold text-slate-800"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Biomass Estimation
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Calculate estimated biomass through video analysis
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 auto-rows-fr">
        {/* Left: Input Card (spans 3 cols for 60/40 split) */}
        <Card className="md:col-span-3 p-5 h-full">
          <h3 className="font-semibold text-slate-700 mb-4">
            Fish Data Input
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Species
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 outline-none bg-white"
              >
                <option>Red Tilapia</option>
                <option>Nile Tilapia</option>
                <option>Catfish</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Total Fish in Pond
              </label>
              <input
                type="number"
                value={fishCount}
                onChange={(e) =>
                  setFishCount(parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-400 outline-none"
              />
            </div>
            <div
              className={`p-3 rounded-xl border ${
                useVideo ? "border-blue-200 bg-blue-50" : "border-slate-200"
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useVideo}
                  onChange={(e) => setUseVideo(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  Upload Video
                </span>
              </label>
              {useVideo && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-slate-500 mb-2">
                    📹 Video requirements: MP4, WebM, or MOV format • Max 10 seconds
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Recording Tip:
                    </p>
                    <p className="text-xs text-blue-600">
                      Keep the camera about 1 meter above the pond, avoid zoom, and record from a top-down angle for accurate fish size estimation.
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={(e) => {
                      setUploadedFile(e.target.files?.[0] || null);
                      setVideoResult(null);
                    }}
                    className="w-full text-xs text-slate-500"
                  />
                  <button
                    onClick={simulateVideo}
                    disabled={simulating || !uploadedFile}
                    className="w-full py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-60"
                  >
                    {simulating
                      ? "⚙ Analyzing video…"
                      : "Run Detection"}
                  </button>
                  {simulating && (
                    <p className="text-xs text-blue-600 text-center">
                      AI model detecting fish…
                    </p>
                  )}
                </div>
              )}
              {videoResult && (
                <div ref={videoResultRef} className="mt-3 space-y-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-700">
                    ✓ Detection Complete - Processed Video
                  </p>
                  <video
                    src={videoResult.processedUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
                  <p className="text-xs text-emerald-600">
                    Fish detected and marked with bounding boxes • Ready to calculate biomass
                  </p>
                </div>
              )}
            </div>

            <button
              ref={calculateButtonRef}
              onClick={calculate}
              disabled={!videoResult}
              className="w-full py-3 bg-[#0B3D91] text-white rounded-xl font-bold text-sm hover:bg-[#1565C0] transition-all shadow disabled:opacity-60"
            >
              Calculate Biomass →
            </button>
          </div>
        </Card>

        {/* Right column: Results + CTA (stacked vertically) */}
        <div className="md:col-span-2 flex flex-col gap-6 w-full h-full">
          {/* Results Card */}
          {result ? (
            <div key={result.timestamp} style={{ animation: 'highlightGlow 2.5s ease-out forwards', borderRadius: '1rem' }}>
              <Card ref={resultCardRef} className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 h-full flex flex-col">
                <h3 className="font-semibold text-slate-700 mb-4">
                Estimation Results
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Species", value: result.species },
                  {
                    label: "Fish Count",
                    value: result.fishCount.toLocaleString(),
                    unit: "fish",
                  },
                  { label: "Avg. Length", value: result.avgLength, unit: "cm" },
                  {
                    label: "Avg. Weight",
                    value: (result.avgWeight * 1000).toFixed(1),
                    unit: "g",
                  },
                  {
                    label: "Total Biomass",
                    value: result.biomass,
                    unit: "kg",
                    big: true,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className={`flex items-center justify-between ${
                      r.big ? "pt-3 border-t border-blue-200" : ""
                    }`}
                  >
                    <span className="text-sm text-slate-600">{r.label}</span>
                    <span
                      className={`font-bold text-[#0B3D91] ${
                        r.big ? "text-2xl" : "text-base"
                      }`}
                    >
                      {r.value}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        {r.unit}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white/60 rounded-xl">
                <p className="text-xs text-slate-500 text-center">
                  Formula: Weight = {getSpeciesConstants(species).A} × Length<sup>{getSpeciesConstants(species).B}</sup> ({species})
                </p>
              </div>
              </Card>
            </div>
          ) : (
            <Card className="p-5 flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <div className="text-5xl mb-3">🐟</div>
                <p className="text-sm">
                  Enter fish data and calculate to see biomass estimation
                </p>
              </div>
            </Card>
          )}

          {/* CTA Card - appears below results */}
          {result && onNavigateToFeeding && (
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 rounded-2xl p-0.5 shadow-xl">
              <div className="bg-white rounded-2xl p-4 md:p-5 relative overflow-hidden">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-indigo-50/40 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full inline-block mb-2">
                        ⚡Next Step
                      </span>
                      
                      <h3 
                        className="text-lg md:text-xl font-bold text-slate-900 mb-2"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        Optimize Feeding
                      </h3>
                      
                      <p className="text-slate-600 text-xs md:text-sm mb-3 leading-relaxed">
                        Your biomass is ready! Generate a personalized feeding schedule that adapts to your fish weight and species.
                      </p>

                      {/* Feature highlights - compact grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-start gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-slate-700 font-medium">Smart timing</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-slate-700 font-medium">Qty calculated</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-slate-700 font-medium">Cost track</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-slate-700 font-medium">Insights</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={onNavigateToFeeding}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0B3D91] to-[#1565C0] text-white font-bold text-xs md:text-sm rounded-lg hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                      >
                        <span>Go to Feeding</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-slate-700 mb-1 text-sm">
          Weight-Length Growth Curve ({species})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Based on FishBase allometric formula: W = {getSpeciesConstants(species).A} × L<sup>{getSpeciesConstants(species).B}</sup>
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            key={species}
            data={growthData}
            margin={{ top: 0, right: 10, bottom: 10, left: 0 }}
          >
            <defs>
              <linearGradient id="gBiomass" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#0B3D91"
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor="#0B3D91"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="length"
              label={{
                value: "Length (cm)",
                position: "insideBottom",
                offset: -5,
                fontSize: 11,
                fill: "#94a3b8",
              }}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
            />
            <YAxis
              label={{
                value: "Weight (g)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#94a3b8",
              }}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(value) => `${value} cm`}
              formatter={(v) => [`${v}g`, "Weight"]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#0B3D91"
              fill="url(#gBiomass)"
              strokeWidth={2.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {history.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-700 mb-3">
            Recent Records
          </h3>
          <div className="space-y-2">
            {history.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {r.species} — {r.fishCount} fish
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-[#0B3D91]">
                  {r.biomass} kg
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
