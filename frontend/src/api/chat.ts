import { apiCall } from "./http";

export interface ChatRequest {
  message: string;
}

/**
 * The backend responds with `{ reply, timestamp }`.
 *
 * This interface previously declared `response`, and the chat page read
 * `res.response`, which is always undefined. The assistant bubble therefore
 * rendered empty for every reply the model returned, with no error to explain
 * it. `response` is kept optional in case an older deployment is still
 * answering with the other shape.
 */
export interface ChatResponse {
  reply: string;
  timestamp?: string;
  response?: string;
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  return apiCall<ChatResponse>("/chat", "POST", { message });
}
