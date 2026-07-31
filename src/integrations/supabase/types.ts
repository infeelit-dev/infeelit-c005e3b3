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
      circle_members: {
        Row: {
          circle_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          circle_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          circle_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          allow_anonymous_share: boolean | null
          aura_intensity: number | null
          background_image_url: string | null
          created_at: string | null
          deliver_at: string | null
          description: string | null
          file_type: string | null
          file_url: string
          followups_ar: string[] | null
          followups_en: string[] | null
          followups_fr: string[] | null
          id: string
          is_anonymous: boolean | null
          is_community: boolean | null
          is_public: boolean | null
          latitude: number | null
          like_count: number | null
          location_name: string | null
          location_visibility: string | null
          longitude: number | null
          moderation_status: string | null
          question_ar: string | null
          question_bubble_ar: string | null
          question_bubble_en: string | null
          question_bubble_fr: string | null
          question_en: string | null
          question_fr: string | null
          save_count: number | null
          share_count: number | null
          spark_reward: number | null
          sparks_count: number | null
          thumbnail_url: string | null
          timeline: string | null
          title: string | null
          upload_type: string | null
          user_id: string
          user_name: string | null
          view_count: number | null
        }
        Insert: {
          allow_anonymous_share?: boolean | null
          aura_intensity?: number | null
          background_image_url?: string | null
          created_at?: string | null
          deliver_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url: string
          followups_ar?: string[] | null
          followups_en?: string[] | null
          followups_fr?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          is_community?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          like_count?: number | null
          location_name?: string | null
          location_visibility?: string | null
          longitude?: number | null
          moderation_status?: string | null
          question_ar?: string | null
          question_bubble_ar?: string | null
          question_bubble_en?: string | null
          question_bubble_fr?: string | null
          question_en?: string | null
          question_fr?: string | null
          save_count?: number | null
          share_count?: number | null
          spark_reward?: number | null
          sparks_count?: number | null
          thumbnail_url?: string | null
          timeline?: string | null
          title?: string | null
          upload_type?: string | null
          user_id: string
          user_name?: string | null
          view_count?: number | null
        }
        Update: {
          allow_anonymous_share?: boolean | null
          aura_intensity?: number | null
          background_image_url?: string | null
          created_at?: string | null
          deliver_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string
          followups_ar?: string[] | null
          followups_en?: string[] | null
          followups_fr?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          is_community?: boolean | null
          is_public?: boolean | null
          latitude?: number | null
          like_count?: number | null
          location_name?: string | null
          location_visibility?: string | null
          longitude?: number | null
          moderation_status?: string | null
          question_ar?: string | null
          question_bubble_ar?: string | null
          question_bubble_en?: string | null
          question_bubble_fr?: string | null
          question_en?: string | null
          question_fr?: string | null
          save_count?: number | null
          share_count?: number | null
          spark_reward?: number | null
          sparks_count?: number | null
          thumbnail_url?: string | null
          timeline?: string | null
          title?: string | null
          upload_type?: string | null
          user_id?: string
          user_name?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      memory_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_bookmarks_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_reports: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string | null
          reason: string
          reporter_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          reason: string
          reporter_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          reason?: string
          reporter_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_reports_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_sparks: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_sparks_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          audience: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          generation: string | null
          id: string
          onboarding_completed: boolean | null
          spark: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audience?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          generation?: string | null
          id?: string
          onboarding_completed?: boolean | null
          spark?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audience?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          generation?: string | null
          id?: string
          onboarding_completed?: boolean | null
          spark?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      circles_safe: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_likes: {
        Args: { increment: number; memory_id: string }
        Returns: undefined
      }
      increment_saves: {
        Args: { increment: number; memory_id: string }
        Returns: undefined
      }
      increment_shares: { Args: { memory_id: string }; Returns: undefined }
      lookup_circle_by_invite_code: { Args: { _code: string }; Returns: string }
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
