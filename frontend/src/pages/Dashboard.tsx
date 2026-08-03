import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/lib/config";
import { getOrders } from "@/api/order";
import { getPortfolio, type PortfolioAsset } from "@/api/portfolio";
import type { Order } from "@/types/order";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { ASSETS, formatPrice } from "@/components/landing/useLiveMarket";

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);

  const [livePrices, setLivePrices] = useState({
    BTC: 0,
    ETH: 0,
    BNB: 0,
    SOL: 0,
  });

  const [priceChartData, setPriceChartData] = useState<
    Array<{
      date: string;
      BTC: number;
      ETH: number;
      SOL: number;
      BNB: number;
    }>
  >([]);

  const [baselinePrices, setBaselinePrices] = useState<{
    BTC: number;
    ETH: number;
    BNB: number;
    SOL: number;
  } | null>(null);

  useEffect(() => {
    const socket = io(
      SOCKET_URL,
      {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socket.on("connect", () => {
      console.log("✅ Connected to price feed");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from price feed");
      setIsConnected(false);
    });

    socket.on("priceUpdate", (prices) => {
      console.log("Price update received:", prices);

      const btcPrice = Number(prices.BTC) || 0;
      const ethPrice = Number(prices.ETH) || 0;
      const bnbPrice = Number(prices.BNB) || 0;
      const solPrice = Number(prices.SOL) || 0;

      setLivePrices({
        BTC: btcPrice,
        ETH: ethPrice,
        BNB: bnbPrice,
        SOL: solPrice,
      });

      // Set baseline prices on first update
      setBaselinePrices((baseline) => {
        if (!baseline) {
          return { BTC: btcPrice, ETH: ethPrice, BNB: bnbPrice, SOL: solPrice };
        }
        return baseline;
      });

      setPriceChartData((prev) => {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        const newPoint = {
          date: timeLabel,
          BTC: btcPrice,
          ETH: ethPrice,
          BNB: bnbPrice,
          SOL: solPrice,
        };

        // Keep last 20 data points
        const updated = [...prev, newPoint].slice(-20);
        console.log("📈 Chart data points:", updated.length);
        return updated;
      });
    });

    // Listen for order updates
    socket.on("orderCreated", () => {
      loadOrders();
    });

    socket.on("orderFilled", () => {
      loadOrders();
    });

    socket.on("orderCancelled", () => {
      loadOrders();
    });

    // Load initial orders
    loadOrders();
    loadPortfolio();

    return () => {
      console.log("🔌 Disconnecting socket");
      socket.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const orders = await getOrders();
      setRecentOrders(
        orders
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
      );
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const loadPortfolio = async () => {
    try {
      const data = await getPortfolio();
      // A user with no holdings can come back without a portfolio array at all.
      // Storing undefined here made the render below throw on .map(), which
      // unmounted the whole dashboard into a blank page.
      setPortfolio(data?.portfolio ?? []);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    }
  };

  // Map portfolio to display format with live prices
  const cryptos = (portfolio ?? []).map((asset) => ({
    id: asset.symbol,
    name: asset.name,
    symbol: asset.symbol,
    price: livePrices[asset.symbol] || asset.currentPrice,
    change: asset.change24h,
    holdings: asset.balance,
    value: asset.value,
  }));

  // The old gate blocked the whole page on `!isConnected` with no timeout, so a
  // backend outage trapped the user on a pulsing message forever. The page now
  // always renders and each region states its own condition.
  const totalValue = cryptos.reduce((sum, c) => sum + Number(c.value || 0), 0);
  const assetMeta = Object.fromEntries(ASSETS.map((a) => [a.key, a]));

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-10 md:px-10 md:py-14">
      {/* Readout. The portfolio total is the one number that matters, so it is
          set at display scale in mono and everything else defers to it. */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Portfolio value
          </p>
          <p className="mt-2 font-mono text-[clamp(2.25rem,5vw,3.5rem)] leading-none tracking-[-0.03em] tabular-nums text-foreground">
            ${totalValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={
              isConnected
                ? "h-1.5 w-1.5 rounded-full bg-[var(--market-up)]"
                : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
            }
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {isConnected ? "streaming" : "reconnecting"}
          </span>
        </div>
      </header>

      {/* Chart */}
      <section className="border-b border-border py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-normal tracking-[-0.02em] text-foreground">
            Relative performance
          </h2>

          {/* One segmented control rather than four pill buttons: this filters
              a single view, it is not four separate actions. */}
          <div className="flex flex-wrap gap-1 rounded-full border border-border p-1">
            {ASSETS.map((asset) => (
              <button
                key={asset.key}
                onClick={() => setSelectedCoin(asset.key)}
                className={
                  selectedCoin === asset.key
                    ? "flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 font-mono text-xs text-primary-foreground transition-colors"
                    : "flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary"
                }
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: asset.color }}
                />
                {asset.key}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {priceChartData.length === 0 ? (
            // Same height as the chart so nothing shifts when data lands.
            <div className="flex h-[360px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Waiting for the first prices
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/70">
                {isConnected
                  ? "connected, no ticks yet"
                  : "connecting to the feed"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={priceChartData}>
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  tickLine={false}
                  minTickGap={40}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  strokeOpacity={0.2}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => v.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  formatter={(value, name) => {
                    const n = typeof value === "number" ? value : Number(value);
                    if (!Number.isFinite(n)) return ["", ""];
                    const delta = n - 100;
                    const sign = delta >= 0 ? "+" : "";
                    return [
                      n.toFixed(2) + " (" + sign + delta.toFixed(2) + "%)",
                      String(name),
                    ];
                  }}
                />
                {ASSETS.map((asset) => (
                  <Line
                    key={asset.key}
                    type="monotone"
                    dataKey={asset.key}
                    stroke={asset.color}
                    strokeWidth={selectedCoin === asset.key ? 2 : 1.25}
                    dot={false}
                    isAnimationActive={false}
                    // Unselected series stay as faint context rather than
                    // vanishing, so the comparison is still readable.
                    opacity={selectedCoin === asset.key ? 1 : 0.22}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          <p className="mt-3 font-mono text-[11px] text-muted-foreground">
            Indexed to 100 at the first tick of this session.
          </p>
        </div>
      </section>

      {/* Ledger */}
      <section className="grid gap-x-14 gap-y-12 py-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-normal tracking-[-0.02em] text-foreground">
            Holdings
          </h2>

          {cryptos.length === 0 ? (
            // Previously there was no empty state at all: an empty portfolio
            // rendered a heading above a zero-height body.
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You do not hold anything yet.
              </p>
              <Link
                to="/trading"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
              >
                Place your first order
                <ArrowUpRight size={15} weight="bold" />
              </Link>
            </div>
          ) : (
            <ul className="mt-6">
              {cryptos.map((crypto) => {
                const meta = assetMeta[crypto.symbol];
                const change = Number(crypto.change ?? 0);
                const changeClass =
                  change > 0
                    ? "text-up"
                    : change < 0
                      ? "text-down"
                      : "text-muted-foreground";
                return (
                  <li
                    key={crypto.id}
                    onClick={() => setSelectedCoin(crypto.symbol)}
                    className={
                      "flex cursor-pointer items-center justify-between border-b border-border py-4 transition-colors hover:bg-secondary/60 " +
                      (selectedCoin === crypto.symbol ? "bg-secondary/40" : "")
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            meta?.color ?? "var(--muted-foreground)",
                        }}
                      />
                      <span className="font-mono text-sm font-medium text-foreground">
                        {crypto.symbol}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {Number(crypto.holdings ?? 0).toFixed(6)}
                      </span>
                    </span>

                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-sm tabular-nums text-foreground">
                        ${formatPrice(Number(crypto.price ?? 0))}
                      </span>
                      <span
                        className={
                          "w-16 text-right font-mono text-xs tabular-nums " +
                          changeClass
                        }
                      >
                        {change > 0 ? "+" : ""}
                        {change.toFixed(2)}%
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-normal tracking-[-0.02em] text-foreground">
              Recent orders
            </h2>
            <Link
              to="/history"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <ul className="mt-6">
              {recentOrders.map((order) => (
                <li
                  key={order._id}
                  className="flex items-center justify-between gap-4 border-b border-border py-4"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={
                        "font-mono text-[11px] uppercase tracking-[0.12em] " +
                        (order.side === "buy" ? "text-up" : "text-down")
                      }
                    >
                      {order.side}
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {order.asset}
                    </span>
                    <span className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                      {Number(order.originalAmount ?? 0).toFixed(6)}
                    </span>
                  </span>

                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {String(order.status).replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
