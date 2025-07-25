import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  fileName: string;
  publicUrl: string;
}

export async function uploadToSupabase(
  file: File,
  bucket: 'thumbnails' | 'photos',
  folder?: string
): Promise<UploadResult> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    fileName: data.path,
    publicUrl
  };
}

export async function uploadMultipleFiles(
  files: FileList | File[],
  bucket: 'thumbnails' | 'photos',
  folder?: string
): Promise<UploadResult[]> {
  const uploadPromises = Array.from(files).map(file => 
    uploadToSupabase(file, bucket, folder)
  );
  
  return Promise.all(uploadPromises);
}

export async function deleteFromSupabase(
  fileName: string,
  bucket: 'thumbnails' | 'photos'
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}