import { supabase } from "@/integrations/supabase/client";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallDeepSeekOptions {
  messages: DeepSeekMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DeepSeekResponse {
  id: string;
  choices: Array<{
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Calls DeepSeek through the `deepseek` Edge Function.
 * The API key lives server-side as DEEPSEEK_API_KEY and never reaches the browser.
 */
export async function callDeepSeek(
  options: CallDeepSeekOptions,
): Promise<DeepSeekResponse> {
  const { maxTokens, ...rest } = options;
  const { data, error } = await supabase.functions.invoke<DeepSeekResponse>(
    "deepseek",
    { body: { ...rest, max_tokens: maxTokens } },
  );

  if (error) throw error;
  if (!data) throw new Error("Empty response from DeepSeek function");
  return data;
}