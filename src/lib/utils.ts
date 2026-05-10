import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add your email here to access developer-only features like the Options Strategy Builder
export const DEVELOPER_EMAILS = [
  "admin@tradeoffx.com",
  "nipun.chadda28@gmail.com",
];

export const getDecisionQualityScore = (d: any) => {
  const thesisClarityScore = Math.min(10, Math.max(1,
    Math.floor((d.thesis?.length || 0) / 20) + ((d.what_would_make_me_wrong?.length || 0) > 20 ? 2 : 0)
  ));
  
  let riskScore = 3;
  if (d.stop_loss) riskScore += 3;
  if (d.target_price) riskScore += 2;
  if (d.risk_reward_ratio && d.risk_reward_ratio >= 2) riskScore += 2;
  riskScore = Math.min(10, riskScore);

  let emotionalScore = 5;
  if (d.emotion === "calm") emotionalScore = 10;
  else if (d.emotion === "excited") emotionalScore = 8;
  else if (d.emotion === "uncertain") emotionalScore = 5;
  else if (d.emotion === "anxious") emotionalScore = 3;
  else if (d.emotion === "fomo" || d.emotion === "greedy") emotionalScore = 1;

  let processScore = 3;
  if (d.checklist_completed) processScore += 3;
  if (d.confidence_level >= 7) processScore += 2;
  if (d.decision_type === "logic") processScore += 2;
  else if (d.decision_type === "mixed") processScore += 1;
  processScore = Math.min(10, processScore);

  return Math.round(((thesisClarityScore + riskScore + emotionalScore + processScore) / 40) * 100);
};
