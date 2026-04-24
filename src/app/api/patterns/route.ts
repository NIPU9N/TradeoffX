import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/patterns — get saved patterns for user
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  let query = supabase
    .from("patterns")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false });

  if (mode) {
    query = query.eq("mode", mode);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patterns: data });
}
