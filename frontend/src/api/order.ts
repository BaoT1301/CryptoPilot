import { apiCall } from "./http";
import type {
  Order,
  CreateOrderRequest,
  OrderBook,
  Asset,
} from "@/types/order";

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  return apiCall<Order>("/orders", "POST", data);
}

export async function getOrders(): Promise<Order[]> {
  return apiCall<Order[]>("/orders", "GET");
}

export async function getOrderById(id: string): Promise<Order> {
  return apiCall<Order>(`/orders/${id}`, "GET");
}

export async function cancelOrder(id: string): Promise<void> {
  return apiCall<void>(`/orders/${id}`, "DELETE");
}

export async function getOrderBook(asset: Asset): Promise<OrderBook> {
  return apiCall<OrderBook>(`/orders/book/${asset}`, "GET");
}
