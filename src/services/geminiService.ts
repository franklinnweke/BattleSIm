/**
 * Gemini service with explicit types and a clean config object to avoid parser issues
 */

export interface GeminiResponse {
  ok?: boolean;
  data?: any;
  // specify fields more precisely if known
}

export interface GeminiRequestParams {
  // define any params expected by the service
  query?: string;
}

const DEFAULT_SCHEMA: Record<string, unknown> = {
  // keep schema small and explicitly typed to avoid serialization/parsing issues
  model: "gpt-4o-mini",
  prompt: "list_battles",
};

export async function fetchGemini(
  params: GeminiRequestParams = {}
): Promise<GeminiResponse> {
  const schema: Record<string, unknown> = {
    ...DEFAULT_SCHEMA,
    ...params,
  };

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schema),
  });

  if (!res.ok) {
    // return a typed error-like response (or throw depending on how the app expects it)
    const text = await res.text();
    throw new Error(`Gemini fetch failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as GeminiResponse;
  return json;
}