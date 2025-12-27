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

  const status: TradeStatus =
    entry.status === "Filled" ||
    entry.status === "Partially Filled" ||
    entry.status === "Cancelled"
      ? entry.status
      : "Filled";

  return {
    id: entry._id,
    date,
    pair,
    side: entry.type,
    price,
    amount: entry.amount.toString(),
    fee,
    status,
  };
}
