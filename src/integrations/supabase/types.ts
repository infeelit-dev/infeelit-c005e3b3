export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      circle_members: {
        Row: {
          circle_id: string;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
        ];
      };
      circles: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          invite_code: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          invite_code: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          invite_code?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          aura_intensity: number | null;
          background_image_url: string | null;
          created_at: string;
          description: string | null;
          file_type: string | null;
          file_url: string | null;
          id: string;
          is_anonymous: boolean;
          is_community: boolean;
          is_public: boolean;
          moderation_status: string | null; // ✅ AJOUTÉ
          spark_reward: number | null;
          sparks_count: number;
          thumbnail_url: string | null;
          timeline: string;
          title: string | null;
          transcript: string | null;
          transcript_fr: string | null;
          transcript_en: string | null;
          transcript_ar: string | null;
          detected_lang: string | null;
          translation_status: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          aura_intensity?: number | null;
          background_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          is_anonymous?: boolean;
          is_community?: boolean;
          is_public?: boolean;
          moderation_status?: string | null; // ✅ AJOUTÉ
          spark_reward?: number | null;
          sparks_count?: number;
          thumbnail_url?: string | null;
          timeline?: string;
          title?: string | null;
          transcript?: string | null;
          transcript_fr?: string | null;
          transcript_en?: string | null;
          transcript_ar?: string | null;
          detected_lang?: string | null;
          translation_status?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          aura_intensity?: number | null;
          background_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          file_type?: string | null;
          file_url?: string | null;
          id?: string;
          is_anonymous?: boolean;
          is_community?: boolean;
          is_public?: boolean;
          moderation_status?: string | null; // ✅ AJOUTÉ
          spark_reward?: number | null;
          sparks_count?: number;
          thumbnail_url?: string | null;
          timeline?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      memory_bookmarks: {
        Row: {
          created_at: string;
          id: string;
          memory_id: string;
          user_id: string;
          user_name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          memory_id: string;
          user_id?: string;
          user_name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          memory_id?: string;
          user_id?: string;
          user_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_bookmarks_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_reports: {
        // ✅ NOUVELLE TABLE
        Row: {
          id: string;
          memory_id: string;
          reporter_name: string | null;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          reporter_name?: string | null;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          reporter_name?: string | null;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_reports_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      memory_sparks: {
        Row: {
          created_at: string;
          id: string;
          memory_id: string;
          user_id: string;
          user_name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          memory_id: string;
          user_id?: string;
          user_name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          memory_id?: string;
          user_id?: string;
          user_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_sparks_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          circle_id: string;
          created_at: string;
          from_user_id: string;
          id: string;
          memory_id: string | null;
          message: string;
          read: boolean;
        };
        Insert: {
          circle_id: string;
          created_at?: string;
          from_user_id: string;
          id?: string;
          memory_id?: string | null;
          message: string;
          read?: boolean;
        };
        Update: {
          circle_id?: string;
          created_at?: string;
          from_user_id?: string;
          id?: string;
          memory_id?: string | null;
          message?: string;
          read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          audience: string | null;
          created_at: string;
          display_name: string | null;
          generation: string | null;
          has_children: boolean | null;
          id: string;
          onboarding_completed: boolean;
          phone: string | null;
          spark: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          audience?: string | null;
          created_at?: string;
          display_name?: string | null;
          generation?: string | null;
          has_children?: boolean | null;
          id?: string;
          onboarding_completed?: boolean;
          phone?: string | null;
          spark?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          audience?: string | null;
          created_at?: string;
          display_name?: string | null;
          generation?: string | null;
          has_children?: boolean | null;
          id?: string;
          onboarding_completed?: boolean;
          phone?: string | null;
          spark?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_circle_invite_code: { Args: { _circle_id: string }; Returns: string };
      get_circle_member_profiles: {
        Args: { _circle_id: string };
        Returns: {
          display_name: string;
          user_id: string;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_circle_admin: {
        Args: { _circle_id: string; _user_id: string };
        Returns: boolean;
      };
      is_circle_member: {
        Args: { _circle_id: string; _user_id: string };
        Returns: boolean;
      };
      lookup_circle_by_invite_code: {
        Args: { _code: string };
        Returns: {
          id: string;
          member_count: number;
          name: string;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const;
