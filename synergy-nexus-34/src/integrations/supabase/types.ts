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
      activities: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      file_attachments: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          project_id: string | null
          task_id: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          project_id?: string | null
          task_id?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          project_id?: string | null
          task_id?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          invited_at: string | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_at?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
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
