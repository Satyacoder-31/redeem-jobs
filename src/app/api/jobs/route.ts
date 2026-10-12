import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const loc = searchParams.get("loc") || "";
    const jobType = searchParams.get("job_type");
    const workMode = searchParams.get("work_mode");
    const limit = parseInt(searchParams.get("limit") || "20");

    const supabase = await createClient();
    let query = supabase
      .from("jobs")
      .select("*, company:companies(*)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }
    if (loc) {
      query = query.ilike("location", `%${loc}%`);
    }
    if (jobType) {
      query = query.eq("job_type", jobType);
    }
    if (workMode) {
      query = query.eq("work_mode", workMode);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
