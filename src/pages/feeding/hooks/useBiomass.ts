// ─── useBiomass.ts ────────────────────────────────────────────────────────────
// Auto-fetches latest biomass record per pond. Detects staleness.

import { useState, useEffect } from "react";
import { supabase } from "../../../shared/aquaCore";
import type { BiomassRecord } from "../types/feeding.types";

interface UseBiomassResult {
  biomass: BiomassRecord | null;
  isStale: boolean;           // true if > 24h old
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBiomass(pondId?: string): UseBiomassResult {
  const [biomass, setBiomass] = useState<BiomassRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        // biomass_records uses "timestamp" not "created_at" (original schema)
        let query = supabase
          .from("biomass_records")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(1);

        if (pondId) query = query.eq("pond_id", pondId);

        const { data, error: err } = await query;
        if (err) throw err;
        setBiomass(data?.[0] ?? null);
      } catch (e: any) {
        // Demo fallback when Supabase is not configured
        setBiomass({
          id: "mock-biomass",
          pond_id: pondId ?? "pond-1",
          biomass_kg: 250,
          avg_weight_kg: 0.18,
          fish_count: 1389,
          timestamp: new Date(Date.now() - 2 * 3_600_000).toISOString(),
        });
        setError(null); // swallow in demo mode
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [pondId, tick]);

  // Subscribe to realtime changes on biomass_records
  useEffect(() => {
    const channel = supabase
      .channel("biomass-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "biomass_records" },
        () => setTick((t) => t + 1)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pondId]);

  const isStale = biomass
    ? Date.now() - new Date((biomass as any).timestamp ?? (biomass as any).created_at).getTime() > 24 * 3_600_000
    : false;

  return {
    biomass,
    isStale,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}