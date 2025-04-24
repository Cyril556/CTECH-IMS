
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
      users: {
        Row: {
          id: string
          email: string
          password: string
          full_name: string | null
          role: string
          status: string
          password_reset_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          full_name?: string | null
          role?: string
          status?: string
          password_reset_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          full_name?: string | null
          role?: string
          status?: string
          password_reset_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          event_type: string
          user_id: string | null
          target_user_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          user_id?: string | null
          target_user_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          user_id?: string | null
          target_user_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          sku: string
          category_id: string | null
          stock: number
          price: number
          supplier_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku: string
          category_id?: string | null
          stock?: number
          price: number
          supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string
          category_id?: string | null
          stock?: number
          price?: number
          supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string
          email: string
          phone: string
          address: string
          status: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person: string
          email: string
          phone: string
          address: string
          status: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string
          email?: string
          phone?: string
          address?: string
          status?: string
          rating?: number | null
          created_at?: string
        }
      }
      supplier_products: {
        Row: {
          id: string
          supplier_id: string
          product_name: string
          description: string | null
          price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          product_name: string
          description?: string | null
          price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          product_name?: string
          description?: string | null
          price?: number | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          supplier_id: string
          status: string
          items_count: number
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          supplier_id: string
          status?: string
          items_count?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          supplier_id?: string
          status?: string
          items_count?: number
          total_amount?: number
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
