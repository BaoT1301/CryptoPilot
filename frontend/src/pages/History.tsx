// src/pages/History.tsx
import { useQuery } from "@tanstack/react-query";
import { getTradeHistory } from "@/api/history";
import { mapApiToRow, type HistoryRow } from "@/utils/history-mapper";
import type { TradeSide, TradeStatus } from "@/types/history";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { RotateCcw } from "lucide-react";

export default function History() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trade-history"],
    queryFn: getTradeHistory,
  });

  const rows: HistoryRow[] = data ? data.map(mapApiToRow) : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:px-0">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Trade history
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Loaded from backend
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading history…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{(error as Error).message}</p>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm backdrop-blur">
        <div className="border-b border-border bg-muted/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent orders
        </div>

        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">Time</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Order ID
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Pair</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Side</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">
                  Price (USDT)
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right">
                  Amount
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Fee</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {row.date}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                    {row.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-medium">{row.pair}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <SidePill side={row.side} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {row.price}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {row.amount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {row.fee}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}

              {rows.length === 0 && !isLoading && !error && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    No history yet. Seed some data on the backend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-4 py-2 text-xs text-muted-foreground">
          <span>Showing {rows.length} orders</span>
        </footer>
      </section>
    </div>
  );
}
function StatusBadge({ status }: { status: TradeStatus }) {
  switch (status) {
    case "Filled":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30">
          {status}
        </Badge>
      );

    case "Partially Filled":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/30">
          {status}
        </Badge>
      );

    case "Cancelled":
    default:
      return (
        <Badge className="bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30">
          {status}
        </Badge>
      );
  }
}
function SidePill({ side }: { side: TradeSide }) {
  return (
    <Badge
      variant="secondary"
      className={
        side === "BUY"
          ? "bg-emerald-500/15 text-emerald-600"
          : "bg-rose-500/15 text-rose-600"
      }
    >
      {side}
    </Badge>
  );
}
