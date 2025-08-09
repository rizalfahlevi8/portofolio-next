'use server'

import path from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import { revalidatePath } from "next/cache";

// Function to save a file to the server
export async function saveFile(file: File, folder = "uploads") {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public", folder);
    await mkdir(uploadDir, { recursive: true });
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

// Server Action untuk upload file
export async function uploadFile(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }
        
        const filePath = await saveFile(file);
        revalidatePath('/admin'); // Revalidate cache jika perlu
        return { success: true, filePath };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to upload file' };
    }
}

// Server Action untuk delete file
export async function deleteFile(filePath: string) {
    try {
        await safeDeleteFile(filePath);
        revalidatePath('/admin'); // Revalidate cache jika perlu
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: 'Failed to delete file' };
    }
}

// Server Action untuk upload multiple files
export async function uploadMultipleFiles(formData: FormData) {
    try {
        const files = formData.getAll('files') as File[];
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }
        
        const uploadPromises = files.map(file => saveFile(file));
        const filePaths = await Promise.all(uploadPromises);
        
        revalidatePath('/admin');
        return { success: true, filePaths };
    } catch (error) {
        console.error('Multiple upload error:', error);
        return { success: false, error: 'Failed to upload files' };
    }
}

// Server Action untuk delete multiple files
export async function deleteMultipleFiles(filePaths: string[]) {
    try {
        const deletePromises = filePaths.map(filePath => safeDeleteFile(filePath));
        await Promise.all(deletePromises);
        
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Multiple delete error:', error);
        return { success: false, error: 'Failed to delete files' };
    }
}