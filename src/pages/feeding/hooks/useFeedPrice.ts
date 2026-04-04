// ─── useFeedPrice.ts ─────────────────────────────────────────────────────────
// Manages feed price per kg. Persists to Supabase feed_prices table.

import { useState, useEffect } from "react";
import { supabase } from "../../../shared/aquaCore";

interface UseFeedPriceResult {
  pricePerKg: number;
  setPricePerKg: (price: number) => void;
  saving: boolean;
}

export function useFeedPrice(userId?: string): UseFeedPriceResult {
  const [pricePerKg, setPriceLocal] = useState<number>(3.5); // RM default
  const [saving, setSaving] = useState(false);

  // Fetch on mount
  useEffect(() => {
    async function fetch() {
      if (!userId) return;
      const { data } = await supabase
        .from("feed_prices")
        .select("price_per_kg")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data?.[0]) setPriceLocal(data[0].price_per_kg);
    }
    fetch().catch(() => {}); // silently fail in demo
  }, [userId]);

  const setPricePerKg = async (price: number) => {
    setPriceLocal(price);
    if (!userId) return;
    setSaving(true);
    try {
      await supabase.from("feed_prices").insert([{ user_id: userId, price_per_kg: price }]);
    } catch {
      // demo mode — local only
    } finally {
      setSaving(false);
    }
  };

  return { pricePerKg, setPricePerKg, saving };
}
