export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number
          auth_user_id: string
          name: string | null
          email: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          auth_user_id: string
          name?: string | null
          email?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          auth_user_id?: string
          name?: string | null
          email?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      membership: {
        Row: {
          id: number
          org_id: number | null
          plan_name: string
          description: string | null
          price: number | null
          validity_days: number | null
          features: Json | null
          is_active: boolean
          plan_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          org_id?: number | null
          plan_name: string
          description?: string | null
          price?: number | null
          validity_days?: number | null
          features?: Json | null
          is_active?: boolean
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          org_id?: number | null
          plan_name?: string
          description?: string | null
          price?: number | null
          validity_days?: number | null
          features?: Json | null
          is_active?: boolean
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_membership: {
        Row: {
          id: number
          profile_id: number
          membership_id: number | null
          plan_name: string | null
          price: number | null
          validity_days: number | null
          start_date: string | null
          end_date: string | null
          status: string | null
          membership_json: Json | null
          plan_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          profile_id: number
          membership_id?: number | null
          plan_name?: string | null
          price?: number | null
          validity_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string | null
          membership_json?: Json | null
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          profile_id?: number
          membership_id?: number | null
          plan_name?: string | null
          price?: number | null
          validity_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string | null
          membership_json?: Json | null
          plan_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      licenses: {
        Row: {
          id: number
          uuid: string
          license_key: string
          status: 'active' | 'inactive' | 'expired'
          version: string | null
          validity_period: number | null
          created_at: string
          payment_status: 'pending' | 'completed' | 'failed'
          domain_url: string | null
          user_id: number | null
          plan: string | null
          displayed_once: boolean
        }
        Insert: {
          id?: number
          uuid?: string
          license_key: string
          status?: 'active' | 'inactive' | 'expired'
          version?: string | null
          validity_period?: number | null
          created_at?: string
          payment_status?: 'pending' | 'completed' | 'failed'
          domain_url?: string | null
          user_id?: number | null
          plan?: string | null
          displayed_once?: boolean
        }
        Update: {
          id?: number
          uuid?: string
          license_key?: string
          status?: 'active' | 'inactive' | 'expired'
          version?: string | null
          validity_period?: number | null
          created_at?: string
          payment_status?: 'pending' | 'completed' | 'failed'
          domain_url?: string | null
          user_id?: number | null
          plan?: string | null
          displayed_once?: boolean
        }
      }
      api_usage: {
        Row: {
          id: number
          user_id: number | null
          endpoint: string
          called_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          endpoint: string
          called_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          endpoint: string
          called_at?: string
        }
      }
      layouts: {
        Row: {
          id: number
          layout_name: string
          layout_type: string
          created_at: string
        }
        Insert: {
          id?: number
          layout_name: string
          layout_type: string
          created_at?: string
        }
        Update: {
          id?: number
          layout_name?: string
          layout_type?: string
          created_at?: string
        }
      }
      layout_submissions: {
        Row: {
          id: number
          layout_id: string
          image_metadata: Json
          appearance: Json | null
          videos: Json | null
          license_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          layout_id: string
          image_metadata?: Json
          appearance?: Json | null
          videos?: Json | null
          license_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          layout_id?: string
          image_metadata?: Json
          appearance?: Json | null
          videos?: Json | null
          license_key?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
