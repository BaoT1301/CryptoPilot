export type OrderType = "market" | "limit";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled";
export type Asset = "BTC" | "ETH" | "SOL" | "BNB";

export interface Order {
  id: string;
  userId: string;
  asset: Asset;
  type: OrderType;
  side: OrderSide;
  amount: number;
  originalAmount: number;
  limitPrice?: number;
  status: OrderStatus;
  filledAmount: number;
  remainingAmount: number;
  executionPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  asset: Asset;
  type: OrderType;
  side: OrderSide;
  amount: number;
  limitPrice?: number;
}

export interface OrderBookEntry {
  id: string;
  price: number;
  amount: number;
  remainingAmount: number;
  side: OrderSide;
  asset: Asset;
}

export interface OrderBook {
  asset: Asset;
  bids: OrderBookEntry[]; // Buy orders
  asks: OrderBookEntry[]; // Sell orders
}

export interface OrderExecution {
  orderId: string;
  executionPrice: number;
  filledAmount: number;
  status: OrderStatus;
}
