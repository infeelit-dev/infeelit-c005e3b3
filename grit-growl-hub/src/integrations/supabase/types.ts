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
      attendees: {
        Row: {
          building: string | null
          checked_in_at: string | null
          created_at: string
          data_consent: boolean
          email: string | null
          event_date: string | null
          event_id: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          linkedin_summary: string | null
          linkedin_url: string | null
          lounge_interests: string | null
          luma_bio: string | null
          manifesto_accepted: boolean
          match_count: number
          mode: Database["public"]["Enums"]["attendee_mode"] | null
          name: string | null
          needs: string | null
          no_push_flag: boolean
          onboarding_complete: boolean
          passion: string | null
          phone: string | null
          q1: string | null
          q2: string | null
          q3: string | null
          suggestions_shown: number
          visits: number
          whatsapp: string | null
        }
        Insert: {
          building?: string | null
          checked_in_at?: string | null
          created_at?: string
          data_consent?: boolean
          email?: string | null
          event_date?: string | null
          event_id?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_summary?: string | null
          linkedin_url?: string | null
          lounge_interests?: string | null
          luma_bio?: string | null
          manifesto_accepted?: boolean
          match_count?: number
          mode?: Database["public"]["Enums"]["attendee_mode"] | null
          name?: string | null
          needs?: string | null
          no_push_flag?: boolean
          onboarding_complete?: boolean
          passion?: string | null
          phone?: string | null
          q1?: string | null
          q2?: string | null
          q3?: string | null
          suggestions_shown?: number
          visits?: number
          whatsapp?: string | null
        }
        Update: {
          building?: string | null
          checked_in_at?: string | null
          created_at?: string
          data_consent?: boolean
          email?: string | null
          event_date?: string | null
          event_id?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_summary?: string | null
          linkedin_url?: string | null
          lounge_interests?: string | null
          luma_bio?: string | null
          manifesto_accepted?: boolean
          match_count?: number
          mode?: Database["public"]["Enums"]["attendee_mode"] | null
          name?: string | null
          needs?: string | null
          no_push_flag?: boolean
          onboarding_complete?: boolean
          passion?: string | null
          phone?: string | null
          q1?: string | null
          q2?: string | null
          q3?: string | null
          suggestions_shown?: number
          visits?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          accepted: boolean
          created_at: string
          event_date: string | null
          from_attendee_id: string | null
          id: string
          oracle_resonance: string | null
          to_attendee_id: string | null
        }
        Insert: {
          accepted?: boolean
          created_at?: string
          event_date?: string | null
          from_attendee_id?: string | null
          id?: string
          oracle_resonance?: string | null
          to_attendee_id?: string | null
        }
        Update: {
          accepted?: boolean
          created_at?: string
          event_date?: string | null
          from_attendee_id?: string | null
          id?: string
          oracle_resonance?: string | null
          to_attendee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_from_attendee_id_fkey"
            columns: ["from_attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_to_attendee_id_fkey"
            columns: ["to_attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          from_first_name: string | null
          id: string
          location: string | null
          message: string | null
          read: boolean
          to_attendee_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          from_first_name?: string | null
          id?: string
          location?: string | null
          message?: string | null
          read?: boolean
          to_attendee_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          from_first_name?: string | null
          id?: string
          location?: string | null
          message?: string | null
          read?: boolean
          to_attendee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_to_attendee_id_fkey"
            columns: ["to_attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
        ]
      }
      pulses: {
        Row: {
          confidence: number
          created_at: string
          event_date: string
          id: string
          newcomer_id: string
          read: boolean
          recipient_id: string
          resonance: string | null
          why_now: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          event_date: string
          id?: string
          newcomer_id: string
          read?: boolean
          recipient_id: string
          resonance?: string | null
          why_now?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          event_date?: string
          id?: string
          newcomer_id?: string
          read?: boolean
          recipient_id?: string
          resonance?: string | null
          why_now?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pulses_newcomer_id_fkey"
            columns: ["newcomer_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulses_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attendee_mode: "lounge" | "builder"
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
    Enums: {
      attendee_mode: ["lounge", "builder"],
    },
  },
} as const