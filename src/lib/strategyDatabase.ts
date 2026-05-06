import { createClient } from "@supabase/supabase-js";
import { OptionPosition } from "@/app/(app)/options/page";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export interface SavedStrategy {
  id: string;
  name: string;
  description?: string;
  underlying_symbol: string;
  strategy_type: string;
  entry_spot: number;
  max_profit?: number;
  max_loss?: number;
  breakevens?: number[];
  greeks?: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
  positions: OptionPosition[];
  created_at: string;
  updated_at: string;
}

/**
 * Save a new strategy to the database
 */
export async function saveStrategy(
  userId: string,
  strategyData: {
    name: string;
    description?: string;
    underlying_symbol: string;
    strategy_type: string;
    entry_spot: number;
    max_profit?: number;
    max_loss?: number;
    breakevens?: number[];
    greeks?: any;
    positions: OptionPosition[];
  }
): Promise<{ id: string; error?: string }> {
  try {
    // Save the strategy
    const { data: strategy, error: strategyError } = await supabase
      .from("option_strategies")
      .insert({
        user_id: userId,
        name: strategyData.name,
        description: strategyData.description,
        underlying_symbol: strategyData.underlying_symbol,
        strategy_type: strategyData.strategy_type,
        entry_spot: strategyData.entry_spot,
        max_profit: strategyData.max_profit,
        max_loss: strategyData.max_loss,
        breakevens: strategyData.breakevens ? JSON.stringify(strategyData.breakevens) : null,
        greeks: strategyData.greeks || null,
      })
      .select()
      .single();

    if (strategyError) {
      console.error("Error saving strategy:", strategyError);
      return { id: "", error: strategyError.message };
    }

    // Save positions
    if (strategyData.positions.length > 0) {
      const positions = strategyData.positions.map((pos) => ({
        strategy_id: strategy.id,
        position_type: pos.type,
        strike_price: pos.strike,
        expiry_date: pos.expiry,
        premium: pos.premium,
        iv: pos.iv,
        quantity: pos.quantity,
        lot_size: pos.lotSize,
      }));

      const { error: positionsError } = await supabase
        .from("option_positions")
        .insert(positions);

      if (positionsError) {
        console.error("Error saving positions:", positionsError);
        // Strategy was created but positions failed - log warning
        return { id: strategy.id, error: "Strategy saved but positions failed: " + positionsError.message };
      }
    }

    return { id: strategy.id };
  } catch (error) {
    console.error("Unexpected error saving strategy:", error);
    return { id: "", error: String(error) };
  }
}

/**
 * Get all strategies for a user
 */
export async function getUserStrategies(userId: string): Promise<SavedStrategy[]> {
  try {
    const { data: strategies, error } = await supabase
      .from("option_strategies")
      .select(
        `
        id,
        name,
        description,
        underlying_symbol,
        strategy_type,
        entry_spot,
        max_profit,
        max_loss,
        breakevens,
        greeks,
        created_at,
        updated_at,
        option_positions (
          id,
          position_type,
          strike_price,
          expiry_date,
          premium,
          iv,
          quantity,
          lot_size
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching strategies:", error);
      return [];
    }

    return (
      strategies?.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        underlying_symbol: s.underlying_symbol,
        strategy_type: s.strategy_type,
        entry_spot: s.entry_spot,
        max_profit: s.max_profit,
        max_loss: s.max_loss,
        breakevens: s.breakevens ? JSON.parse(s.breakevens) : [],
        greeks: s.greeks,
        positions: s.option_positions.map((p: any) => ({
          id: p.id,
          type: p.position_type,
          strike: p.strike_price,
          expiry: p.expiry_date,
          premium: p.premium,
          iv: p.iv,
          quantity: p.quantity,
          lotSize: p.lot_size,
        })),
        created_at: s.created_at,
        updated_at: s.updated_at,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return [];
  }
}

/**
 * Get a single strategy by ID
 */
export async function getStrategy(strategyId: string, userId: string): Promise<SavedStrategy | null> {
  try {
    const { data: strategy, error } = await supabase
      .from("option_strategies")
      .select(
        `
        id,
        name,
        description,
        underlying_symbol,
        strategy_type,
        entry_spot,
        max_profit,
        max_loss,
        breakevens,
        greeks,
        created_at,
        updated_at,
        option_positions (
          id,
          position_type,
          strike_price,
          expiry_date,
          premium,
          iv,
          quantity,
          lot_size
        )
      `
      )
      .eq("id", strategyId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching strategy:", error);
      return null;
    }

    return {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      underlying_symbol: strategy.underlying_symbol,
      strategy_type: strategy.strategy_type,
      entry_spot: strategy.entry_spot,
      max_profit: strategy.max_profit,
      max_loss: strategy.max_loss,
      breakevens: strategy.breakevens ? JSON.parse(strategy.breakevens) : [],
      greeks: strategy.greeks,
      positions: strategy.option_positions.map((p: any) => ({
        id: p.id,
        type: p.position_type,
        strike: p.strike_price,
        expiry: p.expiry_date,
        premium: p.premium,
        iv: p.iv,
        quantity: p.quantity,
        lotSize: p.lot_size,
      })),
      created_at: strategy.created_at,
      updated_at: strategy.updated_at,
    };
  } catch (error) {
    console.error("Error fetching strategy:", error);
    return null;
  }
}

/**
 * Update an existing strategy
 */
export async function updateStrategy(
  strategyId: string,
  userId: string,
  updates: Partial<SavedStrategy>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("option_strategies")
      .update({
        name: updates.name,
        description: updates.description,
        max_profit: updates.max_profit,
        max_loss: updates.max_loss,
        breakevens: updates.breakevens ? JSON.stringify(updates.breakevens) : null,
        greeks: updates.greeks,
        updated_at: new Date().toISOString(),
      })
      .eq("id", strategyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating strategy:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating strategy:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a strategy (soft delete - archive)
 */
export async function deleteStrategy(
  strategyId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("option_strategies")
      .update({ is_archived: true })
      .eq("id", strategyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting strategy:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting strategy:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Load a saved strategy's positions back into the builder
 */
export async function loadStrategy(strategyId: string, userId: string): Promise<OptionPosition[] | null> {
  const strategy = await getStrategy(strategyId, userId);
  if (!strategy) return null;
  return strategy.positions;
}
