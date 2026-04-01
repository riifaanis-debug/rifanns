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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          age: string | null
          bank: string | null
          city: string | null
          created_at: string
          documents: Json | null
          email: string | null
          file_number: string | null
          first_name: string | null
          full_name: string | null
          id: string
          job_status: string | null
          last_name: string | null
          middle_name: string | null
          national_id: string | null
          password_hash: string | null
          phone: string | null
          phone_verified: boolean | null
          products: Json | null
          region: string | null
          role: string
          salary: number | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          age?: string | null
          bank?: string | null
          city?: string | null
          created_at?: string
          documents?: Json | null
          email?: string | null
          file_number?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          job_status?: string | null
          last_name?: string | null
          middle_name?: string | null
          national_id?: string | null
          password_hash?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          products?: Json | null
          region?: string | null
          role?: string
          salary?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          age?: string | null
          bank?: string | null
          city?: string | null
          created_at?: string
          documents?: Json | null
          email?: string | null
          file_number?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          job_status?: string | null
          last_name?: string | null
          middle_name?: string | null
          national_id?: string | null
          password_hash?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          products?: Json | null
          region?: string | null
          role?: string
          salary?: number | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          created_at: string
          id: string
          signature_data: string | null
          signed_at: string | null
          submission_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          signature_data?: string | null
          signed_at?: string | null
          submission_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          signature_data?: string | null
          signed_at?: string | null
          submission_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          submission_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          is_read?: boolean
          message: string
          submission_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          submission_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otp_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      request_history: {
        Row: {
          changed_by: string | null
          comment: string | null
          created_at: string
          id: string
          request_id: string
          status: string
        }
        Insert: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id: string
          request_id: string
          status: string
        }
        Update: {
          changed_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          data: Json | null
          details: string | null
          files: Json | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          details?: string | null
          files?: Json | null
          id: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          details?: string | null
          files?: Json | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      app_users_safe: {
        Row: {
          age: string | null
          bank: string | null
          city: string | null
          created_at: string | null
          documents: Json | null
          email: string | null
          file_number: string | null
          first_name: string | null
          full_name: string | null
          id: string | null
          job_status: string | null
          last_name: string | null
          middle_name: string | null
          national_id: string | null
          phone: string | null
          products: Json | null
          region: string | null
          role: string | null
          salary: number | null
          service_type: string | null
          updated_at: string | null
        }
        Insert: {
          age?: string | null
          bank?: string | null
          city?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          file_number?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          job_status?: string | null
          last_name?: string | null
          middle_name?: string | null
          national_id?: string | null
          phone?: string | null
          products?: Json | null
          region?: string | null
          role?: string | null
          salary?: number | null
          service_type?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: string | null
          bank?: string | null
          city?: string | null
          created_at?: string | null
          documents?: Json | null
          email?: string | null
          file_number?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          job_status?: string | null
          last_name?: string | null
          middle_name?: string | null
          national_id?: string | null
          phone?: string | null
          products?: Json | null
          region?: string | null
          role?: string | null
          salary?: number | null
          service_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      verify_password: {
        Args: { input_password: string; stored_hash: string }
        Returns: boolean
      }
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
