// ─── feeding.types.ts ────────────────────────────────────────────────────────
// Central type definitions for the Intelligent Feeding Management System

export type FishResponse = "finished" | "leftover" | "not_eating";

export type FeedingStatus = "pending" | "done" | "missed";

export interface ScheduleSlot {
  time: string;           // "06:00", "12:00", "18:00"
  amount: number;         // kg per meal
  label: string;          // "Morning Feed", "Afternoon Feed", etc.
}

export interface FeedingChecklistItem extends ScheduleSlot {
  id: string;             // unique per slot per day
  status: FeedingStatus;
  scheduledAt: Date;      // full datetime for the slot today
  completedAt?: Date;
  actualAmount?: number;
  fishResponse?: FishResponse;
  notes?: string;
}

export interface BiomassRecord {
  id: string;
  pond_id: string;
  biomass_kg: number;
  avg_weight_kg: number;
  fish_count: number;
  timestamp: string;  // biomass_records uses "timestamp" (original schema)
}

export interface FeedingLog {
  id: string;
  pond_id: string;
  scheduled_time: string;
  recommended_amount: number;
  actual_amount: number;
  status: FeedingStatus;
  fish_response: FishResponse | null;
  notes: string | null;
  created_at: string;  // log creation time
}

export interface FeedPrice {
  id: string;
  user_id: string;
  price_per_kg: number;
  brand?: string;
  timestamp: string;  // biomass_records uses "timestamp" (original schema)
}

export interface FeedingAlert {
  id: string;
  type: "reminder" | "missed" | "abnormal" | "overfeeding" | "trend";
  severity: "info" | "warning" | "critical";
  message: string;
  triggeredAt: Date;
  dismissed: boolean;
}

export interface CostSummary {
  dailyFeed: number;       // kg
  dailyCost: number;       // RM
  monthlyCost: number;     // RM
  pricePerKg: number;      // RM
}

export interface FeedingInsight {
  type: "overfeeding" | "drop" | "trend_up" | "trend_down" | "normal";
  message: string;
  percentage?: number;
}

export interface AdaptiveAdjustment {
  factor: number;          // multiplier: 0.85 = reduce 15%
  reason: string;
}