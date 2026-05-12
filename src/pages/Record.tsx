const uploadAllClips = async (): Promise<string[]> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  userIdRef.current = userId;
  const urls: string[] = [];

  for (const clip of memoryClips.current) {
    const mimeType = getMimeType(audioMode);
    const ts = Date.now() + Math.random();
    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const fileName = `${userId}/${ts}_memory.${ext}`;
    const posterName = `${userId}/${ts}_poster.jpg`;

    try {
      const { data, error } = await supabase.storage
        .from("memories")
        .upload(fileName, clip.blob, { contentType: mimeType, upsert: true });

      if (error) {
        console.error("Storage upload error:", error);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("memories").getPublicUrl(fileName);

      urls.push(publicUrl);
      uploadedThumbUrl.current = "";

      if (clip.posterBlob) {
        const { data: posterData } = await supabase.storage
          .from("memories")
          .upload(posterName, clip.posterBlob, { contentType: "image/jpeg", upsert: true });
        if (posterData) {
          const {
            data: { publicUrl: thumbUrl },
          } = supabase.storage.from("memories").getPublicUrl(posterName);
          uploadedThumbUrl.current = thumbUrl;
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }
  return urls;
};
