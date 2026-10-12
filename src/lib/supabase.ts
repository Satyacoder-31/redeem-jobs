import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://lyxqlmmzjzkcjzcnbusp.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_NrkpgMB9uKvSycCClY3ayQ_7N0UOGgI";

let browserClient: SupabaseClient | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl.includes("supabase.co");

export const supabaseConfig = {
  url: supabaseUrl,
  publishableKey: supabaseAnonKey,
  jwksUrl: process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
};

// Storage upload helper
export async function uploadFile(
  bucket: "avatars" | "resumes" | "company-assets" | "job-assets",
  path: string,
  file: File
) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path: data.path, url: publicUrlData.publicUrl };
}
