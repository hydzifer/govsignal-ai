import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";

let supabaseServerClient: SupabaseClient | null = null;

function createSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseServerClient) {
    supabaseServerClient = createSupabaseServerClient();
  }

  return supabaseServerClient;
}

export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabaseServerClient();
    const value = client[property as keyof SupabaseClient];

    return typeof value === "function" ? value.bind(client) : value;
  },
});
