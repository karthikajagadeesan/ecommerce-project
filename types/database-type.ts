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
          phone_number: string | null
          status: string | null
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: number
          auth_user_id: string
          name?: string | null
          email?: string | null
          phone_number?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: number
          auth_user_id?: string
          name?: string | null
          email?: string | null
          phone_number?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
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
          site_access: number
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
          site_access?: number
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
          site_access?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_membership: {
        Row: {
          id: number
          user_id: number
          membership_id: number | null
          plan_name: string | null
          price: number | null
          validity_days: number | null
          start_date: string | null
          end_date: string | null
          status: string | null
          membership_json: Json | null
          plan_limit: number
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          membership_id?: number | null
          plan_name?: string | null
          price?: number | null
          validity_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string | null
          membership_json?: Json | null
          plan_limit?: number
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          membership_id?: number | null
          plan_name?: string | null
          price?: number | null
          validity_days?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string | null
          membership_json?: Json | null
          plan_limit?: number
          name?: string | null
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
          name: string | null
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
          name?: string | null
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
          name?: string | null
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
      payments: {
        Row: {
          id: number
          user_id: number | null
          domain_url: string | null
          plan_name: string | null
          price: number | null
          amount: number | null
          validity_days: number | null
          payment_status: 'pending' | 'completed' | 'failed'
          name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          domain_url?: string | null
          plan_name?: string | null
          price?: number | null
          amount?: number | null
          validity_days?: number | null
          payment_status?: 'pending' | 'completed' | 'failed'
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          domain_url?: string | null
          plan_name?: string | null
          price?: number | null
          amount?: number | null
          validity_days?: number | null
          payment_status?: 'pending' | 'completed' | 'failed'
          name?: string | null
          created_at?: string
        }
      }
      website_access: {
        Row: {
          id: number
          user_id: number | null
          plan_name: string
          domain_url: string
          site_name: string | null
          name: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          plan_name: string
          domain_url: string
          site_name?: string | null
          name?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          plan_name?: string
          domain_url?: string
          site_name?: string | null
          name?: string | null
          status?: string | null
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
