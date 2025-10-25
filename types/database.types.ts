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
          name: string
          created_at: string
          couple_id: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          couple_id?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          couple_id?: string | null
        }
      }
      couples: {
        Row: {
          id: string
          invitation_code: string
          created_at: string
        }
        Insert: {
          id?: string
          invitation_code: string
          created_at?: string
        }
        Update: {
          id?: string
          invitation_code?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          couple_id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          couple_id: string
          category_id: string
          title: string
          do_by_date: string | null
          status: 'incomplete' | 'complete'
          created_by: string
          created_at: string
          completed_at: string | null
          completed_by: string | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          category_id: string
          title: string
          do_by_date?: string | null
          status?: 'incomplete' | 'complete'
          created_by: string
          created_at?: string
          completed_at?: string | null
          completed_by?: string | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          category_id?: string
          title?: string
          do_by_date?: string | null
          status?: 'incomplete' | 'complete'
          created_by?: string
          created_at?: string
          completed_at?: string | null
          completed_by?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      item_photos: {
        Row: {
          id: string
          item_id: string
          photo_url: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          item_id: string
          photo_url: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          photo_url?: string
          uploaded_at?: string
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
