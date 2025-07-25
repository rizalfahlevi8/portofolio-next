import { supabase } from './supabase';

export function getSupabaseImageUrl(fileName: string, bucket: 'thumbnails' | 'photos'): string {
  if (!fileName) return '';
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return data.publicUrl;
}

export function getSupabaseImageUrls(fileNames: string[], bucket: 'thumbnails' | 'photos'): string[] {
  return fileNames.map(fileName => getSupabaseImageUrl(fileName, bucket));
}