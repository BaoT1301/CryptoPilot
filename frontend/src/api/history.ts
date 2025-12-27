import type { HistoryApiEntry } from "@/types/history";
import { apiCall } from "./http";

export async function getTradeHistory(): Promise<HistoryApiEntry[]> {
  return apiCall<HistoryApiEntry[]>("/history", "GET");
}
