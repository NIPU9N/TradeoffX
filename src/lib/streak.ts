/**
 * Calculates and updates the user's decision streak.
 *
 * Logic:
 * - If last_decision_date is today → streak unchanged
 * - If last_decision_date is yesterday → increment streak
 * - If last_decision_date is older → reset streak to 1
 * - Update longest_streak if current > longest
 */
export function calculateStreak(
  lastDecisionDate: string | null,
  currentStreak: number,
  longestStreak: number
): { newStreak: number; newLongest: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastDecisionDate) {
    return { newStreak: 1, newLongest: Math.max(1, longestStreak) };
  }

  const lastDate = new Date(lastDecisionDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let newStreak: number;

  if (diffDays === 0) {
    // Already logged today — no change
    newStreak = currentStreak;
  } else if (diffDays === 1) {
    // Yesterday — increment streak
    newStreak = currentStreak + 1;
  } else {
    // Gap of 2+ days — reset
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, longestStreak);

  return { newStreak, newLongest };
}
