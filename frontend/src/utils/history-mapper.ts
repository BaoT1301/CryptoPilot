import type { HistoryApiEntry, TradeStatus } from "@/types/history";

export type HistoryRow = {
  id: string;
  date: string;
  pair: string;
  side: "BUY" | "SELL";
  price: string;
  amount: string;
  fee: string;
  status: TradeStatus;
};

export function mapApiToRow(entry: HistoryApiEntry): HistoryRow {
  const date = new Date(entry.createdAt).toLocaleString();

  const pair = `${entry.asset}/USDT`;

  const price =
    entry.price != null
      ? entry.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";

  const fee = "0.10 USDT";

  // The API returns FILLED / PARTIALLY_FILLED / CANCELLED. This previously
  // compared against Title Case, so nothing ever matched and every row fell
  // through to the "Filled" default, showing cancelled orders as executed.
  const normalised = String(entry.status ?? "").toUpperCase().replace(/\s+/g, "_");
  const status: TradeStatus =
    normalised === "CANCELLED"
      ? "Cancelled"
      : normalised === "PARTIALLY_FILLED"
        ? "Partially Filled"
        : "Filled";

  return {
    id: entry._id,
    date,
    pair,
    side: entry.type,
    price,
    // `price` above is null-guarded; `amount` was not. A single row with a null
    // amount threw here and took down the entire History page, since the caller
    // maps eagerly outside any try/catch.
    amount: entry.amount != null ? entry.amount.toString() : "—",
    fee,
    status,
  };
}
