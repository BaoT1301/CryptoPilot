import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

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
    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"
    );

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading</h1>
        <p className="text-muted-foreground">
          Execute market and limit orders in real-time
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {/* Asset Selection */}
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Select
                  value={selectedAsset}
                  onValueChange={(value) => setSelectedAsset(value as Asset)}
                >
                  <SelectTrigger id="asset">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    <SelectItem value="BNB">BNB (BNB)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  Current Price: ${currentPrice.toLocaleString()}
                </div>
              </div>

              {/* Order Type Tabs */}
              <Tabs
                value={orderType}
                onValueChange={(value) => setOrderType(value as OrderType)}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Buy/Sell Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={orderSide === "buy" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderSide("buy")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Buy
                </Button>
                <Button
                  type="button"
                  variant={orderSide === "sell" ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => setOrderSide("sell")}
                >
                  <TrendingDown className="mr-2 h-4 w-4" />
                  Sell
                </Button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({selectedAsset})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Limit Price (only for limit orders) */}
              {orderType === "limit" && (
                <div className="space-y-2">
                  <Label htmlFor="limitPrice">Limit Price (USD)</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}

              {/* Estimated Total */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Estimated Total:
                  </span>
                  <span className="font-semibold">
                    $
                    {estimatedTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950 rounded-lg">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                variant={orderSide === "buy" ? "default" : "destructive"}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${orderSide === "buy" ? "Buy" : "Sell"} ${selectedAsset}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Book - {selectedAsset}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Asks (Sell Orders) */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-destructive">
                  Asks (Sell)
                </h3>
                <div className="space-y-1">
                  {orderBook?.asks.slice(0, 10).map((ask, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm p-2 bg-destructive/5 rounded"
                    >
                      <span className="text-destructive font-mono">
                        ${ask.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {ask.remainingAmount.toFixed(8)}
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">
                      No sell orders
                    </p>
                  )}
                </div>
              </div>

              {/* Current Price Divider */}
              <div className="py-2 text-center border-y">
                <div className="text-2xl font-bold">
                  ${currentPrice.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Current Market Price
                </div>
              </div>

              {/* Bids (Buy Orders) */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-green-600">
                  Bids (Buy)
                </h3>
                <div className="space-y-1">
                  {orderBook?.bids.slice(0, 10).map((bid, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm p-2 bg-green-500/5 rounded"
                    >
                      <span className="text-green-600 font-mono">
                        ${bid.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {bid.remainingAmount.toFixed(8)}
                      </span>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">
                      No buy orders
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {myOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders yet
                </p>
              ) : (
                myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {order.side.toUpperCase()} {order.asset}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.type.toUpperCase()} Order
                        </div>
                      </div>
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
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span>{Number(order.amount).toFixed(8)}</span>
                      </div>
                      {order.limitPrice && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Limit Price:
                          </span>
                          <span>${order.limitPrice}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filled:</span>
                        <span>
                          {Number(order.filledAmount).toFixed(8)} /{" "}
                          {Number(order.amount).toFixed(8)}
                        </span>
                      </div>
                      {order.executionPrice && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Avg Price:
                          </span>
                          <span>
                            $
                            {Number(order.executionPrice).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    {(order.status === "open" ||
                      order.status === "partially_filled") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                myOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.asset}
                    </TableCell>
                    <TableCell className="capitalize">{order.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.side === "buy" ? "default" : "destructive"
                        }
                      >
                        {order.side.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      {order.executionPrice
                        ? `$${order.executionPrice}`
                        : order.limitPrice
                        ? `$${order.limitPrice}`
                        : "Market"}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {order.filledAmount} / {order.amount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
