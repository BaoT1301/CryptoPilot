import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { TrendingUp, ArrowRight, Maximize2, Minimize2 } from "lucide-react";

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
      setPortfolio(data.portfolio);
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    }
  };

  // Map portfolio to display format with live prices
  const cryptos = portfolio.map((asset) => ({
    id: asset.symbol,
    name: asset.name,
    symbol: asset.symbol,
    price: livePrices[asset.symbol] || asset.currentPrice,
    change: asset.change24h,
    holdings: asset.balance,
    value: asset.value,
  }));

  if (!isConnected && priceChartData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <p className="text-lg font-semibold">Connecting to live market…</p>
            <p className="text-sm mt-2">
              Please ensure the backend server is running
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {SOCKET_URL}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back!</p>
        {/* Price Chart */}
        <Card className="mb-8 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Live Price Chart - {selectedCoin}</span>
                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  ) : (
                    <span className="text-xs text-red-600">Disconnected</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 p-0"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Coin Selector */}
              <div className="flex gap-2">
                <Button
                  variant={selectedCoin === "BTC" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("BTC")}
                  className="font-semibold"
                >
                  <span
                    className="mr-2"
                    style={{ color: selectedCoin === "BTC" ? "" : "#F7931A" }}
                  >
                    ●
                  </span>
                  BTC
                </Button>
                <Button
                  variant={selectedCoin === "ETH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("ETH")}
                  className="font-semibold"
                >
                  <span
                    className="mr-2"
                    style={{ color: selectedCoin === "ETH" ? "" : "#162975ff" }}
                  >
                    ●
                  </span>
                  ETH
                </Button>
                <Button
                  variant={selectedCoin === "SOL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("SOL")}
                  className="font-semibold"
                >
                  <span
                    className="mr-2"
                    style={{ color: selectedCoin === "SOL" ? "" : "#167b51ff" }}
                  >
                    ●
                  </span>
                  SOL
                </Button>
                <Button
                  variant={selectedCoin === "BNB" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCoin("BNB")}
                  className="font-semibold"
                >
                  <span
                    className="mr-2"
                    style={{ color: selectedCoin === "BNB" ? "" : "#F3BA2F" }}
                  >
                    ●
                  </span>
                  BNB
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {priceChartData.length === 0 ? (
              <div
                className={`flex items-center justify-center text-muted-foreground ${
                  isFullscreen ? "h-[calc(100vh-200px)]" : "h-[300px]"
                }`}
              >
                <div className="text-center space-y-2">
                  <p>Waiting for price data...</p>
                  <p className="text-xs">
                    The chart will appear once prices are received
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={isFullscreen ? 800 : 500}
              >
                <LineChart
                  data={priceChartData.map((point) => {
                    if (!baselinePrices)
                      return {
                        date: point.date,
                        BTC: 100,
                        ETH: 100,
                        SOL: 100,
                        BNB: 100,
                      };
                    // Normalize each coin to base 100
                    return {
                      date: point.date,
                      BTC: (point.BTC / baselinePrices.BTC) * 100,
                      ETH: (point.ETH / baselinePrices.ETH) * 100,
                      SOL: (point.SOL / baselinePrices.SOL) * 100,
                      BNB: (point.BNB / baselinePrices.BNB) * 100,
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toFixed(2)}
                    label={{
                      value: "Index (Base = 100)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12 },
                    }}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                    formatter={(
                      value: number | undefined,
                      name: string | undefined
                    ) => {
                      if (value === undefined || !name) return ["", ""];
                      const coinSymbol = name as "BTC" | "ETH" | "SOL" | "BNB";
                      const currentPrice = livePrices[coinSymbol];
                      const percentChange = (value - 100).toFixed(3);
                      return [
                        `Index: ${value.toFixed(3)} (${
                          percentChange >= "0" ? "+" : ""
                        }${percentChange}%) | Price: $${currentPrice.toLocaleString()}`,
                        name,
                      ];
                    }}
                  />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="BTC"
                    stroke="#F7931A"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                    opacity={selectedCoin === "BTC" ? 1 : 0.15}
                  />

                  <Line
                    type="monotone"
                    dataKey="ETH"
                    stroke="#162975ff"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                    opacity={selectedCoin === "ETH" ? 1 : 0.15}
                  />

                  <Line
                    type="monotone"
                    dataKey="SOL"
                    stroke="#167b51ff"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                    opacity={selectedCoin === "SOL" ? 1 : 0.15}
                  />

                  <Line
                    type="monotone"
                    dataKey="BNB"
                    stroke="#F3BA2F"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                    opacity={selectedCoin === "BNB" ? 1 : 0.15}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing last {priceChartData.length} updates
            </p>
          </CardContent>
        </Card>

        {/* Two Column Layout: Holdings + Recent Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Holdings List */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {cryptos.map((crypto) => {
                const isPositive = crypto.change >= 0;
                const isSelected = selectedCoin === crypto.symbol;

                return (
                  <div
                    key={crypto.id}
                    onClick={() => setSelectedCoin(crypto.symbol)}
                    className={`flex justify-between items-center p-4 rounded transition-colors duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-gray-200 dark:bg-gray-800 border-l-4 border-primary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{crypto.name}</p>
                      <p className="text-sm text-gray-500">
                        {Number(crypto.holdings).toFixed(8)} {crypto.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        $
                        {Number(crypto.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p
                        className={`text-sm ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {crypto.change}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/trading">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button asChild>
                    <Link to="/trading">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Start Trading
                    </Link>
                  </Button>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            order.side === "buy" ? "default" : "destructive"
                          }
                        >
                          {order.side.toUpperCase()}
                        </Badge>
                        <span className="font-bold">{order.asset}</span>
                        <span className="text-sm text-gray-500">
                          {order.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {order.originalAmount} {order.asset}
                      </p>
                      <Badge
                        variant={
                          order.status === "filled"
                            ? "default"
                            : order.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
