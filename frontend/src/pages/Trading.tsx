import { useState, useEffect } from "react";
import { SOCKET_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { createOrder, getOrders, cancelOrder, getOrderBook } from "@/api/order";
import type {
  Order,
  OrderBook,
  Asset,
  OrderType,
  OrderSide,
} from "@/types/order";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { ASSETS, formatPrice } from "@/components/landing/useLiveMarket";

export default function Trading() {
  const { authenticated } = useAuth();
  const navigate = useNavigate();

  // Order form state
  const [selectedAsset, setSelectedAsset] = useState<Asset>("BTC");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [orderSide, setOrderSide] = useState<OrderSide>("buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Orders state
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [livePrices, setLivePrices] = useState({
    BTC: 0,
    ETH: 0,
    BNB: 0,
    SOL: 0,
  });

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
      return;
    }

    // Connect to WebSocket
    const newSocket = io(SOCKET_URL);

    newSocket.on("priceUpdate", (prices) => {
      setLivePrices({
        BTC: Number(prices.BTC),
        ETH: Number(prices.ETH),
        BNB: Number(prices.BNB),
        SOL: Number(prices.SOL),
      });
    });

    newSocket.on("orderCreated", () => {
      loadOrders();
      loadOrderBook();
    });

    newSocket.on("orderFilled", () => {
      loadOrders();
      loadOrderBook();
    });

    newSocket.on("orderCancelled", () => {
      loadOrders();
      loadOrderBook();
    });

    loadOrders();
    loadOrderBook();

    return () => {
      newSocket.disconnect();
    };
  }, [authenticated]);

  const loadOrders = async () => {
    try {
      const orders = await getOrders();
      setMyOrders(
        orders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err: any) {
      console.error("Failed to load orders:", err);
    }
  };

  const loadOrderBook = async () => {
    try {
      const book = await getOrderBook(selectedAsset);
      setOrderBook(book);
    } catch (err: any) {
      console.error("Failed to load order book:", err);
    }
  };

  useEffect(() => {
    loadOrderBook();
  }, [selectedAsset]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const orderData: any = {
        asset: selectedAsset,
        type: orderType,
        side: orderSide,
        amount: parseFloat(amount),
      };

      if (orderType === "limit") {
        orderData.limitPrice = parseFloat(limitPrice);
      }

      const order = await createOrder(orderData);
      setSuccess(`Order created successfully! ID: ${order.id.slice(0, 8)}...`);
      setAmount("");
      setLimitPrice("");
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      setSuccess("Order cancelled successfully!");
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
    }
  };

  const currentPrice = livePrices[selectedAsset];
  const estimatedTotal =
    orderType === "market"
      ? parseFloat(amount || "0") * currentPrice
      : parseFloat(amount || "0") * parseFloat(limitPrice || "0");

  const assetMeta = Object.fromEntries(ASSETS.map((a) => [a.key, a]));
  const activeAsset = assetMeta[selectedAsset];

  // Depth bars are drawn proportional to the largest resting size on either
  // side, so the two halves of the book share one scale and can be compared.
  const asks = orderBook?.asks?.slice(0, 8) ?? [];
  const bids = orderBook?.bids?.slice(0, 8) ?? [];
  const maxSize = Math.max(
    1e-9,
    ...asks.map((a) => Number(a.remainingAmount) || 0),
    ...bids.map((b) => Number(b.remainingAmount) || 0)
  );

  const openOrders = myOrders.filter(
    (o) => o.status === "open" || o.status === "partially_filled"
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-10">
      {/* Feedback is fixed rather than living in the ticket column. Cancelling
          an order from the right-hand column used to render its confirmation
          in the left-hand column, potentially off-screen. */}
      {(error || success) && (
        <div
          role="status"
          className={
            "fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border px-5 py-2.5 text-sm shadow-sm " +
            (error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-[color-mix(in_oklch,var(--market-up)_30%,transparent)] bg-[color-mix(in_oklch,var(--market-up)_12%,transparent)] text-[var(--market-up)]")
          }
        >
          {error || success}
        </div>
      )}

      {/* Instrument bar */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: activeAsset?.color }}
            />
            <span className="font-mono text-sm font-medium text-foreground">
              {selectedAsset}
              <span className="text-muted-foreground">/USDT</span>
            </span>
          </div>
          <p className="mt-2 font-mono text-[clamp(1.9rem,4vw,2.75rem)] leading-none tracking-[-0.03em] tabular-nums text-foreground">
            {currentPrice > 0 ? "$" + formatPrice(currentPrice) : "----"}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-full border border-border p-1">
          {ASSETS.map((asset) => (
            <button
              key={asset.key}
              onClick={() => setSelectedAsset(asset.key as typeof selectedAsset)}
              className={
                selectedAsset === asset.key
                  ? "flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 font-mono text-xs text-primary-foreground"
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
      </header>

      {/* Three working columns. The old layout jumped straight from one column
          to three, so every tablet width got a single very tall column. */}
      <div className="grid gap-10 pt-8 md:grid-cols-2 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,380px)]">
        {/* Ticket */}
        <section>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            New order
          </h2>

          <form onSubmit={handleSubmitOrder} className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-1 rounded-full border border-border p-1">
              {(["buy", "sell"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setOrderSide(side)}
                  className={
                    "rounded-full py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors " +
                    (orderSide === side
                      ? side === "buy"
                        ? "bg-[var(--market-up)] text-white"
                        : "bg-[var(--market-down)] text-white"
                      : "text-muted-foreground hover:bg-secondary")
                  }
                >
                  {side}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-full border border-border p-1">
              {(["market", "limit"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={
                    "rounded-full py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors " +
                    (orderType === type
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60")
                  }
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-foreground"
              >
                Amount
              </label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="pr-16 font-mono tabular-nums"
                  required
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                  {selectedAsset}
                </span>
              </div>
            </div>

            {orderType === "limit" && (
              <div className="space-y-2">
                <label
                  htmlFor="limitPrice"
                  className="block text-sm font-medium text-foreground"
                >
                  Limit price
                </label>
                <div className="relative">
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="0.00"
                    className="pr-16 font-mono tabular-nums"
                    required
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                    USDT
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Estimated total</span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {Number.isFinite(estimatedTotal) && estimatedTotal > 0
                  ? "$" +
                    estimatedTotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "-"}
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className={
                "w-full " +
                (orderSide === "buy"
                  ? "bg-[var(--market-up)] text-white hover:bg-[var(--market-up)]/90"
                  : "bg-[var(--market-down)] text-white hover:bg-[var(--market-down)]/90")
              }
            >
              {loading
                ? "Placing"
                : (orderSide === "buy" ? "Buy " : "Sell ") + selectedAsset}
            </Button>
          </form>
        </section>

        {/* Book */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Order book
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              size
            </span>
          </div>

          {/* Asks, worst price at the top so the best sits against the spread,
              which is the conventional reading order for a book. */}
          <ul className="mt-5">
            {asks.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">
                No sell orders resting.
              </li>
            ) : (
              [...asks].reverse().map((ask, i) => (
                <li key={i} className="relative py-1.5">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 right-0 rounded-sm bg-[color-mix(in_oklch,var(--market-down)_16%,transparent)]"
                    style={{
                      width:
                        ((Number(ask.remainingAmount) || 0) / maxSize) * 100 + "%",
                    }}
                  />
                  <span className="relative flex items-center justify-between px-2 font-mono text-sm tabular-nums">
                    <span className="text-down">
                      {Number(ask.price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {Number(ask.remainingAmount).toFixed(6)}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>

          <div className="my-3 flex items-baseline justify-between border-y border-border py-3 px-2">
            <span className="font-mono text-lg tabular-nums text-foreground">
              {currentPrice > 0 ? "$" + formatPrice(currentPrice) : "----"}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              last
            </span>
          </div>

          <ul>
            {bids.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">
                No buy orders resting.
              </li>
            ) : (
              bids.map((bid, i) => (
                <li key={i} className="relative py-1.5">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 right-0 rounded-sm bg-[color-mix(in_oklch,var(--market-up)_16%,transparent)]"
                    style={{
                      width:
                        ((Number(bid.remainingAmount) || 0) / maxSize) * 100 + "%",
                    }}
                  />
                  <span className="relative flex items-center justify-between px-2 font-mono text-sm tabular-nums">
                    <span className="text-up">
                      {Number(bid.price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-muted-foreground">
                      {Number(bid.remainingAmount).toFixed(6)}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Orders. Previously this list was rendered twice on the same screen,
            once as cards and again as an eight column table. */}
        <section className="md:col-span-2 lg:col-span-1">
          <div className="flex items-baseline justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Your orders
            </h2>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {openOrders.length} open
            </span>
          </div>

          {myOrders.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nothing placed yet.
            </p>
          ) : (
            <ul className="mt-5">
              {myOrders.slice(0, 12).map((order) => {
                const filled = Number(order.filledAmount) || 0;
                const total = Number(order.originalAmount) || 0;
                const pct = total > 0 ? (filled / total) * 100 : 0;
                const cancellable =
                  order.status === "open" || order.status === "partially_filled";
                return (
                  <li key={order.id} className="border-b border-border py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2.5">
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
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          {order.type}
                        </span>
                      </span>

                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {String(order.status).replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between gap-3">
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {filled.toFixed(6)} / {total.toFixed(6)}
                      </span>
                      {order.limitPrice ? (
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          @ ${Number(order.limitPrice).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      ) : null}
                    </div>

                    {/* Fill progress, since a partial fill is the state this
                        product is built to represent honestly. */}
                    {pct > 0 && pct < 100 && (
                      <span
                        aria-hidden
                        className="mt-2.5 block h-[3px] w-full overflow-hidden rounded-full bg-secondary"
                      >
                        <span
                          className="block h-full rounded-full bg-[var(--brand)]"
                          style={{ width: pct + "%" }}
                        />
                      </span>
                    )}

                    {cancellable && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-destructive"
                      >
                        Cancel
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
