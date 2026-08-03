import { apiCall } from "./http";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  return apiCall<ChatResponse>("/chat", "POST", { message });
}
