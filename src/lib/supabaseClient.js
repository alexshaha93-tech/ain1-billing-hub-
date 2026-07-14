import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — ready to connect.
 *
 * 1. Copy .env.example to .env
 * 2. Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
 * 3. Run the SQL in supabase/schema.sql inside the Supabase SQL editor to create all tables
 *
 * Until you do this, `isSupabaseConfigured` stays false and the app runs
 * entirely on local state + localStorage, so there are zero crashes either way.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes("your-project-ref") && !anonKey.includes("your-anon-public-key")
);

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;
