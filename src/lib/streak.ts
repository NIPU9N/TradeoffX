/**
 * Calculates and updates the user's decision streak using UTC dates.
 * 
 * Logic:
 * - If last_decision_date is today (UTC) → streak unchanged
 * - If last_decision_date is yesterday (UTC) → increment streak
 * - If last_decision_date is older → reset streak to 1
 */
export function calculateStreak(
  lastDecisionDate: string | null,
  currentStreak: number,
  longestStreak: number
): { newStreak: number; newLongest: number } {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (!lastDecisionDate) {
    return { newStreak: 1, newLongest: Math.max(1, longestStreak) };
  }

  if (lastDecisionDate === todayStr) {
    // Already logged today — no change
    return { newStreak: currentStreak || 1, newLongest: Math.max(currentStreak || 1, longestStreak) };
  }

  const lastDate = new Date(lastDecisionDate);
  const todayDate = new Date(todayStr);

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let newStreak: number;

  if (diffDays === 1) {
    // Yesterday — increment streak
    newStreak = (currentStreak || 0) + 1;
  } else {
    // Gap of 2+ days — reset to 1 (starting new streak today)
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, longestStreak);

  return { newStreak, newLongest };
}

/**
 * Checks if the streak should be displayed as 0 because the user missed yesterday.
 */
export function getDisplayStreak(
  lastDecisionDate: string | null,
  currentStreak: number
): number {
  if (!lastDecisionDate || !currentStreak) return 0;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (lastDecisionDate === todayStr) return currentStreak;

  const lastDate = new Date(lastDecisionDate);
  const todayDate = new Date(todayStr);

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // If last decision was yesterday, streak is still active
  if (diffDays <= 1) return currentStreak;

  // Otherwise, it's broken
  return 0;
}

