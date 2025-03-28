export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_results: {
        Row: {
          created_at: string
          date_from: string | null
          date_to: string | null
          device_distribution: Json | null
          geographical_data: Json | null
          id: string
          performance_metrics: Json | null
          retention_data: Json | null
          time_range: string | null
        }
        Insert: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          device_distribution?: Json | null
          geographical_data?: Json | null
          id?: string
          performance_metrics?: Json | null
          retention_data?: Json | null
          time_range?: string | null
        }
        Update: {
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          device_distribution?: Json | null
          geographical_data?: Json | null
          id?: string
          performance_metrics?: Json | null
          retention_data?: Json | null
          time_range?: string | null
        }
        Relationships: []
      }
      app_analytics: {
        Row: {
          conversion_rate: number | null
          crashes: number | null
          date_from: string | null
          date_range: string
          date_to: string | null
          downloads: number | null
          growth_metrics: Json | null
          id: string
          impressions: number | null
          page_views: number | null
          proceeds: number | null
          raw_metrics: Json | null
          timestamp: string
        }
        Insert: {
          conversion_rate?: number | null
          crashes?: number | null
          date_from?: string | null
          date_range: string
          date_to?: string | null
          downloads?: number | null
          growth_metrics?: Json | null
          id?: string
          impressions?: number | null
          page_views?: number | null
          proceeds?: number | null
          raw_metrics?: Json | null
          timestamp?: string
        }
        Update: {
          conversion_rate?: number | null
          crashes?: number | null
          date_from?: string | null
          date_range?: string
          date_to?: string | null
          downloads?: number | null
          growth_metrics?: Json | null
          id?: string
          impressions?: number | null
          page_views?: number | null
          proceeds?: number | null
          raw_metrics?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      keyword_analyses: {
        Row: {
          app_performance: string | null
          created_at: string | null
          file_name: string
          file_path: string
          id: string
          openai_analysis: string | null
          prioritized_keywords: Json | null
          user_id: string | null
        }
        Insert: {
          app_performance?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          id?: string
          openai_analysis?: string | null
          prioritized_keywords?: Json | null
          user_id?: string | null
        }
        Update: {
          app_performance?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          openai_analysis?: string | null
          prioritized_keywords?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_threads: {
        Row: {
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
