import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

let supabaseClient: SupabaseClient | null = null;

function createSupabaseBrowserClient(): SupabaseClient {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(supabaseUrl, supabaseAnonKey);
}

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient();
  }

  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabaseClient();
    const value = client[property as keyof SupabaseClient];

    return typeof value === "function" ? value.bind(client) : value;
  },
});
