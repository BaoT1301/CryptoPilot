import { Button } from "../ui/button";
import type { Tx } from "./types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
export function TransactionTable({
  txs,
  loading,
  error,
  onRefresh,
}: {
  txs: Tx[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}) {
  return (
    <div className="mx-auto flex flex-col gap-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Transaction history</h2>
        </div>

        {onRefresh && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              className="rounded-full border border-border bg-background/60 px-3 py-1.5 font-medium hover:bg-accent hover:text-accent-foreground">
              Refresh
            </Button>
          </div>
        )}
      </header>

      {loading && <p className="text-sm text-muted-foreground">Loading history…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-border bg-card/80 shadow-sm backdrop-blur">
        <div className="border-b border-border bg-muted/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent transactions
        </div>

        <div className="w-full overflow-x-auto">
          <Table className="min-w-full divide-y divide-border text-sm">
            <TableHeader className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <TableRow>
                <TableHead className="whitespace-nowrap px-4 py-3 text-left">Time</TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 text-left">ID</TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 text-left">Type</TableHead>
                <TableHead className="whitespace-nowrap px-4 py-3 text-right">Amount USD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/80">
              {txs.map(t => (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{t.date}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 font-mono text-xs">{t.id}</TableCell>
                  <TableCell
                    className={
                      "whitespace-nowrap px-4 py-3 " +
                      (t.type === "Deposit" ? "text-green-600" : "text-red-600")
                    }>
                    {t.type}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex w-full justify-end gap-1">
                      <span className="w-3 text-right">$</span>
                      <span className="tabular-nums">{t.amount.toFixed(2)}</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {txs.length === 0 && !loading && !error && (
                <tr>
                  <TableCell colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No history yet. Seed some data on the backend.
                  </TableCell>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-4 py-2 text-xs text-muted-foreground">
          <span>Showing {txs.length} transactions</span>
        </footer>
      </section>
    </div>
  );
}
