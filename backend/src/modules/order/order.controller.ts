// Controller files: handle logic between routes and services

import { Request, Response } from "express";
import { UpdateOrderBody, OrderResponse, CreateOrderBody } from "./order.model";
import * as OrderService from "./order.service";
import { broadcastOrderUpdate } from "../../websocket/orderSocket";
import { AuthRequest } from "../authentication/auth.types";
import { getCurrentPrices } from "../../websocket/priceSocket";
import { cancelOrder, getOrderBook } from "./order.matching";

// GET /orders
export const getAllOrders = async (
  req: AuthRequest,
  res: Response<OrderResponse[]>
) => {
  const userId = req.user?.userId;
  const orders = await OrderService.getAll(userId);
  res.json(orders);
};

// GET /orders/:id
export const getOrderById = async (
  req: AuthRequest,
  res: Response<OrderResponse | { message: string }>
) => {
  const userId = req.user?.userId;
  const order = await OrderService.getById(req.params.id);

  if (!order) return res.status(404).json({ message: "Order not found" });

  // Users can only see their own orders (unless admin)
  if (order.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(order);
};

// POST /orders
export const createOrder = async (
  req: AuthRequest,
  res: Response<OrderResponse | { message: string }>
) => {
  try {
    const userId = req.user!.userId;
    const currentPrices = getCurrentPrices();
    const order = await OrderService.create(userId, req.body, currentPrices);

    broadcastOrderUpdate("orderCreated", order);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Invalid order" });
  }
};

// PUT /orders/:id
export const updateOrder = async (
  req: AuthRequest,
  res: Response<OrderResponse | { message: string }>
) => {
  const userId = req.user?.userId;

  const existing = await OrderService.getById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Order not found" });

  // Ownership check. Without this, any authenticated user could target ANY
  // order id -- including other users' -- and flip its status.
  if (existing.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Only an untouched order may be amended. Editing one that is partially
  // filled would desync it from the in-memory book and from balance maths.
  if (existing.status !== "open") {
    return res
      .status(400)
      .json({ message: "Only open orders can be updated" });
  }

  // Strict whitelist. The previous implementation passed req.body straight to
  // findByIdAndUpdate, so a caller could set status/filledAmount/executionPrice
  // directly -- and since balances are derived by summing filledAmount over
  // status:"filled" orders, that minted unlimited balance out of nothing.
  const { limitPrice, amount } = req.body ?? {};
  const patch: Record<string, number> = {};

  if (limitPrice !== undefined) {
    const value = Number(limitPrice);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: "limitPrice must be a positive number" });
    }
    patch.limitPrice = value;
  }

  if (amount !== undefined) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: "amount must be a positive number" });
    }
    patch.amount = value;
    patch.originalAmount = value;
  }

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  const order = await OrderService.update(req.params.id, patch);
  if (!order) return res.status(404).json({ message: "Order not found" });

  broadcastOrderUpdate("orderUpdated", order);
  res.json(order);
};

// DELETE /orders/:id
export const deleteOrder = async (
  req: AuthRequest,
  res: Response<void | { message: string }>
) => {
  try {
    const userId = req.user?.userId;
    const order = await OrderService.getById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Users can only cancel their own orders
    if (order.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ok = await cancelOrder(req.params.id);
    if (!ok) {
      return res.status(400).json({
        message: "Order cannot be cancelled (already filled or cancelled)",
      });
    }

    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ message: err.message ?? "Failed to cancel order" });
  }
};

// GET /orders/book or /orders/book/:asset
export const getOrderBookHandler = async (req: Request, res: Response) => {
  const asset = req.params.asset as string | undefined;
  const orderBook = getOrderBook(asset);
  res.json(orderBook);
};
