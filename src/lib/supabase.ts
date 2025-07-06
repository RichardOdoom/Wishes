import { createClient } from '@supabase/supabase-js';

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
      wishes: {
        Row: {
          id: string
          created_at: string
          name: string
          message: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          message: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          message?: string
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


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log("Supabase initialized successfully.");
  } catch (e) {
    console.error("Failed to initialize Supabase. App will not connect to the database.", e);
  }
} else {
  console.warn("Supabase configuration is incomplete. App will not connect to the database.");
}

export { supabase };
