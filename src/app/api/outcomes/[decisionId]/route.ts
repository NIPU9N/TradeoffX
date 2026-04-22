import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ decisionId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { decisionId } = await params;

  const { data, error } = await supabase
    .from("outcomes")
    .select("*")
    .eq("decision_id", decisionId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Outcome not found" }, { status: 404 });
  }

  return NextResponse.json({ outcome: data });
}
