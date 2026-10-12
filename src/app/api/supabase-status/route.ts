import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !anon) {
    return NextResponse.json({ configured: false, error: "Missing env vars" }, { status: 200 });
  }

  const anonClient = createSupabaseClient(url, anon);
  const svcClient = secret ? createSupabaseClient(url, secret) : null;

  const checks: Record<string, string> = {};

  // Test anon
  const { error: anonErr } = await anonClient.from("profiles").select("id").limit(1);
  checks.anon_profiles = anonErr ? anonErr.message : "ok (table exists)";

  if (svcClient) {
    const { error: svcErr } = await svcClient.from("profiles").select("id").limit(1);
    checks.service_profiles = svcErr ? svcErr.message : "ok";
    const { error: jobsErr } = await svcClient.from("jobs").select("id").limit(1);
    checks.jobs = jobsErr ? jobsErr.message : "ok";
    const { error: compErr } = await svcClient.from("companies").select("id").limit(1);
    checks.companies = compErr ? compErr.message : "ok";
  }

  // Auth JWKS check
  let jwks = "unknown";
  try {
    const r = await fetch(`${url}/auth/v1/.well-known/jwks.json`);
    jwks = r.ok ? "ok" : `http ${r.status}`;
  } catch (e) {
    jwks = e instanceof Error ? e.message : "fetch failed";
  }

  return NextResponse.json({
    configured: true,
    url,
    anon_key_prefix: anon.substring(0, 15) + "...",
    has_secret: !!secret,
    jwks,
    checks,
    next_step: checks.anon_profiles?.includes("Could not find the table") ? "Run supabase/schema.sql in Supabase SQL Editor" : "Supabase ready",
  });
}
