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

