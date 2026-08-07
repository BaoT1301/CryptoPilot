import { useSyncExternalStore } from "react";
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

const PAIRS: Record<Symbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
};

const blank = (): Tick => ({ price: 0, dir: 0, history: [], drift: 0 });

/* ---------------------------------------------------------------------------
   Shared store.

   The hook previously opened its own socket per caller, so a landing page with
   both the hero panel and the ticker held two websocket connections and ran the
   history seed twice. Every consumer now reads one store, so the page opens a
   single connection no matter how many components subscribe.

   The socket is created on first subscriber and torn down when the last one
   leaves, which keeps app routes that never render a market component from
   holding a connection open.
--------------------------------------------------------------------------- */

let state: MarketState & { connected: boolean } = {
  BTC: blank(),
  ETH: blank(),
  SOL: blank(),
  BNB: blank(),
  connected: false,
};

const listeners = new Set<() => void>();
let socket: Socket | null = null;
let seedController: AbortController | null = null;
let seeded = false;
const previous: Record<string, number> = {};

function emit(next: Partial<typeof state>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

/**
 * Recent closes for one pair, straight from Binance's public REST endpoint.
 *
 * The socket only carries what happens from page load onward, and these pairs
 * can sit unchanged for a minute at a time, so a freshly loaded page showed
 * flat rails for a long while. Seeding with real history gives the traces a
 * true shape immediately, and the live socket continues them.
 *
 * No API key, and the endpoint sends Access-Control-Allow-Origin: *.
 */
async function fetchHistory(symbol: Symbol, signal: AbortSignal) {
  const res = await fetch(
    `https://api.binance.us/api/v3/klines?symbol=${PAIRS[symbol]}&interval=5m&limit=48`,
    { signal }
  );
  if (!res.ok) throw new Error("history unavailable");
  const rows = (await res.json()) as unknown[][];
  // Index 4 is the close price for the candle.
  return rows.map((r) => Number(r[4])).filter((n) => Number.isFinite(n) && n > 0);
}

function seed() {
  if (seeded) return;
  seeded = true;
  seedController = new AbortController();
  const { signal } = seedController;

  Promise.all(
    ASSETS.map(async ({ key }) => {
      try {
        return [key, await fetchHistory(key, signal)] as const;
      } catch {
        return [key, [] as number[]] as const;
      }
    })
  ).then((entries) => {
    if (signal.aborted) return;
    const next: Partial<MarketState> = {};
    for (const [key, history] of entries) {
      if (history.length < 2) continue;
      // Live ticks may already have arrived; keep them on the end so the seed
      // never overwrites fresher data.
      const merged = [...history, ...state[key].history].slice(-WINDOW);
      const first = merged[0];
      const latest = state[key].price || merged[merged.length - 1];
      next[key] = {
        ...state[key],
        price: latest,
        history: merged,
        drift: first ? (latest - first) / first : 0,
      };
    }
    emit(next);
  });
}

function connect() {
  if (socket) return;
  try {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
    });
  } catch {
    socket = null;
    return;
  }

  socket.on("connect", () => emit({ connected: true }));
  socket.on("disconnect", () => emit({ connected: false }));
  socket.on("connect_error", () => emit({ connected: false }));

  socket.on("priceUpdate", (incoming: Record<string, string | number>) => {
    const next: Partial<MarketState> = {};
    for (const { key } of ASSETS) {
      const value = Number(incoming?.[key]);
      if (!Number.isFinite(value) || value <= 0) continue;

      const before = previous[key];
      const history = [...state[key].history, value].slice(-WINDOW);
      const first = history[0];

      next[key] = {
        price: value,
        dir: before === undefined || before === value ? 0 : value > before ? 1 : -1,
        history,
        drift: first ? (value - first) / first : 0,
      };
      previous[key] = value;
    }
    if (Object.keys(next).length) emit(next);
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    seed();
    connect();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = null;
      seedController?.abort();
      // Allow a re-seed if the user navigates back later.
      seeded = false;
    }
  };
}

const getSnapshot = () => state;

/**
 * Subscribes to the same price feed the trading app uses.
 *
 * The landing page shows real numbers from our own backend rather than a
 * screenshot or invented figures, so it is accurate by construction and the
 * motion is motivated: it moves because the market moved.
 *
 * Falls back silently to a disconnected state - the page must read correctly
 * with no socket at all, since a visitor should never see a broken hero because
 * the feed is down.
 */
export function useLiveMarket() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { prices: snapshot, connected: snapshot.connected };
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
