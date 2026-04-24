import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createDecisionSchema } from "@/types";
import { calculateStreak } from "@/lib/streak";

// GET /api/decisions — list decisions with filters
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const asset_type = searchParams.get("asset_type");
  const emotion = searchParams.get("emotion");
  const mode = searchParams.get("mode");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("decisions")
    .select("*, outcome:outcomes(*)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (asset_type) query = query.eq("asset_type", asset_type);
  if (emotion) query = query.eq("emotion", emotion);
  if (mode) query = query.eq("mode", mode);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ decisions: data, total: count });
}

// POST /api/decisions — create a new decision
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDecisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Insert decision
  const { data: decision, error } = await supabase
    .from("decisions")
    .insert({ 
      ...parsed.data, 
      user_id: user.id,
      mode: parsed.data.mode || 'real'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update profile: total_decisions + streak
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_decisions, current_streak, longest_streak, last_decision_date")
    .eq("id", user.id)
    .single();

  if (profile) {
    const { newStreak, newLongest } = calculateStreak(
      profile.last_decision_date,
      profile.current_streak,
      profile.longest_streak
    );

    await supabase
      .from("profiles")
      .update({
        total_decisions: profile.total_decisions + 1,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_decision_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  // Auto-tag bias based on emotion
  const emotionBiasMap: Record<string, string> = {
    fomo: "fomo",
    greedy: "greed",
    anxious: "panic_sell",
    excited: "overconfidence",
    uncertain: "loss_aversion",
  };

  const autoBias = emotionBiasMap[parsed.data.emotion];
  if (autoBias) {
    await supabase.from("bias_tags").insert({
      decision_id: decision.id,
      user_id: user.id,
      bias_type: autoBias,
    });
  }

  return NextResponse.json({ decision }, { status: 201 });
}
