export type TradeSide = "BUY" | "SELL";
export type TradeStatus = "Filled" | "Partially Filled" | "Cancelled";

export type HistoryApiEntry = {
  _id: string;
  account: string;
  type: TradeSide;
  asset: string;
  amount: number;
  price?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};
