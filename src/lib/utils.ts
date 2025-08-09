import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to extract username from a URL
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

// Client-side utility functions
export function formatDate(date: Date) {
  return date.toLocaleDateString();
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}