import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUsernameFromUrl = (url: string | undefined) => {
  if (!url) return "";
  try {
    const cleaned = url.trim().replace(/\/+$/, "");
    const parts = cleaned.split("/");
    return parts[parts.length - 1];
  } catch {
    return url;
  }
};

