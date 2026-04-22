import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/patterns — get saved patterns for user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("patterns")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ patterns: data });
}
