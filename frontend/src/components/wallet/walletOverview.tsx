import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import type {
  Deposit,
  DepositStatus,
  Withdraw,
  WithdrawStatus,
} from "@/types/wallet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function StatusBadge({ status }: { status: string }) {
  if (status === "COMPLETED") {
    return <Badge className="rounded-full bg-[var(--market-up)]">Completed</Badge>;
  }
  if (status === "FAILED") {
    return (
      <Badge variant="destructive" className="rounded-full">
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full">
      Pending
    </Badge>
  );
}

function StatusType({ type }: { type: string }) {
  return (
    <Badge variant="outline" className="rounded-full">
      {type === "deposit" ? "Deposit" : "Withdraw"}
    </Badge>
  );
}

export function WalletOverview({
  deposits,
  withdraw,
  assets,
  onOpenDeposit,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  isLoading,
  currentPage,
}: {
  deposits?: Deposit[];
  withdraw?: Withdraw[];
  assets: { symbol: string; name: string }[];
  onOpenDeposit: (id: string) => void;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
  currentPage: number;
}) {
  type DepositWithType = Deposit & { type: "deposit" };
  type WithdrawWithType = Withdraw & { type: "withdraw" };

  type Transaction = DepositWithType | WithdrawWithType;

  const depositsList: DepositWithType[] = Array.isArray(deposits)
    ? deposits.map((d) => ({
        ...d,
        type: "deposit" as const,
        status: d.status as DepositStatus,
      }))
    : [];

  const withdrawList: WithdrawWithType[] = Array.isArray(withdraw)
    ? withdraw.map((w) => ({
        ...w,
        type: "withdraw" as const,
        status: w.status as WithdrawStatus,
      }))
    : [];

  const allTransactions: Transaction[] = [...depositsList, ...withdrawList];

  const balances = depositsList
    .filter((d) => d.status === "COMPLETED")
    .reduce((acc, d) => {
      acc[d.asset] = (Number(acc[d.asset] || 0) + Number(d.amount)).toString();
      return acc;
    }, {} as Record<string, string>);

  const assetsWithBalance = assets.filter(
    (a) => Number(balances[a.symbol] || 0) > 0
  );

  return (
    <div>
      {/* Was a Card containing a grid of Cards. Nested elevation says nothing;
          hairlines and space do the grouping. */}
      <section className="space-y-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Balances
        </h2>
        <div className="space-y-3">
          {assetsWithBalance.length === 0 ? (
            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
              No balance yet. Complete deposits to see your balance.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {assetsWithBalance.map((a) => (
                <div
                  key={a.symbol}
                  className="rounded-xl border border-border p-4"
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    {a.symbol}
                  </p>
                  <p className="mt-1.5 font-mono text-xl tabular-nums text-foreground">
                    {Number(balances[a.symbol]).toFixed(8)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.name}</p>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Latest Deposits</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {allTransactions.map((d) => (
                    <button
                      key={d._id}
                      onClick={() => onOpenDeposit(d._id)}
                      className="w-full rounded-xl border p-3 text-left transition hover:bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{d.asset}</span>
                            <span className="text-xs text-muted-foreground">
                              {d.network}
                            </span>
                            <StatusType type={d.type} />
                            <StatusBadge status={d.status} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(d.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm">
                          {Number(d.amount).toFixed(8)}
                        </span>
                      </div>
                    </button>
                  ))}
                  {depositsList.length === 0 && (
                    <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                      No deposits yet. Use the Deposit tab to add funds.
                    </div>
                  )}
                </div>

                {(hasPrev || hasNext) && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={onPrev}
                          aria-disabled={!hasPrev}
                          className={
                            !hasPrev
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <span className="text-sm px-4">{currentPage}</span>
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationNext
                          onClick={onNext}
                          aria-disabled={!hasNext}
                          className={
                            !hasNext
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
