import { supabase } from "@/integrations/supabase/client";

// Generic load/save for portfolio content using Supabase with localStorage fallback
export async function loadContent<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("data")
      .eq("id", key)
      .maybeSingle();

    if (error) throw error;
    if (data?.data) return data.data as T;

    // Fall back to localStorage for migration
    const local = localStorage.getItem(`portfolio_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      // Migrate to Supabase
      await saveContent(key, parsed);
      return parsed;
    }
  } catch (e) {
    console.error(`Failed to load ${key} from DB:`, e);
    // Try localStorage fallback
    try {
      const local = localStorage.getItem(`portfolio_${key}`);
      if (local) return JSON.parse(local);
    } catch {}
  }
  return defaultValue;
}

export async function saveContent<T>(key: string, value: T): Promise<void> {
  try {
    const { error } = await supabase
      .from("portfolio_content")
      .upsert(
        { id: key, data: value as any, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    if (error) throw error;
    // Also save to localStorage as backup
    localStorage.setItem(`portfolio_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
    // Fallback to localStorage
    localStorage.setItem(`portfolio_${key}`, JSON.stringify(value));
  }
}

// Upload file to Supabase storage and return public URL
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const { error } = await supabase.storage
      .from("portfolio-files")
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("portfolio-files")
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (e) {
    console.error("File upload failed, using base64 fallback:", e);
    // Fallback: convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

// Helper to upload and get URL from a file input event
export async function handleFileInput(
  e: React.ChangeEvent<HTMLInputElement> | { target: HTMLInputElement },
  folder: string
): Promise<string | null> {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return null;
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}.${ext}`;
  return uploadFile(file, path);
}
