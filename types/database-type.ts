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
          profile_id: number
          premium_template: boolean
          basic_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          profile_id: number
          premium_template?: boolean
          basic_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          profile_id?: number
          premium_template?: boolean
          basic_template?: boolean
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
          domain: string | null
          user_id: number | null
          plan: 'basic' | 'pro' | 'enterprise' | null
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
          domain?: string | null
          user_id?: number | null
          plan?: 'basic' | 'pro' | 'enterprise' | null
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
          domain?: string | null
          user_id?: number | null
          plan?: 'basic' | 'pro' | 'enterprise' | null
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
