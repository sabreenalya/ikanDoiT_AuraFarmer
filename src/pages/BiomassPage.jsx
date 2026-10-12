import { useState, useMemo, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { CalendarDays } from "lucide-react";
import {
  Card,
  supabase,
  supabaseUrl,
} from "../shared/aquaCore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import processedVideo from "../assets/videos/processed-demo.mp4";
import processedVideoSmallFish from "../assets/videos/processed-demo2.mp4";
import redTilapiaImg from "../assets/images/red-tilapia.png";
import nileTilapiaImg from "../assets/images/nile-tilapia.png";
import africanCatfishImg from "../assets/images/african-catfish.png";

// Species-specific growth formula constants (FishBase)
const SPECIES_CONSTANTS = {
  "Red Tilapia": { A: 0.0209, B: 2.95 },
  "Nile Tilapia": { A: 0.0156, B: 3.05 },
  "Catfish": { A: 0.0073, B: 3.24 },
  "African Catfish": { A: 0.0073, B: 3.24 },
};

const getSpeciesConstants = (speciesName) => {
  return SPECIES_CONSTANTS[speciesName] || SPECIES_CONSTANTS["Red Tilapia"];
};

// Helper function to calculate weight for any species
const calculateSpeciesWeight = (lengthCm, speciesName) => {
  const { A, B } = getSpeciesConstants(speciesName);
  return parseFloat(((A * Math.pow(lengthCm, B)) / 1000).toFixed(4));
};

const formatDateKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (dateInput, days) => {
  const dt = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  dt.setDate(dt.getDate() + days);
  return dt;
};

const toDayNumber = (dateInput) => {
  const dt = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return Math.floor(dt.getTime() / 86400000);
};

const computeDailyGainG = (points) => {
  // points: [{ date: Date, weightG: number }], expects >= 2
  if (!points || points.length < 2) return 0;

  const xs = points.map((p) => toDayNumber(p.date));
  const ys = points.map((p) => p.weightG);

  const n = xs.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - xMean;
    num += dx * (ys[i] - yMean);
    den += dx * dx;
  }
  if (den === 0) return 0;
  return num / den; // g/day
};


const SPECIES_META = [
  {
    common: "Red Tilapia",
    scientific: "Oreochromis spp.",
    icon: "tilapia",
    imageSrc: redTilapiaImg,
    imageAlt: "Red tilapia",
  },
  {
    common: "Nile Tilapia",
    scientific: "Oreochromis niloticus",
    icon: "tilapia",
    imageSrc: nileTilapiaImg,
    imageAlt: "Nile tilapia",
  },
  {
    common: "African Catfish",
    scientific: "Clarias gariepinus",
    icon: "catfish",
    imageSrc: africanCatfishImg,
    imageAlt: "African catfish",
  },
];

const getSpeciesMeta = (commonName) => {
  return (
    SPECIES_META.find((s) => s.common === commonName) ||
    SPECIES_META[0]
  );
};

function SpeciesThumbnail({ icon, imageSrc, imageAlt }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-500">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt || ""}
          className="h-full w-full object-contain p-0.5"
          loading="lazy"
          decoding="async"
        />
      ) : icon === "catfish" ? (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12c2.8-4.5 6-6 10-6 4 0 6 2 6 6s-2 6-6 6c-4 0-7.2-1.5-10-6Z" />
          <path d="M4 10l-2-2" />
          <path d="M4 14l-2 2" />
          <path d="M8 9c-1-1.2-2.2-2-3.5-2.5" />
          <path d="M8 15c-1 1.2-2.2 2-3.5 2.5" />
          <circle cx="16" cy="11" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12c2.7-4.2 6-6 10-6 3.7 0 6 1.8 6 6s-2.3 6-6 6c-4 0-7.3-1.8-10-6Z" />
          <path d="M10 9.5c.6.8 1 1.7 1 2.5s-.4 1.7-1 2.5" />
          <path d="M14 8.5c.9 1.1 1.5 2.3 1.5 3.5S14.9 14.4 14 15.5" />
          <circle cx="16" cy="11" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      )}
    </span>
  );
}

function SpeciesOptionLabel({ commonName }) {
  const meta = getSpeciesMeta(commonName);
  return (
    <span className="flex items-center gap-2">
      <SpeciesThumbnail icon={meta.icon} imageSrc={meta.imageSrc} imageAlt={meta.imageAlt} />
      <span className="min-w-0">
        <span className="font-medium text-slate-700">{meta.common}</span>{" "}
        <span className="text-xs text-slate-500 italic">({meta.scientific})</span>
      </span>
    </span>
  );
}

const BATCH_STORAGE_KEY = "ikandoit-fish-batches-v1";
const EMPTY_PONDS = [];
const DEFAULT_TARGET_MIN_G = 450;
const DEFAULT_TARGET_MAX_G = 600;

const localDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const daysSinceDate = (dateString, today = new Date()) => {
  if (!isValidISODate(dateString)) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((end - start) / 86400000);
};

const isValidISODate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const formatDateDMY = (isoDate) => {
  if (!isValidISODate(isoDate)) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

const formatLongDateMY = (isoDate) => {
  if (!isValidISODate(isoDate)) return "Date not set";
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getBatchAge = (isoDate, today = new Date()) => {
  if (!isValidISODate(isoDate)) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  const startDate = new Date(year, month - 1, day);
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let months = (currentDate.getFullYear() - year) * 12 + currentDate.getMonth() - (month - 1);
  const addMonths = (date, monthCount) => {
    const firstOfTargetMonth = new Date(date.getFullYear(), date.getMonth() + monthCount, 1);
    const lastDayOfTargetMonth = new Date(firstOfTargetMonth.getFullYear(), firstOfTargetMonth.getMonth() + 1, 0).getDate();
    return new Date(firstOfTargetMonth.getFullYear(), firstOfTargetMonth.getMonth(), Math.min(date.getDate(), lastDayOfTargetMonth));
  };
  let monthAnchor = addMonths(startDate, months);
  if (monthAnchor > currentDate) {
    months -= 1;
    monthAnchor = addMonths(startDate, months);
  }
  const remainingDays = Math.round((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(monthAnchor.getFullYear(), monthAnchor.getMonth(), monthAnchor.getDate())) / 86400000);
  return { months, days: remainingDays };
};

const formatBatchAge = (age) => {
  if (!age) return null;
  const monthLabel = age.months === 1 ? "month" : "months";
  const dayLabel = age.days === 1 ? "day" : "days";
  return `${age.months} ${monthLabel} ${age.days} ${dayLabel}`;
};

const defaultBatch = ({ id, pondId, stockingDate, species = "Red Tilapia" }) => ({
  id,
  pondId,
  species,
  stockingDate,
  status: "Active",
  stockedFishCount: null,
  targetMinWeightG: DEFAULT_TARGET_MIN_G,
  targetMaxWeightG: DEFAULT_TARGET_MAX_G,
  biomassRecords: [],
  weightMeasurements: [],
  harvestDetails: null,
});

const createPond2SampleRecords = (batch) => {
  const stockedAt = isValidISODate(batch.stockingDate)
    ? new Date(`${batch.stockingDate}T12:00:00`)
    : new Date(Date.now() - 30 * 86400000);
  // Keep the final weekly point just below the current prototype estimate (~144 g).
  // This gives a steady upward history that joins smoothly to today's estimate.
  const weightsG = [95, 112, 129, 140];
  return weightsG.map((weightG, index) => {
    const recordedAt = new Date(stockedAt);
    recordedAt.setDate(recordedAt.getDate() + (index + 1) * 7);
    const id = `pond-2-sample-${batch.id}-${index + 1}`;
    const avgWeight = weightG / 1000;
    return {
      id,
      batchId: batch.id,
      pondId: batch.pondId,
      species: batch.species || "Red Tilapia",
      avgLength: null,
      avgWeight,
      biomass: Math.round(avgWeight * (batch.stockedFishCount || 1000)),
      fishCount: batch.stockedFishCount || 1000,
      timestamp: recordedAt.toISOString(),
    };
  });
};

const defaultPond2Batch = () => {
  const stockingDate = new Date();
  stockingDate.setDate(stockingDate.getDate() - 30);
  const batch = defaultBatch({
    id: "batch-pond-2-initial",
    pondId: "pond-2",
    stockingDate: localDateString(stockingDate),
  });
  // Prototype-only example records for Pond 2, spaced one week apart.
  // Mark them as samples so farmers can distinguish them from real estimates.
  batch.stockedFishCount = 1000;
  batch.biomassRecords = createPond2SampleRecords(batch);
  batch.weightMeasurements = batch.biomassRecords.map((record) => ({
    id: record.id,
    batchId: batch.id,
    pondId: batch.pondId,
    timestamp: record.timestamp,
    weightG: Number((record.avgWeight * 1000).toFixed(2)),
  }));
  batch.sampleDataVersion = 3;
  return batch;
};

export default function BiomassPage({ user, setLatestBiomass, setBiomassHistory, biomassHistory = [], onNavigateToFeeding, devices = EMPTY_PONDS, activeDeviceIdx = 0 }) {
  const batchStorageKey = `${BATCH_STORAGE_KEY}:${user?.id || "local"}`;
  const [avgLength, setAvgLength] = useState(20);
  const [result, setResult] = useState(null);
  const history = Array.isArray(biomassHistory) ? biomassHistory : [];
  const [simulating, setSimulating] = useState(false);
  const [useVideo, setUseVideo] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordsExpanded, setRecordsExpanded] = useState(false);
  const availablePonds = useMemo(() => {
    const actualPonds = devices.slice(0, 2).map((pond, index) => ({
      id: String(pond.id ?? `pond-${index + 1}`),
      name: index === 0 ? "Pond 1" : "Pond 2",
    }));
    if (!actualPonds.length) actualPonds.push({ id: "pond-1", name: "Pond 1" });
    if (actualPonds.length < 2) actualPonds.push({ id: "pond-2", name: "Pond 2" });
    return actualPonds;
  }, [devices]);
  const [selectedPondId, setSelectedPondId] = useState(() => {
    const pondIndex = Math.min(activeDeviceIdx, 1);
    const pond = devices[pondIndex];
    return pond ? String(pond.id ?? `pond-${pondIndex + 1}`) : "pond-1";
  });
  const [batchStore, setBatchStore] = useState({});
  const [batchDateDraft, setBatchDateDraft] = useState("");
  const [speciesDraft, setSpeciesDraft] = useState("Red Tilapia");
  const [stockedFishDraft, setStockedFishDraft] = useState("");
  const [targetMinDraft, setTargetMinDraft] = useState(String(DEFAULT_TARGET_MIN_G));
  const [targetMaxDraft, setTargetMaxDraft] = useState(String(DEFAULT_TARGET_MAX_G));
  const [newBatchDateDraft, setNewBatchDateDraft] = useState("");
  const [previousOutcomeDraft, setPreviousOutcomeDraft] = useState("Harvested");
  const [previousHarvestDateDraft, setPreviousHarvestDateDraft] = useState("");
  const [previousHarvestWeightDraft, setPreviousHarvestWeightDraft] = useState("");
  const [previousNotesDraft, setPreviousNotesDraft] = useState("");
  const [newBatchStep, setNewBatchStep] = useState("outcome");
  const [newBatchSpecies, setNewBatchSpecies] = useState("Red Tilapia");
  const [newBatchFishCount, setNewBatchFishCount] = useState("");
  const [newTargetMinDraft, setNewTargetMinDraft] = useState(String(DEFAULT_TARGET_MIN_G));
  const [newTargetMaxDraft, setNewTargetMaxDraft] = useState(String(DEFAULT_TARGET_MAX_G));
  const [batchError, setBatchError] = useState("");
  const [batchNotice, setBatchNotice] = useState("");
  const [newBatchError, setNewBatchError] = useState("");
  const [newBatchDialogOpen, setNewBatchDialogOpen] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [batchHistoryVisible, setBatchHistoryVisible] = useState(true);
  const [batchStoreReady, setBatchStoreReady] = useState(false);
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(batchStorageKey);
      const parsed = stored ? JSON.parse(stored) : {};
      const pond1Id = availablePonds[0]?.id || "pond-1";
      const pond2Id = availablePonds[1]?.id || "pond-2";
      const migrated = { ...(parsed && typeof parsed === "object" ? parsed : {}) };
      // Remove the two unwanted demo/archive records so they do not return from browser storage.
      const removeBatchIds = new Set(["257115", "172237"]);
      Object.keys(migrated).forEach((pondId) => {
        const pondData = migrated[pondId];
        if (!pondData || !Array.isArray(pondData.history)) return;
        migrated[pondId] = {
          ...pondData,
          history: pondData.history.filter((batch) => !removeBatchIds.has(String(batch?.id || "").replace(/[^a-z0-9]/gi, "").slice(-6))),
        };
      });
      if (!migrated[pond1Id] && migrated["default-pond"]) migrated[pond1Id] = migrated["default-pond"];
      if (!migrated[pond2Id] && migrated["pond-2"]) migrated[pond2Id] = migrated["pond-2"];
      if (!migrated[pond2Id]?.active) migrated[pond2Id] = { ...(migrated[pond2Id] || {}), active: { ...defaultPond2Batch(), pondId: pond2Id }, history: migrated[pond2Id]?.history || [] };
      else if (pond2Id === "pond-2" && migrated[pond2Id].active.id === "batch-pond-2-initial" && !(migrated[pond2Id].active.biomassRecords || []).length && !(migrated[pond2Id].active.weightMeasurements || []).length) {
        const seededBatch = defaultPond2Batch();
        const existingBatch = migrated[pond2Id].active;
        migrated[pond2Id] = { ...migrated[pond2Id], active: { ...seededBatch, ...existingBatch, pondId: pond2Id, stockingDate: seededBatch.stockingDate, sampleDataVersion: 3,
          biomassRecords: seededBatch.biomassRecords.map((record) => ({ ...record, species: existingBatch.species || seededBatch.species })),
          weightMeasurements: seededBatch.weightMeasurements,
        } };
      }
      const pond2Active = migrated[pond2Id]?.active;
      if (pond2Active?.id === "batch-pond-2-initial" && (pond2Active.sampleDataVersion || 0) < 3) {
        const sampleBase = pond2Active.id === "batch-pond-2-initial"
          ? { ...pond2Active, stockingDate: defaultPond2Batch().stockingDate }
          : pond2Active;
        const sampleRecords = createPond2SampleRecords(sampleBase);
        const isSeededPondTwoPoint = (record) => record.isSample || String(record.id || "").startsWith("pond-2-sample-");
        const actualRecords = (pond2Active.biomassRecords || []).filter((record) => !isSeededPondTwoPoint(record));
        const actualMeasurements = (pond2Active.weightMeasurements || []).filter((record) => !isSeededPondTwoPoint(record));
        migrated[pond2Id] = {
          ...migrated[pond2Id],
          active: {
            ...sampleBase,
            sampleDataVersion: 3,
            biomassRecords: [...actualRecords, ...sampleRecords],
            weightMeasurements: [
              ...actualMeasurements,
              ...sampleRecords.map((record) => ({ id: record.id, batchId: sampleBase.id, pondId: pond2Id, timestamp: record.timestamp, weightG: Number((record.avgWeight * 1000).toFixed(2)) })),
            ],
          },
        };
      }
      setBatchStore(migrated);
      if (!stored || JSON.stringify(migrated) !== JSON.stringify(parsed)) {
        window.localStorage.setItem(batchStorageKey, JSON.stringify(migrated));
      }
    } catch {
      setBatchNotice("Batch details will remain available for this session only because local storage could not be read.");
      const pond2Id = availablePonds[1]?.id || "pond-2";
      setBatchStore({ [pond2Id]: { active: { ...defaultPond2Batch(), pondId: pond2Id }, history: [] } });
    } finally {
      setBatchStoreReady(true);
    }
  }, [batchStorageKey, availablePonds]);

  useEffect(() => {
    const interval = window.setInterval(() => setToday(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const pondIndex = Math.min(activeDeviceIdx, 1);
    const activePond = devices[pondIndex];
    if (activePond) setSelectedPondId(String(activePond.id ?? `pond-${pondIndex + 1}`));
  }, [devices, activeDeviceIdx]);

  const selectedPond = availablePonds.find((pond) => pond.id === selectedPondId) || availablePonds[0];
  const selectedPondData = batchStore[selectedPond?.id] || { active: null, history: [] };
  const activeBatch = selectedPondData.active || null;
  const selectedSpecies = activeBatch?.species || "Red Tilapia";
  const targetMinG = Number(activeBatch?.targetMinWeightG ?? DEFAULT_TARGET_MIN_G);
  const targetMaxG = Number(activeBatch?.targetMaxWeightG ?? DEFAULT_TARGET_MAX_G);
  const hasUnsavedBatchDate = batchDateDraft !== (activeBatch?.stockingDate || "");
  const hasUnsavedSpecies = speciesDraft !== (activeBatch?.species || "Red Tilapia");
  const hasUnsavedStockedFish = (stockedFishDraft === "" ? null : Number(stockedFishDraft)) !== (activeBatch?.stockedFishCount ?? null);
  const hasUnsavedTargets = Number(targetMinDraft) !== targetMinG || Number(targetMaxDraft) !== targetMaxG;
  const batchAge = activeBatch?.stockingDate ? getBatchAge(activeBatch.stockingDate, today) : null;
  const batchAgeDays = activeBatch?.stockingDate ? daysSinceDate(activeBatch.stockingDate, today) : null;

  useEffect(() => {
    setBatchDateDraft(activeBatch?.stockingDate || "");
    setSpeciesDraft(activeBatch?.species || "Red Tilapia");
    setStockedFishDraft(activeBatch?.stockedFishCount == null ? "" : String(activeBatch.stockedFishCount));
    setTargetMinDraft(String(activeBatch?.targetMinWeightG ?? DEFAULT_TARGET_MIN_G));
    setTargetMaxDraft(String(activeBatch?.targetMaxWeightG ?? DEFAULT_TARGET_MAX_G));
    setBatchError("");
    setExpandedBatchId(null);
  }, [selectedPond?.id, activeBatch?.id]);

  useEffect(() => {
    setBatchNotice("");
  }, [selectedPond?.id]);

  function persistBatchStore(updated) {
    setBatchStore(updated);
    try {
      window.localStorage.setItem(batchStorageKey, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  function saveBatchDetails() {
    setBatchNotice("");
    const isoDate = batchDateDraft;
    if (!isValidISODate(isoDate)) {
      setBatchError("Choose a valid stocking date.");
      return;
    }
    if (isoDate > localDateString(today)) {
      setBatchError("Stocking date cannot be in the future.");
      return;
    }
    const min = Number(targetMinDraft);
    const max = Number(targetMaxDraft);
    const stockedFishCount = stockedFishDraft === "" ? null : Number(stockedFishDraft);
    if (stockedFishCount !== null && (!Number.isInteger(stockedFishCount) || stockedFishCount <= 0)) {
      setBatchError("Total fish stocked must be a positive whole number.");
      return;
    }
    if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(max) || max < min) {
      setBatchError("Target weights must be positive, and the maximum must be at least the minimum.");
      return;
    }
    if (!activeBatch) {
      setBatchError("Start a batch before saving batch details.");
      return;
    }
    const updated = {
      ...batchStore,
      [selectedPond.id]: {
        ...selectedPondData,
        active: { ...activeBatch, stockingDate: isoDate, species: speciesDraft, stockedFishCount, targetMinWeightG: min, targetMaxWeightG: max },
      },
    };
    const saved = persistBatchStore(updated);
    setBatchNotice(saved ? "Batch details saved." : "Saved for this session, but browser storage was unavailable.");
    setBatchError("");
  }

  function createNewBatch() {
    setNewBatchError("");
    const stockingDate = newBatchDateDraft;
    const min = Number(newTargetMinDraft);
    const max = Number(newTargetMaxDraft);
    const stockedFishCount = Number(newBatchFishCount);
    if (!isValidISODate(stockingDate)) {
      setNewBatchError("Choose a valid stocking date.");
      return;
    }
    if (stockingDate > localDateString(today)) {
      setNewBatchError("Stocking date cannot be in the future.");
      return;
    }
    if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(max) || max < min) {
      setNewBatchError("Target weights must be positive, and the maximum must be at least the minimum.");
      return;
    }
    if (!Number.isInteger(stockedFishCount) || stockedFishCount <= 0) {
      setNewBatchError("Enter a positive whole number for total fish stocked.");
      return;
    }
    const previousBatches = selectedPondData.history || [];
    if (activeBatch && (!isValidISODate(previousHarvestDateDraft) || previousHarvestDateDraft > localDateString(today))) {
      setNewBatchError("Choose a valid harvest date that is not in the future."); return;
    }
    if (activeBatch && previousOutcomeDraft !== "Cancelled" && (!Number.isFinite(Number(previousHarvestWeightDraft)) || Number(previousHarvestWeightDraft) <= 0)) {
      setNewBatchError("Enter a positive harvest weight."); return;
    }
    const archivedBatch = activeBatch ? {
      ...activeBatch,
      status: previousOutcomeDraft,
      closedAt: new Date(`${previousHarvestDateDraft}T12:00:00`).toISOString(),
      harvestDetails: { outcome: previousOutcomeDraft, harvestDate: previousHarvestDateDraft, harvestWeightKg: previousOutcomeDraft === "Cancelled" ? null : Number(previousHarvestWeightDraft), notes: previousNotesDraft.trim() || null },
      harvestWeightKg: previousOutcomeDraft === "Cancelled" ? null : Number(previousHarvestWeightDraft),
    } : null;
    const batchId = globalThis.crypto?.randomUUID?.() || `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const nextBatch = {
      ...defaultBatch({ id: batchId, pondId: selectedPond.id, stockingDate, species: newBatchSpecies }),
      stockedFishCount,
      targetMinWeightG: min,
      targetMaxWeightG: max,
      createdAt: new Date().toISOString(),
    };
    const updated = {
      ...batchStore,
      [selectedPond.id]: {
        active: nextBatch,
        history: archivedBatch ? [...previousBatches, archivedBatch] : previousBatches,
      },
    };
    const saved = persistBatchStore(updated);
    setNewBatchDialogOpen(false);
    setNewBatchDateDraft("");
    setBatchNotice(saved ? "New batch started. The previous batch and its measurements are preserved." : "New batch started for this session, but browser storage was unavailable.");
    setBatchError("");
  }

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

  useEffect(() => {
    setResult(null);
    setVideoResult(null);
    setUploadedFile(null);
  }, [selectedPond?.id, activeBatch?.id]);

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
    if (!activeBatch) return;
    const calculationLength = videoResult?.avgLength ?? avgLength;
    const weight = calculateSpeciesWeight(calculationLength, selectedSpecies);
    const fishCount = Number.isInteger(activeBatch.stockedFishCount) && activeBatch.stockedFishCount > 0
      ? activeBatch.stockedFishCount
      : 500;
    const biomass = videoResult?.biomassKg ?? Number((weight * fishCount).toFixed(1));
    const timestamp = new Date().toISOString();
    const recordId = globalThis.crypto?.randomUUID?.() || `measurement-${Date.now()}`;
    const r = {
      avgLength: calculationLength,
      avgWeight: weight,
      biomass,
      fishCount,
      species: selectedSpecies,
      timestamp,
      pondId: selectedPond?.id,
      batchId: activeBatch?.id || null,
      id: recordId,
    };
    setResult(r);
    setLatestBiomass(r);
    if (typeof setBiomassHistory === "function") {
      setBiomassHistory((h) => [r, ...(Array.isArray(h) ? h : []).slice(0, 99)]);
    }
    const measurement = { id: recordId, batchId: activeBatch.id, pondId: selectedPond.id, timestamp, weightG: Number((weight * 1000).toFixed(2)) };
    const currentPondData = batchStore[selectedPond.id] || { active: activeBatch, history: [] };
    const updatedBatch = {
      ...activeBatch,
      biomassRecords: [...(activeBatch.biomassRecords || []), r],
      weightMeasurements: [...(activeBatch.weightMeasurements || []), measurement],
    };
    const updated = { ...batchStore, [selectedPond.id]: { ...currentPondData, active: updatedBatch } };
    persistBatchStore(updated);
    setUseVideo(false);
    if (!supabaseUrl.includes("placeholder")) {
      supabase.from("biomass_records").insert([{
        user_id: user?.id,
        pond_id: r.pondId,
        species: r.species,
        avg_length: r.avgLength,
        avg_weight: r.avgWeight,
        fish_count: r.fishCount,
        biomass: r.biomass,
        timestamp: r.timestamp,
      }]);
    }
  }

  function simulateVideo() {
    setResult(null);
    setSimulating(true);
    setTimeout(() => {
      const baseName = uploadedFile?.name?.replace(/\.[^.]+$/, "").toLowerCase();
      const isSmallFishVideo = baseName === "fishvideo2";
      const isFullSizeFishVideo = baseName === "fishvideo1";
      const detectedLength = isSmallFishVideo ? 12 : isFullSizeFishVideo ? 20 : Number.isFinite(avgLength) && avgLength > 0 ? avgLength : 20;
      setAvgLength(parseFloat(Number(detectedLength).toFixed(1)));
      const fishCount = Number.isInteger(activeBatch?.stockedFishCount) && activeBatch.stockedFishCount > 0
        ? activeBatch.stockedFishCount
        : 500;
      setVideoResult({
        url: URL.createObjectURL(uploadedFile),
        processedUrl: isSmallFishVideo ? processedVideoSmallFish : processedVideo,
        avgLength: detectedLength,
        biomassKg: Number((calculateSpeciesWeight(detectedLength, selectedSpecies) * fishCount).toFixed(1)),
      });
      setSimulating(false);
      setUseVideo(false);
    }, 2000);
  }

  const weightTimeSeries = useMemo(() => {
    const batchMeasurements = [...(activeBatch?.weightMeasurements || [])];
    const legacyBatchRecords = (activeBatch?.biomassRecords || [])
      .filter((record) => record?.batchId === activeBatch?.id)
      .map((record) => ({ id: record.id, timestamp: record.timestamp, weightG: Number(((record.avgWeight || 0) * 1000).toFixed(2)), isSample: record.isSample }));
    const appBatchRecords = history
      .filter((record) => record?.batchId === activeBatch?.id)
      .map((record) => ({ id: record.id, timestamp: record.timestamp, weightG: Number(((record.avgWeight || 0) * 1000).toFixed(2)), isSample: record.isSample }));
    const measurementsById = new Map([...batchMeasurements, ...legacyBatchRecords, ...appBatchRecords].map((record) => [record.id || record.timestamp, record]));
    const actualRecords = Array.from(measurementsById.values())
      .map((record) => ({ date: new Date(record.timestamp), weightG: Number(record.weightG), isSample: record.isSample === true }))
      .filter((p) => Number.isFinite(p.weightG) && !Number.isNaN(p.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const recordsByDay = new Map();
    actualRecords.forEach((record) => {
      const key = formatDateKey(record.date);
      const dayRecords = recordsByDay.get(key) || [];
      dayRecords.push(record);
      recordsByDay.set(key, dayRecords);
    });
    const growthRecords = Array.from(recordsByDay.entries()).map(([key, records]) => ({
      date: new Date(`${key}T12:00:00`),
      weightG: records.reduce((sum, record) => sum + record.weightG, 0) / records.length,
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
    const dailyGainG = computeDailyGainG(growthRecords);

    const SIM_DAYS = 14;
    const simPoints = [];
    if (growthRecords.length > 0) {
      const last = growthRecords[growthRecords.length - 1];
      // Include i=0 so the simulated line starts at the last actual point.
      for (let i = 0; i <= SIM_DAYS; i++) {
        simPoints.push({
          date: addDays(last.date, i),
          weightG: Number((last.weightG + dailyGainG * i).toFixed(2)),
        });
      }
    }

    const actualByDate = new Map(growthRecords.map((p) => [formatDateKey(p.date), p.weightG]));
    const simByDate = new Map(simPoints.map((p) => [formatDateKey(p.date), p.weightG]));
    const stockingDateKey = isValidISODate(activeBatch?.stockingDate) ? activeBatch.stockingDate : null;
    const allDates = Array.from(new Set([...actualByDate.keys(), ...simByDate.keys(), ...(stockingDateKey ? [stockingDateKey] : [])])).sort();

    const chartData = allDates.map((key) => ({
      date: key,
      actualWeightG: actualByDate.get(key) ?? null,
      simulatedWeightG: simByDate.get(key) ?? null,
    }));

    const allWeights = chartData
      .flatMap((d) => [d.actualWeightG, d.simulatedWeightG])
      .filter((v) => typeof v === "number" && Number.isFinite(v));

    const yMin = Math.min(...allWeights, targetMinG);
    const yMax = Math.max(...allWeights, targetMaxG);
    const yPad = Math.max(5, (yMax - yMin) * 0.15);

    const STEP = 20;
    const yStart = Math.max(0, Math.floor((yMin - yPad) / STEP) * STEP);
    const yEnd = Math.ceil((yMax + yPad) / STEP) * STEP;

    const yTicks = [];
    for (let v = yStart; v <= yEnd; v += STEP) {
      yTicks.push(v);
    }

    const yDomain = [yStart, yEnd];

    return {
      chartData,
      actualCount: growthRecords.length,
      dailyGainG,
      yDomain,
      yTicks,
      targetMinG,
      targetMaxG,
    };
  }, [activeBatch, history, targetMinG, targetMaxG]);

  const currentBatchRecords = useMemo(() => {
    if (!activeBatch) return [];
    const savedRecords = activeBatch.biomassRecords || [];
    const appRecords = history.filter((record) => record?.batchId === activeBatch.id);
    return Array.from(new Map([...savedRecords, ...appRecords].map((record) => [record.id || record.timestamp, record])).values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeBatch, history]);

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

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-700">Fish Batch Information</h3>
            <p className="mt-1 text-xs text-slate-500">Track the production cycle for each pond.</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${batchAgeDays !== null && batchAgeDays >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${batchAgeDays !== null && batchAgeDays >= 0 ? "bg-emerald-500" : "bg-slate-400"}`} />
            {batchAgeDays !== null && batchAgeDays >= 0 ? "Active Batch" : "Not Started"}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Pond</label>
            <Select value={selectedPondId} onValueChange={setSelectedPondId}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm"><SelectValue placeholder="Select pond" /></SelectTrigger>
              <SelectContent>{availablePonds.map((pond) => <SelectItem key={pond.id} value={pond.id}>{pond.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Fish Species</label>
            <Select value={speciesDraft} onValueChange={(value) => { setSpeciesDraft(value); setBatchError(""); setBatchNotice(""); }}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm"><SelectValue placeholder="Select species" /></SelectTrigger>
              <SelectContent>{SPECIES_META.map((option) => <SelectItem key={option.common} value={option.common}><SpeciesOptionLabel commonName={option.common} /></SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="batch-stocking-date" className="mb-1.5 block text-xs font-semibold text-slate-600">Stocking Date</label>
            <input id="batch-stocking-date" type="date" lang="en-GB" max={localDateString(today)} value={batchDateDraft}
              onChange={(event) => { setBatchDateDraft(event.target.value); setBatchError(""); setBatchNotice(""); }}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" aria-invalid={Boolean(batchError)} />
          </div>
          <div>
            <label htmlFor="stocked-fish-count" className="mb-1.5 block text-xs font-semibold text-slate-600">Total Fish Stocked</label>
            <input id="stocked-fish-count" type="number" min="1" step="1" inputMode="numeric" value={stockedFishDraft}
              onChange={(event) => { setStockedFishDraft(event.target.value); setBatchError(""); setBatchNotice(""); }}
              placeholder="Enter fish count" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Target Harvest Weight (g/fish)</label>
            <div className="flex items-center gap-2">
              <input aria-label="Minimum target harvest weight in grams per fish" type="number" min="1" value={targetMinDraft}
                onChange={(event) => { setTargetMinDraft(event.target.value); setBatchError(""); setBatchNotice(""); }}
                className="h-10 w-full min-w-0 rounded-xl border border-slate-200 px-2 text-sm outline-none focus:border-blue-400" />
              <span className="text-xs text-slate-400">to</span>
              <input aria-label="Maximum target harvest weight in grams per fish" type="number" min="1" value={targetMaxDraft}
                onChange={(event) => { setTargetMaxDraft(event.target.value); setBatchError(""); setBatchNotice(""); }}
                className="h-10 w-full min-w-0 rounded-xl border border-slate-200 px-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Market target range; adjust for your buyer.</p>
          </div>
        </div>

        <div className="mt-5 border-t border-blue-100 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-4 sm:px-5">
            <CalendarDays className="h-6 w-6 shrink-0 text-[#0B3D91]" aria-hidden="true" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Current Batch Age</p>
              <p className="text-2xl font-bold leading-tight text-slate-900">
                {batchAgeDays !== null && batchAgeDays >= 0 ? formatBatchAge(batchAge) : "Not started"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {activeBatch?.stockingDate ? `Stocked on ${formatLongDateMY(activeBatch.stockingDate)}` : "Set a stocking date to start this batch."}
              </p>
            </div>
          </div>
        </div>

        {(hasUnsavedBatchDate || hasUnsavedSpecies || hasUnsavedStockedFish || hasUnsavedTargets) && !batchError && <p className="mt-3 text-xs text-amber-700">You have unsaved batch details.</p>}
        {batchError && <p role="alert" className="mt-3 text-xs font-medium text-red-600">{batchError}</p>}
        {batchNotice && !(hasUnsavedBatchDate || hasUnsavedSpecies || hasUnsavedStockedFish || hasUnsavedTargets) && <p role="status" className="mt-3 text-xs text-emerald-700">{batchNotice}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" onClick={saveBatchDetails} disabled={!activeBatch || (!hasUnsavedBatchDate && !hasUnsavedSpecies && !hasUnsavedStockedFish && !hasUnsavedTargets)} className="rounded-xl bg-[#0B3D91] hover:bg-[#092f70]">Save Batch Details</Button>
          <Button type="button" variant="outline" onClick={() => {
            setNewBatchStep(activeBatch ? "outcome" : "details");
            setPreviousOutcomeDraft("Harvested");
            setPreviousHarvestDateDraft(localDateString(today));
            setPreviousHarvestWeightDraft(""); setPreviousNotesDraft("");
            setNewBatchDateDraft("");
            setNewBatchSpecies(selectedSpecies);
            setNewBatchFishCount("");
            setNewTargetMinDraft(String(targetMinG));
            setNewTargetMaxDraft(String(targetMaxG));
            setNewBatchError("");
            setNewBatchDialogOpen(true);
          }} className="rounded-xl border-slate-200 text-slate-600">Start New Batch</Button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Target weights are farmer-configured market goals, not a universal biological standard.</p>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div><h4 className="text-sm font-semibold text-slate-700">Batch History — {selectedPond?.name}</h4>
              <span className="text-xs text-slate-400">{(selectedPondData.history || []).filter((batch) => batch.status !== "Previous").length} recorded batches</span></div>
            <Button type="button" variant="outline" aria-expanded={batchHistoryVisible} onClick={() => setBatchHistoryVisible((visible) => !visible)} className="h-9 rounded-xl border-slate-200 px-3 text-xs text-slate-600">
              {batchHistoryVisible ? "Hide history" : "View history"}
            </Button>
          </div>
          {batchHistoryVisible && ((selectedPondData.history || []).filter((batch) => batch.status !== "Previous").length > 0 ? (
            <div className="space-y-2">
              {[...(selectedPondData.history || []).filter((batch) => batch.status !== "Previous")].reverse().map((batch) => {
                const isExpanded = expandedBatchId === batch.id;
                const outcomeStyle = batch.status === "Harvested" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : batch.status === "Partially Harvested" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-rose-50 text-rose-700 ring-rose-200";
                const records = [
                  ...(batch.biomassRecords || []),
                  ...history.filter((record) => record?.batchId === batch.id),
                ].filter((record, index, list) => list.findIndex((item) => item.id === record.id) === index);
                const measurements = batch.weightMeasurements || [];
                const duration = daysSinceDate(batch.stockingDate, batch.closedAt ? new Date(batch.closedAt) : today);
                return (
                  <div key={batch.id} className="overflow-hidden rounded-xl border border-slate-100">
                    <button type="button" onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)} aria-expanded={isExpanded}
                      className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-700">{batch.species || "Red Tilapia"} · {formatDateDMY(batch.stockingDate) || "Date unavailable"}</span>
                        <span className="block text-xs text-slate-400">BatchID-{String(batch.id || "000000").replace(/[^a-z0-9]/gi, "").slice(-6).padStart(6, "0").toUpperCase()} · {duration !== null ? `${duration} days` : "Duration unavailable"}</span>
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${outcomeStyle}`}>{batch.status}</span>
                    </button>
                    {isExpanded && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/70 px-3 py-3 text-xs">
                        <p className="text-slate-600">Pond: {selectedPond?.name} · Target: {batch.targetMinWeightG ?? DEFAULT_TARGET_MIN_G}–{batch.targetMaxWeightG ?? DEFAULT_TARGET_MAX_G} g/fish</p>
                        {batch.stockedFishCount != null && <p className="text-slate-600">Total fish stocked: {batch.stockedFishCount.toLocaleString()}</p>}
                        {batch.harvestDetails && <><p className="text-slate-600">Outcome: {batch.harvestDetails.outcome || batch.status}{batch.harvestDetails.harvestDate ? ` · Harvest date: ${formatDateDMY(batch.harvestDetails.harvestDate)}` : ""}{batch.harvestDetails.harvestWeightKg != null ? ` · Harvest weight: ${batch.harvestDetails.harvestWeightKg} kg` : ""}</p>{batch.harvestDetails.notes && <p className="text-slate-600">Notes: {batch.harvestDetails.notes}</p>}</>}
                        <p className="font-semibold text-slate-600">Biomass calculations ({records.length})</p>
                        {records.length ? records.map((record) => <p key={record.id} className="text-slate-500">{new Date(record.timestamp).toLocaleString("en-MY")} · {(Number(record.avgWeight) * 1000).toFixed(1)} g/fish · {record.biomass} kg</p>) : <p className="text-slate-400">No biomass calculations recorded for this batch.</p>}
                        <p className="font-semibold text-slate-600">Weight measurements ({measurements.length})</p>
                        {measurements.length ? measurements.map((measurement) => <p key={measurement.id} className="text-slate-500">{new Date(measurement.timestamp).toLocaleString("en-MY")} · {Number(measurement.weightG).toFixed(1)} g/fish</p>) : <p className="text-slate-400">No separate weight measurements recorded.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">No recorded batch history for this pond yet.</p>)}
        </div>
      </Card>

      <Dialog open={newBatchDialogOpen} onOpenChange={setNewBatchDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Start a new batch in {selectedPond?.name}?</DialogTitle>
            <DialogDescription>{newBatchStep === "outcome" ? "Record what happened to the current batch before entering details for the next batch." : "Enter the fish batch information for the next production cycle."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {newBatchStep === "outcome" && activeBatch ? <>
              <label className="block text-xs font-semibold text-slate-600" htmlFor="previous-outcome">What happened to the previous batch?</label>
              <select id="previous-outcome" value={previousOutcomeDraft} onChange={(e) => setPreviousOutcomeDraft(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"><option>Harvested</option><option>Partially Harvested</option><option>Cancelled</option></select>
              <div><label htmlFor="previous-harvest-date" className="mb-1 block text-xs font-semibold text-slate-600">Harvest Date</label><input id="previous-harvest-date" type="date" lang="en-GB" max={localDateString(today)} value={previousHarvestDateDraft} onChange={(e) => setPreviousHarvestDateDraft(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></div>
              {previousOutcomeDraft !== "Cancelled" && <div><label htmlFor="previous-harvest-weight" className="mb-1 block text-xs font-semibold text-slate-600">Harvest Weight (kg)</label><input id="previous-harvest-weight" type="number" min="0.01" step="0.01" value={previousHarvestWeightDraft} onChange={(e) => setPreviousHarvestWeightDraft(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></div>}
              <div><label htmlFor="previous-harvest-notes" className="mb-1 block text-xs font-semibold text-slate-600">Notes (optional)</label><textarea id="previous-harvest-notes" value={previousNotesDraft} onChange={(e) => setPreviousNotesDraft(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" rows={2} /></div>
            </> : <>
            <div><label htmlFor="new-batch-date" className="mb-1 block text-xs font-semibold text-slate-600">Stocking Date</label>
              <input id="new-batch-date" type="date" lang="en-GB" max={localDateString(today)} value={newBatchDateDraft} onChange={(event) => setNewBatchDateDraft(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></div>
            <div><label htmlFor="new-batch-fish-count" className="mb-1 block text-xs font-semibold text-slate-600">Total Fish Stocked</label>
              <input id="new-batch-fish-count" type="number" min="1" step="1" inputMode="numeric" value={newBatchFishCount} onChange={(event) => setNewBatchFishCount(event.target.value)} placeholder="Enter fish count" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Fish Species</label>
              <Select value={newBatchSpecies} onValueChange={setNewBatchSpecies}><SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm"><SelectValue /></SelectTrigger><SelectContent>{SPECIES_META.map((option) => <SelectItem key={option.common} value={option.common}><SpeciesOptionLabel commonName={option.common} /></SelectItem>)}</SelectContent></Select></div>
            <div><span className="mb-1 block text-xs font-semibold text-slate-600">Target Harvest Weight (g/fish)</span><div className="flex items-center gap-2"><input aria-label="New batch minimum target weight in grams per fish" type="number" min="1" value={newTargetMinDraft} onChange={(event) => setNewTargetMinDraft(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /><span className="text-xs text-slate-400">to</span><input aria-label="New batch maximum target weight in grams per fish" type="number" min="1" value={newTargetMaxDraft} onChange={(event) => setNewTargetMaxDraft(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></div></div>
            </>}
            {newBatchError && <p role="alert" className="text-xs font-medium text-red-600">{newBatchError}</p>}
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setNewBatchDialogOpen(false)}>Cancel</Button>{newBatchStep === "outcome" && activeBatch ? <Button type="button" className="bg-[#0B3D91] hover:bg-[#092f70]" onClick={() => { setNewBatchError(""); setNewBatchStep("details"); }}>Next: Batch Details</Button> : <Button type="button" className="bg-[#0B3D91] hover:bg-[#092f70]" onClick={createNewBatch}>Create Batch</Button>}</DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid items-start md:grid-cols-5 gap-6">
        {/* Left: Biomass calculation workflow */}
        <Card className="md:col-span-3 self-start p-5">
          <h3 className="font-semibold text-slate-700 mb-4">
            Biomass Calculation
          </h3>
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Active batch species: <span className="font-semibold text-slate-700">{selectedSpecies}</span></p>
            {!activeBatch && <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">Start a batch for this pond before calculating biomass.</p>}
            <div
              className={`p-3 rounded-xl border ${
                useVideo ? "border-blue-200 bg-blue-50" : "border-slate-200"
              }`}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useVideo}
                  onChange={(e) => {
                    setUseVideo(e.target.checked);
                    if (e.target.checked) { setVideoResult(null); setResult(null); }
                  }}
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
                    accept="video/*"
                    onClick={() => { setVideoResult(null); setResult(null); }}
                    onChange={(e) => {
                      setUploadedFile(e.target.files?.[0] || null);
                      setVideoResult(null);
                      setResult(null);
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
                    className="h-[300px] w-full rounded-lg bg-black object-contain sm:h-[360px]"
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
              disabled={!videoResult || !activeBatch || !batchStoreReady || hasUnsavedSpecies}
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
                  { label: "Total Fish Stocked", value: result.fishCount.toLocaleString() },
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
                  Formula: Weight = {getSpeciesConstants(result.species).A} × Length<sup>{getSpeciesConstants(result.species).B}</sup> ({result.species})
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
                          <span className="text-xs text-slate-700 font-medium">Alerts</span>
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

      {/* Weight Over Time Graph */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-700 mb-1 text-sm">
          Weight Over Time ({selectedSpecies})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {weightTimeSeries.actualCount > 0
            ? "Points show recorded batch weights. Dashed values are 14-day projections from the recorded trend."
            : "No weight measurements are recorded for this batch yet. The green band shows your configured harvest target."}
        </p>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            key={`${selectedPond?.id}:${activeBatch?.id || "none"}`}
            data={weightTimeSeries.chartData}
            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <ReferenceArea y1={weightTimeSeries.targetMinG} y2={weightTimeSeries.targetMaxG} fill="#22c55e" fillOpacity={0.12}
              stroke="#16a34a" strokeOpacity={0.45} label={{ value: `Target Harvest Range: ${weightTimeSeries.targetMinG}–${weightTimeSeries.targetMaxG} g`, position: "insideTopRight", fill: "#15803d", fontSize: 10 }} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              label={{
                value: "Weight (g)",
                angle: -90,
                position: "insideLeft",
                fontSize: 11,
                fill: "#94a3b8",
              }}
              domain={weightTimeSeries.yDomain}
              ticks={weightTimeSeries.yTicks}
              tickFormatter={(v) => Math.round(v)}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(value) => `${value}`}
              formatter={(v, name) => {
                if (v == null) return ["", ""];
                const label = name === "simulatedWeightG" ? "Projected" : "Actual";
                return [`${Number(v).toFixed(1)}g`, label];
              }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(value) => (value === "simulatedWeightG" ? "Projected" : "Actual")}
            />
            <Line
              type="monotone"
              dataKey="actualWeightG"
              name="actualWeightG"
              stroke="#0B3D91"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="simulatedWeightG"
              name="simulatedWeightG"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Estimated growth factor:{" "}
            <span className="font-semibold text-slate-700">
              {weightTimeSeries.actualCount >= 2
                ? `${weightTimeSeries.dailyGainG.toFixed(1)} g/day`
                : "Not enough data (need 2+ calculations)"}
            </span>
          </p>
          <p className="text-xs text-slate-400">
            Simulation horizon: 14 days
          </p>
        </div>
      </Card>

      {currentBatchRecords.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-700 mb-3">
            Recent Records · {selectedPond?.name} · {selectedSpecies}
          </h3>
          <Collapsible open={recordsExpanded} onOpenChange={setRecordsExpanded}>
            <div className="space-y-2">
              {currentBatchRecords.slice(0, 3).map((r, idx, arr) => {
                const hasMore = currentBatchRecords.length > 3;
                const isLastVisible = !hasMore && idx === arr.length - 1;
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between py-2.5 border-b border-slate-50 ${
                      isLastVisible ? "border-b-0" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {r.species} · {(Number(r.avgWeight) * 1000).toFixed(1)} g/fish
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(r.timestamp).toLocaleString("en-MY")}
                      </p>
                    </div>
                    <span className="font-bold text-[#0B3D91]">
                      {r.biomass} kg
                    </span>
                  </div>
                );
              })}
            </div>

            {currentBatchRecords.length > 3 && (
              <>
                <CollapsibleTrigger
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {recordsExpanded ? "See less" : `See more (${currentBatchRecords.length - 3})`}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 h-72 space-y-2 overflow-y-auto overscroll-contain pr-6 [scrollbar-gutter:stable]">
                    {currentBatchRecords.slice(3).map((r, idx, arr) => (
                      <div
                        key={r.id}
                        className={`flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 ${
                          idx === arr.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700">
                            {r.species} · {(Number(r.avgWeight) * 1000).toFixed(1)} g/fish
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(r.timestamp).toLocaleString("en-MY")}
                          </p>
                        </div>
                        <span className="shrink-0 pr-1 font-bold text-[#0B3D91]">
                          {r.biomass} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </>
            )}
          </Collapsible>
        </Card>
      )}
    </div>
  );
}
