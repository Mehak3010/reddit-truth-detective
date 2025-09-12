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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          analysis_parameters: Json | null
          bots_detected: number | null
          completed_at: string | null
          created_at: string
          id: string
          session_name: string
          started_at: string
          status: string | null
          subreddit: string | null
          total_accounts_analyzed: number | null
        }
        Insert: {
          analysis_parameters?: Json | null
          bots_detected?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          session_name: string
          started_at?: string
          status?: string | null
          subreddit?: string | null
          total_accounts_analyzed?: number | null
        }
        Update: {
          analysis_parameters?: Json | null
          bots_detected?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          session_name?: string
          started_at?: string
          status?: string | null
          subreddit?: string | null
          total_accounts_analyzed?: number | null
        }
        Relationships: []
      }
      bot_detection_results: {
        Row: {
          analysis_timestamp: string
          bot_probability: number
          confidence_score: number
          created_at: string
          detection_method: string
          features_analyzed: Json | null
          id: string
          risk_factors: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          analysis_timestamp?: string
          bot_probability: number
          confidence_score: number
          created_at?: string
          detection_method: string
          features_analyzed?: Json | null
          id?: string
          risk_factors?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          analysis_timestamp?: string
          bot_probability?: number
          confidence_score?: number
          created_at?: string
          detection_method?: string
          features_analyzed?: Json | null
          id?: string
          risk_factors?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reddit_accounts: {
        Row: {
          account_age_days: number | null
          account_created_utc: number | null
          comment_karma: number | null
          created_at: string
          has_verified_email: boolean | null
          id: string
          is_premium: boolean | null
          is_verified: boolean | null
          link_karma: number | null
          subreddit_activity: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          account_age_days?: number | null
          account_created_utc?: number | null
          comment_karma?: number | null
          created_at?: string
          has_verified_email?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          link_karma?: number | null
          subreddit_activity?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          account_age_days?: number | null
          account_created_utc?: number | null
          comment_karma?: number | null
          created_at?: string
          has_verified_email?: boolean | null
          id?: string
          is_premium?: boolean | null
          is_verified?: boolean | null
          link_karma?: number | null
          subreddit_activity?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      reddit_comments: {
        Row: {
          author_username: string | null
          body: string | null
          created_at: string
          created_utc: number | null
          id: string
          is_submitter: boolean | null
          parent_id: string | null
          post_id: string | null
          reddit_id: string
          score: number | null
          subreddit: string | null
        }
        Insert: {
          author_username?: string | null
          body?: string | null
          created_at?: string
          created_utc?: number | null
          id?: string
          is_submitter?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          reddit_id: string
          score?: number | null
          subreddit?: string | null
        }
        Update: {
          author_username?: string | null
          body?: string | null
          created_at?: string
          created_utc?: number | null
          id?: string
          is_submitter?: boolean | null
          parent_id?: string | null
          post_id?: string | null
          reddit_id?: string
          score?: number | null
          subreddit?: string | null
        }
        Relationships: []
      }
      reddit_posts: {
        Row: {
          author_username: string | null
          content: string | null
          created_at: string
          created_utc: number | null
          domain: string | null
          id: string
          is_self: boolean | null
          num_comments: number | null
          reddit_id: string
          score: number | null
          subreddit: string | null
          title: string | null
          upvote_ratio: number | null
          url: string | null
        }
        Insert: {
          author_username?: string | null
          content?: string | null
          created_at?: string
          created_utc?: number | null
          domain?: string | null
          id?: string
          is_self?: boolean | null
          num_comments?: number | null
          reddit_id: string
          score?: number | null
          subreddit?: string | null
          title?: string | null
          upvote_ratio?: number | null
          url?: string | null
        }
        Update: {
          author_username?: string | null
          content?: string | null
          created_at?: string
          created_utc?: number | null
          domain?: string | null
          id?: string
          is_self?: boolean | null
          num_comments?: number | null
          reddit_id?: string
          score?: number | null
          subreddit?: string | null
          title?: string | null
          upvote_ratio?: number | null
          url?: string | null
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
