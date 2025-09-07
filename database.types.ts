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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          created_at: string
          description: Json | null
          display_order: number
          event_id: string
          fee: number
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: Json | null
          display_order: number
          event_id: string
          fee?: number
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: Json | null
          display_order?: number
          event_id?: string
          fee?: number
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions_participants: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          participant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          participant_id: string
          status: string
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          participant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: Json | null
          end_date: string | null
          event_date: string | null
          event_mode: string
          event_type: string | null
          id: string
          is_published: boolean
          poster_url: string | null
          registration_deadline: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: Json | null
          end_date?: string | null
          event_date?: string | null
          event_mode: string
          event_type?: string | null
          id?: string
          is_published?: boolean
          poster_url?: string | null
          registration_deadline?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: Json | null
          end_date?: string | null
          event_date?: string | null
          event_mode?: string
          event_type?: string | null
          id?: string
          is_published?: boolean
          poster_url?: string | null
          registration_deadline?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      magazines: {
        Row: {
          access_level: string | null
          chief_patron: string | null
          cover_image: string | null
          created_at: string | null
          created_by: string | null
          doi: string | null
          download_count: number | null
          id: string
          is_archived: boolean | null
          is_published: number | null
          issue: number | null
          language: string | null
          pdf_url: string | null
          published_date: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          access_level?: string | null
          chief_patron?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          doi?: string | null
          download_count?: number | null
          id?: string
          is_archived?: boolean | null
          is_published?: number | null
          issue?: number | null
          language?: string | null
          pdf_url?: string | null
          published_date?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          access_level?: string | null
          chief_patron?: string | null
          cover_image?: string | null
          created_at?: string | null
          created_by?: string | null
          doi?: string | null
          download_count?: number | null
          id?: string
          is_archived?: boolean | null
          is_published?: number | null
          issue?: number | null
          language?: string | null
          pdf_url?: string | null
          published_date?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "magazines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          bio: string | null
          created_at: string
          designation: string
          email: string | null
          facebook_id_link: string | null
          id: string
          image_url: string | null
          instagram_id_link: string | null
          linkedin_id_link: string | null
          name: string
          phone: string | null
          position: string | null
          session: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          designation: string
          email?: string | null
          facebook_id_link?: string | null
          id?: string
          image_url?: string | null
          instagram_id_link?: string | null
          linkedin_id_link?: string | null
          name: string
          phone?: string | null
          position?: string | null
          session?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          designation?: string
          email?: string | null
          facebook_id_link?: string | null
          id?: string
          image_url?: string | null
          instagram_id_link?: string | null
          linkedin_id_link?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          session?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          class: number
          created_at: string
          email: string | null
          id: string
          id_at_institution: string
          institution: string
          name: string
          note: string
          payment_provider: string | null
          phone: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          class: number
          created_at?: string
          email?: string | null
          id?: string
          id_at_institution: string
          institution: string
          name: string
          note?: string
          payment_provider?: string | null
          phone?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          class?: number
          created_at?: string
          email?: string | null
          id?: string
          id_at_institution?: string
          institution?: string
          name?: string
          note?: string
          payment_provider?: string | null
          phone?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_archived: boolean
          is_featured: boolean
          levels: string[] | null
          resource_type: string
          resource_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_featured?: boolean
          levels?: string[] | null
          resource_type: string
          resource_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_archived?: boolean
          is_featured?: boolean
          levels?: string[] | null
          resource_type?: string
          resource_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          executive_position: string | null
          id: string
          name: string
          profile_image: string | null
          role: string | null
          ssc_batch: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          executive_position?: string | null
          id?: string
          name: string
          profile_image?: string | null
          role?: string | null
          ssc_batch: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          executive_position?: string | null
          id?: string
          name?: string
          profile_image?: string | null
          role?: string | null
          ssc_batch?: string
          status?: string | null
          updated_at?: string | null
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
