import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";

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

// Function to save a file to the server
export async function saveFile(file: File, folder = "uploads") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true }); // <--- FIX: Pastikan folder ada!
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    return `/${folder}/${filename}`;
}

// Function to safely delete a file
export async function safeDeleteFile(filePath: string) {
    if (!filePath) return;
    const fullPath = path.join(process.cwd(), "public", filePath.startsWith("/") ? filePath : `/${filePath}`);
    try {
        await unlink(fullPath);
    } catch (err) {
        if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
            console.log(`[FILE_DELETE_ERROR]`, err);
        }
    }
}

