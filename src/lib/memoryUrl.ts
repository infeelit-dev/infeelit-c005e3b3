import { supabase } from "@/integrations/supabase/client";

const BUCKET = "memories";
const SIGNED_TTL_SECONDS = 60 * 60; // 1h

/**
 * Extract a storage path inside the `memories` bucket from either a raw path
 * (e.g. "userId/123_memory.webm") or a legacy public URL.
 * Returns null if the value doesn't look like a memories-bucket reference.
 */
function toStoragePath(value: string): string | null {
  if (!value) return null;
  // Legacy public URL form: .../storage/v1/object/public/memories/<path>
  const publicMatch = value.match(/\/storage\/v1\/object\/(?:public|sign)\/memories\/([^?]+)/);
  if (publicMatch) return decodeURIComponent(publicMatch[1]);
  // Already a path (no protocol)
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, "");
  return null;
}

/**
 * Resolve a stored memory reference (path or legacy public URL) into a
 * usable URL. Uses signed URLs for the private `memories` bucket so RLS
 * on storage.objects controls access.
 */
export async function resolveMemoryUrl(value: string | null | undefined): Promise<string> {
  if (!value) return "";
  const path = toStoragePath(value);
  if (!path) return value; // external URL — pass through
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL_SECONDS);
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

export async function resolveMemoryFields<T extends { file_url?: string | null; thumbnail_url?: string | null }>(
  rows: T[],
): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      const [file_url, thumbnail_url] = await Promise.all([
        resolveMemoryUrl(row.file_url),
        resolveMemoryUrl(row.thumbnail_url),
      ]);
      return { ...row, file_url, thumbnail_url };
    }),
  );
}