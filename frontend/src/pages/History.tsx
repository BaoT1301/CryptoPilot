// src/pages/History.tsx
import { useEffect, useState } from "react";

type TradeSide = "BUY" | "SELL";
type TradeStatus = "Filled" | "Partially Filled" | "Cancelled";

// Shape of data coming from your backend API
type HistoryApiEntry = {
  _id: string;
  account: string;
  type: TradeSide;
  asset: string;
  amount: number;
  price?: number | null;
  status: string; // backend is effectively string, we'll narrow it
  createdAt: string;
  updatedAt: string;
};

// Shape used by your UI table
type HistoryRow = {
  id: string;
  date: string;
  pair: string;
  side: TradeSide;
  price: string;
  amount: string;
  fee: string;
  status: TradeStatus;
};

const API_BASE_URL = "http://localhost:3002/api/history"; // ✅ change port if needed

function StatusBadge({ status }: { status: TradeStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const classes =
    status === "Filled"
      ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
      : status === "Partially Filled"
      ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
      : "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30";

  return <span className={`${base} ${classes}`}>{status}</span>;
}

function SidePill({ side }: { side: TradeSide }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";

  const classes =
    side === "BUY"
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-rose-500/15 text-rose-400";

  return <span className={`${base} ${classes}`}>{side}</span>;
}

// helper to convert backend data → UI row
function mapApiToRow(entry: HistoryApiEntry): HistoryRow {
  const date = new Date(entry.createdAt).toLocaleString();

  const pair = `${entry.asset}/USDT`; // simple convention for display

  const price =
    entry.price != null
      ? entry.price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";

  // simple fixed fee for now
  const fee = "0.10 USDT";

  // narrow the status to our union type; default to "Filled" if unknown
  const status: TradeStatus =
    entry.status === "Filled" ||
    entry.status === "Partially Filled" ||
    entry.status === "Cancelled"
      ? entry.status
      : "Filled";

  return {
    id: entry._id,
    date,
    pair,
    side: entry.type,
    price,
    amount: entry.amount.toString(),
    fee,
    status,
  };
}

export default function History() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE_URL);
      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }

      const data: HistoryApiEntry[] = await res.json();
      setRows(data.map(mapApiToRow));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unknown error");
      }
    }
  };

  // run once on mount
  useEffect(() => {
    loadHistory();
  }, []);

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

        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={loadHistory}
            className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Refresh
          </button>
        </div>
      </header>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading history…</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

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

              {rows.length === 0 && !loading && !error && (
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
