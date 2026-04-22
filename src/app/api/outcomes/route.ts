import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createOutcomeSchema } from "@/types";

// POST /api/outcomes — create an outcome review
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createOutcomeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Fetch the original decision for quality scoring
  const { data: decision } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", parsed.data.decision_id)
    .eq("user_id", user.id)
    .single();

  if (!decision) {
    return NextResponse.json({ error: "Decision not found" }, { status: 404 });
  }

  // Calculate quality scores
  const thesisClarityScore = Math.min(10, Math.max(1,
    Math.floor(decision.thesis.length / 20) + (decision.what_would_make_me_wrong.length > 20 ? 2 : 0)
  ));

  const riskManagementScore = (() => {
    let score = 3;
    if (decision.stop_loss) score += 3;
    if (decision.target_price) score += 2;
    if (decision.risk_reward_ratio && decision.risk_reward_ratio >= 2) score += 2;
    return Math.min(10, score);
  })();

  const emotionalControlScore = (() => {
    if (parsed.data.exit_emotion === "planned") return 10;
    if (parsed.data.exit_emotion === "new_information") return 8;
    if (parsed.data.exit_emotion === "boredom") return 5;
    if (parsed.data.exit_emotion === "greed") return 3;
    if (parsed.data.exit_emotion === "panic") return 1;
    return 5;
  })();

  const processScore = (() => {
    let score = 3;
    if (decision.checklist_completed) score += 3;
    if (decision.confidence_level >= 7) score += 2;
    if (decision.decision_type === "logic") score += 2;
    else if (decision.decision_type === "mixed") score += 1;
    return Math.min(10, score);
  })();

  const overallQualityScore = parseFloat(
    ((thesisClarityScore + riskManagementScore + emotionalControlScore + processScore) / 4).toFixed(1)
  );

  // Insert outcome
  const { data: outcome, error } = await supabase
    .from("outcomes")
    .insert({
      ...parsed.data,
      user_id: user.id,
      thesis_clarity_score: thesisClarityScore,
      risk_management_score: riskManagementScore,
      emotional_control_score: emotionalControlScore,
      process_score: processScore,
      overall_quality_score: overallQualityScore,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update decision status to reviewed
  await supabase
    .from("decisions")
    .update({ status: "reviewed", updated_at: new Date().toISOString() })
    .eq("id", parsed.data.decision_id)
    .eq("user_id", user.id);

  return NextResponse.json({ outcome }, { status: 201 });
}
