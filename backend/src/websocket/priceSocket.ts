import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import WebSocket from "ws";
import dotenv from "dotenv";
import { updatePrices } from "../modules/chat/chat.service";
import {
  Prices,
  SYMBOL_MAP,
  PRECISION_MAP,
  INITIAL_PRICES,
} from "../modules/constantAssets/asset.model";
import { checkLimitOrders } from "../modules/order/order.matching";

dotenv.config();

/** Same comma-separated list the Express CORS layer uses. */
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL ?? "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const BINANCE_WS =
  process.env.BINANCE_WS ||
  "wss://stream.binance.us:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/bnbusdt@ticker/solusdt@ticker";

const prices: Prices = { ...INITIAL_PRICES };

let io: SocketIOServer;
/** Guards against attaching a second Socket.IO server to the same HTTP server. */
let ioInitialized = false;
/** Consecutive failed Binance connection attempts, for backoff. */
let reconnectAttempts = 0;

const MAX_RECONNECT_DELAY_MS = 60_000;

/**
 * Connects to the Binance ticker stream, with reconnect.
 *
 * Kept strictly separate from the Socket.IO server lifecycle. The reconnect
 * path previously re-invoked setupPriceSocket(), which called
 * `new SocketIOServer(server, ...)` again and reassigned the module-level `io`.
 * Socket.IO re-registers its HTTP "request" listener on attach but does not
 * remove "upgrade" listeners, so every reconnect leaked listeners AND left
 * already-connected browsers bound to an orphaned instance that nothing emits
 * to. Symptom: every open tab's price ticker froze at its last value while
 * still appearing connected, and only a hard refresh recovered it. If Binance
 * was unreachable this repeated every 5s forever, growing memory until the
 * container was OOM-killed.
 */
function connectBinance() {
  let binanceWS: WebSocket;

  // `new WebSocket()` throws synchronously on a malformed URL. Uncaught inside
  // the reconnect timer that would take down the process.
  try {
    binanceWS = new WebSocket(BINANCE_WS);
  } catch (err) {
    console.error("[BE] Invalid BINANCE_WS url:", err);
    scheduleReconnect();
    return;
  }

  binanceWS.on("open", () => {
    reconnectAttempts = 0;
    console.log("✅ [BE] Connected to Binance US WebSocket");
  });

  binanceWS.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle Binance stream format: {stream: "btcusdt@ticker", data: {...}}
      const ticker = message.data || message;
      const key = SYMBOL_MAP[ticker.s];
      if (key) {
        const precision = PRECISION_MAP[key];
        const newPrice = parseFloat(ticker.c).toFixed(precision);
        const oldPrice = prices[key];
        prices[key] = newPrice;

        // No per-tick logging: four ticker streams at sub-second cadence
        // flooded the Railway logs continuously.
        io.emit("priceUpdate", prices);

        updatePrices(prices);

        // Check limit orders when price changes
        if (oldPrice !== newPrice) {
          checkLimitOrders(prices).catch((err) => {
            console.error("❌ [BE] Error checking limit orders:", err);
          });
        }
      }
    } catch (err) {
      console.error("❌ [BE] Failed to parse message:", err);
    }
  });

  binanceWS.on("error", (err) => {
    console.error("❌ [BE] Binance WS error:", err.message);
  });

  binanceWS.on("close", () => {
    // Reconnect the upstream feed ONLY. The Socket.IO server is untouched, so
    // connected browsers keep their sockets and simply resume receiving prices.
    scheduleReconnect();
  });
}

/** Reconnects with exponential backoff, capped, instead of a hot 5s loop. */
function scheduleReconnect() {
  reconnectAttempts += 1;
  const delay = Math.min(
    1000 * 2 ** Math.min(reconnectAttempts, 6),
    MAX_RECONNECT_DELAY_MS
  );
  console.warn(
    `[BE] Binance feed down (attempt ${reconnectAttempts}). Retrying in ${delay}ms`
  );
  setTimeout(connectBinance, delay).unref?.();
}

export function setupPriceSocket(server: HTTPServer) {
  if (ioInitialized) return io;

  io = new SocketIOServer(server, {
    cors: { origin: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : "*", credentials: true },
  });
  ioInitialized = true;

  console.log("[BE] WebSocket server started");
  console.log(`[BE] CORS allowed origins: ${ALLOWED_ORIGINS.join(", ") || "*"}`);

  io.on("connection", (socket) => {
    // Send a snapshot immediately so a new tab isn't blank until the next tick.
    socket.emit("priceUpdate", prices);
  });

  connectBinance();

  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO not initialized! Call setupPriceSocket first.");
  }
  return io;
}

export function getCurrentPrices(): Prices {
  return { ...prices };
}
