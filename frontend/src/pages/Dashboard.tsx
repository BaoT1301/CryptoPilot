import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);

  const [selectedCoin, setSelectedCoin] = useState("BTC");

  const [livePrices, setLivePrices] = useState({
    BTC: 0,
    ETH: 0,
    XRP: 0,
    SOL: 0,
  });

  const [priceChartData, setPriceChartData] = useState<
    Array<{
      date: string;
      BTC: number;
      ETH: number;
      SOL: number;
      XRP: number;
    }>
  >([]);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"
    );

    socket.on("priceUpdate", (prices) => {
      setIsConnected(true);

      setLivePrices({
        BTC: Number(prices.BTC),
        ETH: Number(prices.ETH),
        XRP: Number(prices.XRP),
        SOL: Number(prices.SOL),
      });

      setPriceChartData((prev) => {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        return [
          ...prev,
          {
            date: timeLabel,
            BTC: Number(prices.BTC) || 0,
            ETH: Number(prices.ETH) || 0,
            XRP: Number(prices.XRP) || 0,
            SOL: Number(prices.SOL) || 0,
          },
        ].slice(-20);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const cryptos = [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      price: livePrices.BTC,
      change: 1.8,
      holdings: 0.15,
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      price: livePrices.ETH,
      change: -2.1,
      holdings: 2.5,
    },
    {
      id: 3,
      name: "XRP",
      symbol: "XRP",
      price: livePrices.XRP,
      change: 12.5,
      holdings: 1500,
    },
    {
      id: 4,
      name: "Solana",
      symbol: "SOL",
      price: livePrices.SOL,
      change: -3.4,
      holdings: 8,
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "Buy",
      crypto: "XRP",
      amount: 500,
      price: 1.95,
      date: "Nov 27, 10:30 AM",
    },
    {
      id: 2,
      type: "Buy",
      crypto: "SOL",
      amount: 3,
      price: 140,
      date: "Nov 27, 8:15 AM",
    },
    {
      id: 3,
      type: "Sell",
      crypto: "BTC",
      amount: 0.05,
      price: 88500,
      date: "Nov 26, 4:45 PM",
    },
    {
      id: 4,
      type: "Buy",
      crypto: "ETH",
      amount: 1,
      price: 2980,
      date: "Nov 26, 2:20 PM",
    },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold">Connecting to live market…</p>
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

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Total Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$18,850</p>
              <p className="text-green-600 text-sm mt-2">+7.0% ($1,240)</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                24h Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">+$485</p>
              <p className="text-gray-500 text-sm mt-2">+2.6% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cryptos.length}</p>
              <p className="text-gray-500 text-sm mt-2">Cryptocurrencies</p>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <Card className="mb-8 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Live Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceChartData}>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name,
                  ]}
                />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="BTC"
                  stroke="#F7931A"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  opacity={selectedCoin === "BTC" ? 1 : 0.15}
                />

                <Line
                  type="monotone"
                  dataKey="ETH"
                  stroke="#627EEA"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  opacity={selectedCoin === "ETH" ? 1 : 0.15}
                />

                <Line
                  type="monotone"
                  dataKey="SOL"
                  stroke="#14F195"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  opacity={selectedCoin === "SOL" ? 1 : 0.15}
                />

                <Line
                  type="monotone"
                  dataKey="XRP"
                  stroke="#23292F"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  opacity={selectedCoin === "XRP" ? 1 : 0.15}
                />
              </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing last {priceChartData.length} updates
            </p>
          </CardContent>
        </Card>

        {/* Two Column Layout: Holdings + Recent Transactions */}
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
                        ? "bg-gray-200 border-l-4 border-primary"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{crypto.name}</p>
                      <p className="text-sm text-gray-500">
                        {crypto.holdings} {crypto.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${crypto.price.toLocaleString()}
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

          {/* Recent Transactions */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 hover:bg-gray-100 rounded transition-colors duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          transaction.type === "Buy"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className="font-bold">{transaction.crypto}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {transaction.amount} {transaction.crypto}
                    </p>
                    <p className="text-sm text-gray-500">
                      @${transaction.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
