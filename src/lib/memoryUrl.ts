import { supabase } from "@/integrations/supabase/client";

const BUCKET = "memories";
const SIGNED_TTL_SECONDS = 60 * 60 * 24; // 24h

/**
 * Extract a storage path inside the `memories` bucket from either a raw path
 * (e.g. "userId/123_memory.webm") or a legacy public/signed URL.
 * Returns null if the value doesn't look like a memories-bucket reference.
 */
function toStoragePath(value: string): string | null {
  if (!value) return null;
  // Legacy URL form: .../storage/v1/object/public|sign/memories/<path>
  const publicMatch = value.match(/\/storage\/v1\/object\/(?:public|sign)\/memories\/([^?]+)/);
  if (publicMatch) return decodeURIComponent(publicMatch[1]);
  // Already a path (no protocol)
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+/, "");
  return null;
}

/**
 * Resolve a stored memory reference (path or legacy storage URL) into a
 * usable signed URL. Returns null when the object is missing or signing fails
 * (e.g. NoSuchKey / 400) so callers can skip orphan rows.
 */
export async function resolveMemoryUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  const path = toStoragePath(value);
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function resolveMemoryFields<T extends { file_url?: string | null; thumbnail_url?: string | null }>(
  rows: T[],
): Promise<Array<Omit<T, "file_url" | "thumbnail_url"> & { file_url: string | null; thumbnail_url: string | null }>> {
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
