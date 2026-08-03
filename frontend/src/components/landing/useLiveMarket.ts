import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";

export type Symbol = "BTC" | "ETH" | "SOL" | "BNB";

/**
 * Each asset carries its own brand colour. These are the real marks (the
 * dashboard already uses #F7931A for Bitcoin), so the colour identifies the
 * asset rather than decorating the row.
 */
export const ASSETS: { key: Symbol; name: string; color: string }[] = [
  { key: "BTC", name: "Bitcoin", color: "#F7931A" },
  { key: "ETH", name: "Ethereum", color: "#627EEA" },
  { key: "SOL", name: "Solana", color: "#14B892" },
  { key: "BNB", name: "BNB", color: "#F0B90B" },
];

export type Tick = {
  price: number;
  /** -1 down, 0 unchanged, 1 up. Drives the flash and the arrow. */
  dir: -1 | 0 | 1;
  /** Rolling window of recent prices, oldest first. Feeds the sparkline. */
  history: number[];
  /** Change across the window, as a fraction. */
  drift: number;
};

export type MarketState = Record<Symbol, Tick>;

/** Enough points to show a shape, few enough to stay cheap to render. */
const WINDOW = 40;

const blank = (): Tick => ({ price: 0, dir: 0, history: [], drift: 0 });

const EMPTY: MarketState = {
  BTC: blank(),
  ETH: blank(),
  SOL: blank(),
  BNB: blank(),
};

/**
 * Subscribes to the same price feed the trading app uses.
 *
 * The landing page shows real numbers from our own backend rather than a
 * screenshot or invented figures, so the hero is accurate by construction and
 * the motion is motivated: it moves because the market moved.
 *
 * Falls back silently to a disconnected state - the page must read correctly
 * with no socket at all, since a visitor should never see a broken hero
 * because the feed is down.
 */
export function useLiveMarket() {
  const [prices, setPrices] = useState<MarketState>(EMPTY);
  const [connected, setConnected] = useState(false);
  const previous = useRef<Record<string, number>>({});

  useEffect(() => {
    let socket: Socket;
    try {
      socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });
    } catch {
      return;
    }

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("priceUpdate", (incoming: Record<string, string | number>) => {
      setPrices((current) => {
        const next = { ...current };
        for (const { key } of ASSETS) {
          const value = Number(incoming?.[key]);
          if (!Number.isFinite(value) || value <= 0) continue;

          const before = previous.current[key];
          const history = [...current[key].history, value].slice(-WINDOW);
          const first = history[0];

          next[key] = {
            price: value,
            dir: before === undefined || before === value ? 0 : value > before ? 1 : -1,
            history,
            drift: first ? (value - first) / first : 0,
          };
          previous.current[key] = value;
        }
        return next;
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return { prices, connected };
}

/** Prices span ~$70,000 to ~$70. One formatter would render both badly. */
export function formatPrice(value: number) {
  if (!value) return "-";
  const decimals = value >= 1000 ? 0 : value >= 100 ? 1 : 2;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
