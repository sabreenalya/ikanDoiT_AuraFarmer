export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      biomass: {
        Row: {
          avg_length: number | null
          avg_weight: number | null
          confidence: number | null
          created_at: string | null
          fish_count: number | null
          id: string
          pond_id: string
          total_biomass: number
        }
        Insert: {
          avg_length?: number | null
          avg_weight?: number | null
          confidence?: number | null
          created_at?: string | null
          fish_count?: number | null
          id?: string
          pond_id?: string
          total_biomass: number
        }
        Update: {
          avg_length?: number | null
          avg_weight?: number | null
          confidence?: number | null
          created_at?: string | null
          fish_count?: number | null
          id?: string
          pond_id?: string
          total_biomass?: number
        }
        Relationships: []
      }
      biomass_records: {
        Row: {
          avg_length: number | null
          avg_weight: number | null
          avg_weight_kg: number | null
          biomass: number | null
          biomass_kg: number | null
          fish_count: number | null
          id: string
          pond_id: string | null
          species: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          avg_length?: number | null
          avg_weight?: number | null
          avg_weight_kg?: number | null
          biomass?: number | null
          biomass_kg?: number | null
          fish_count?: number | null
          id?: string
          pond_id?: string | null
          species?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          avg_length?: number | null
          avg_weight?: number | null
          avg_weight_kg?: number | null
          biomass?: number | null
          biomass_kg?: number | null
          fish_count?: number | null
          id?: string
          pond_id?: string | null
          species?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feed_prices: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          price_per_kg: number
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          price_per_kg: number
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          price_per_kg?: number
          user_id?: string | null
        }
        Relationships: []
      }
      feeding_logs: {
        Row: {
          actual_amount: number | null
          created_at: string | null
          datetime: string | null
          fish_response: string | null
          id: string
          meal_id: string | null
          notes: string | null
          pond_id: string | null
          recommended_amount: number
          scheduled_time: string
          status: string
          user_id: string | null
        }
        Insert: {
          actual_amount?: number | null
          created_at?: string | null
          datetime?: string | null
          fish_response?: string | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          pond_id?: string | null
          recommended_amount?: number
          scheduled_time?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          actual_amount?: number | null
          created_at?: string | null
          datetime?: string | null
          fish_response?: string | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          pond_id?: string | null
          recommended_amount?: number
          scheduled_time?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feeding_logs_legacy: {
        Row: {
          created_at: string | null
          date: string | null
          feed_amount: number | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          feed_amount?: number | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          feed_amount?: number | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feeding_schedule: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meal_id: string
          planned_amount: number
          pond_id: string
          scheduled_time: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          meal_id: string
          planned_amount: number
          pond_id?: string
          scheduled_time: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meal_id?: string
          planned_amount?: number
          pond_id?: string
          scheduled_time?: string
        }
        Relationships: []
      }
      water_readings: {
        Row: {
          DO: number | null
          fish_count: number | null
          id: string
          NH3: number | null
          NO3: number | null
          pH: number | null
          Salinity: number | null
          Temp: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          DO?: number | null
          fish_count?: number | null
          id?: string
          NH3?: number | null
          NO3?: number | null
          pH?: number | null
          Salinity?: number | null
          Temp?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          DO?: number | null
          fish_count?: number | null
          id?: string
          NH3?: number | null
          NO3?: number | null
          pH?: number | null
          Salinity?: number | null
          Temp?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
