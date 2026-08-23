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

export const getMemoryUrl = async (
  path: string | null | undefined,
  isPublic: boolean = false,
): Promise<string | null> => {
  if (!path) return null;

  // Already a full URL
  if (path.startsWith("https://") || path.startsWith("http://")) {
    const storagePath = toStoragePath(path);
    if (isPublic && storagePath) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      return data.publicUrl || null;
    }
    return path;
  }

  const storagePath = toStoragePath(path) ?? path.replace(/^\/+/, "");
  if (!storagePath) return null;

  // For public memories, use public URL directly (instant, no signing)
  if (isPublic) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl || null;
  }

  // For private memories, use signed URL
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
};

/**
 * Resolve a stored memory reference (path or legacy storage URL) into a
 * usable URL. Uses public URLs for public memories, signed URLs otherwise.
 */
export async function resolveMemoryUrl(
  value: string | null | undefined,
  isPublic: boolean = false,
): Promise<string | null> {
  return getMemoryUrl(value, isPublic);
}

export async function resolveMemoryFields<
  T extends {
    file_url?: string | null;
    thumbnail_url?: string | null;
    is_public?: boolean | null;
  },
>(
  rows: T[],
): Promise<Array<Omit<T, "file_url" | "thumbnail_url"> & { file_url: string | null; thumbnail_url: string | null }>> {
  return Promise.all(
    rows.map(async (row) => {
      const isPublic = row.is_public === true;
      const [file_url, thumbnail_url] = await Promise.all([
        getMemoryUrl(row.file_url, isPublic),
        getMemoryUrl(row.thumbnail_url, isPublic),
      ]);
      return { ...row, file_url, thumbnail_url };
    }),
  );
}
