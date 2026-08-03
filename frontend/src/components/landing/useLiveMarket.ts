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
const WINDOW = 60;

/** Binance market symbol for each asset, used to seed history. */
const PAIRS: Record<Symbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
};

/**
 * Recent closes for one pair, straight from Binance's public REST endpoint.
 *
 * The socket only carries what happens from page load onward, and these pairs
 * can sit unchanged for a minute at a time, so a freshly loaded page showed
 * four flat rails for a long time. Seeding with real history means the traces
 * have a true shape immediately, and the live socket continues them.
 *
 * No API key, and the endpoint sends Access-Control-Allow-Origin: *.
 */
async function fetchHistory(symbol: Symbol, signal: AbortSignal) {
  const url =
    "https://api.binance.us/api/v3/klines?symbol=" +
    PAIRS[symbol] +
    "&interval=5m&limit=48";
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("history unavailable");
  const rows = (await res.json()) as unknown[][];
  // Index 4 is the close price for the candle.
  return rows
    .map((row) => Number(row[4]))
    .filter((n) => Number.isFinite(n) && n > 0);
}

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

  // Seed the traces with real recent history so the panel has shape on first
  // paint rather than four flat rails.
  useEffect(() => {
    const controller = new AbortController();

    Promise.all(
      ASSETS.map(async ({ key }) => {
        try {
          return [key, await fetchHistory(key, controller.signal)] as const;
        } catch {
          return [key, [] as number[]] as const;
        }
      })
    ).then((entries) => {
      if (controller.signal.aborted) return;
      setPrices((current) => {
        const next = { ...current };
        for (const [key, history] of entries) {
          if (history.length < 2) continue;
          // Live ticks may already have arrived; keep them on the end so the
          // seed never overwrites fresher data.
          const merged = [...history, ...current[key].history].slice(-WINDOW);
          const first = merged[0];
          const latest = current[key].price || merged[merged.length - 1];
          next[key] = {
            ...current[key],
            price: latest,
            history: merged,
            drift: first ? (latest - first) / first : 0,
          };
        }
        return next;
      });
    });

    return () => controller.abort();
  }, []);

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
