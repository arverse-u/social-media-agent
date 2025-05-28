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
      ai_optimization_history: {
        Row: {
          ai_reasoning: string | null
          content_id: string | null
          created_at: string
          id: string
          optimization_type: string
          optimized_data: Json | null
          original_data: Json | null
          performance_metrics: Json | null
          success_score: number | null
        }
        Insert: {
          ai_reasoning?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          optimization_type: string
          optimized_data?: Json | null
          original_data?: Json | null
          performance_metrics?: Json | null
          success_score?: number | null
        }
        Update: {
          ai_reasoning?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          optimization_type?: string
          optimized_data?: Json | null
          original_data?: Json | null
          performance_metrics?: Json | null
          success_score?: number | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          id: string
          is_active: boolean | null
          last_executed: string | null
          rule_name: string
          rule_type: string
          success_rate: number | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          rule_name: string
          rule_type: string
          success_rate?: number | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_executed?: string | null
          rule_name?: string
          rule_type?: string
          success_rate?: number | null
        }
        Relationships: []
      }
      content_sources: {
        Row: {
          api_endpoint: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_fetched_at: string | null
          platform: string
          source_url: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          platform: string
          source_url: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_fetched_at?: string | null
          platform?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          click_through_rate: number | null
          collected_at: string
          comments: number | null
          content_id: string | null
          date_posted: string | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          likes: number | null
          platform: string
          post_id: string | null
          post_url: string | null
          reach: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          click_through_rate?: number | null
          collected_at?: string
          comments?: number | null
          content_id?: string | null
          date_posted?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform: string
          post_id?: string | null
          post_url?: string | null
          reach?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          click_through_rate?: number | null
          collected_at?: string
          comments?: number | null
          content_id?: string | null
          date_posted?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          platform?: string
          post_id?: string | null
          post_url?: string | null
          reach?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: []
      }
      processed_content: {
        Row: {
          ai_insights: Json | null
          created_at: string
          engagement_prediction: number | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          optimized_content: string
          optimized_description: string | null
          optimized_title: string
          raw_content_id: string | null
          scheduled_for: string | null
          seo_score: number | null
          status: string | null
          target_platform: string
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string
          engagement_prediction?: number | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          optimized_content: string
          optimized_description?: string | null
          optimized_title: string
          raw_content_id?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          status?: string | null
          target_platform: string
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string
          engagement_prediction?: number | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          optimized_content?: string
          optimized_description?: string | null
          optimized_title?: string
          raw_content_id?: string | null
          scheduled_for?: string | null
          seo_score?: number | null
          status?: string | null
          target_platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_content_raw_content_id_fkey"
            columns: ["raw_content_id"]
            isOneToOne: false
            referencedRelation: "raw_content"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          processed: boolean | null
          raw_data: Json | null
          source_platform: string
          source_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          processed?: boolean | null
          raw_data?: Json | null
          source_platform: string
          source_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          processed?: boolean | null
          raw_data?: Json | null
          source_platform?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          result: Json | null
          scheduled_for: string
          status: string | null
          task_data: Json | null
          task_type: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          result?: Json | null
          scheduled_for: string
          status?: string | null
          task_data?: Json | null
          task_type: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          result?: Json | null
          scheduled_for?: string
          status?: string | null
          task_data?: Json | null
          task_type?: string
        }
        Relationships: []
      }
      video_content: {
        Row: {
          content_description: string
          created_at: string
          dropbox_path: string | null
          filename: string
          id: string
          processed: boolean | null
          target_platforms: string[] | null
          video_type: string
        }
        Insert: {
          content_description: string
          created_at?: string
          dropbox_path?: string | null
          filename: string
          id?: string
          processed?: boolean | null
          target_platforms?: string[] | null
          video_type: string
        }
        Update: {
          content_description?: string
          created_at?: string
          dropbox_path?: string | null
          filename?: string
          id?: string
          processed?: boolean | null
          target_platforms?: string[] | null
          video_type?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
