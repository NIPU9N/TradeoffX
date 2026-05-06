import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  saveStrategy,
  getUserStrategies,
  deleteStrategy,
  updateStrategy,
  getStrategy,
} from "@/lib/strategyDatabase";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * POST /api/strategies - Save a new strategy
 */
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = await saveStrategy(user.id, {
      name: body.name,
      description: body.description,
      underlying_symbol: body.underlying_symbol,
      strategy_type: body.strategy_type,
      entry_spot: body.entry_spot,
      max_profit: body.max_profit,
      max_loss: body.max_loss,
      breakevens: body.breakevens,
      greeks: body.greeks,
      positions: body.positions,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.id, success: true });
  } catch (error) {
    console.error("Error in POST /api/strategies:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * GET /api/strategies - Get all strategies for user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const strategies = await getUserStrategies(user.id);
    return NextResponse.json({ strategies });
  } catch (error) {
    console.error("Error in GET /api/strategies:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
