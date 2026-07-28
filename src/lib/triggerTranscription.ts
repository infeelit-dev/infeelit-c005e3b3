import { supabase } from "@/integrations/supabase/client";

export const triggerTranscription = async (memoryId: string, fileUrl: string, title: string) => {
  try {
    supabase.functions.invoke("transcribe-and-translate", {
      body: {
        memory_id: memoryId,
        file_url: fileUrl,
        title: title,
      },
    });
  } catch (err) {
    console.error("Transcription trigger failed:", err);
  }
};
