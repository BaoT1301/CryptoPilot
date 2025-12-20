import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tx } from "./types.ts";
import { useMemo } from "react";
import { ComputeTotals } from "./ComputeTotals.ts";

export function WalletCard({
    txs,
    onDeposit,
    onWithdraw,
  }: {
    txs: Tx[];
    onDeposit: () => void;
    onWithdraw: () => void;
  }) {
    const { totalDeposit, balance } = useMemo(() => ComputeTotals(txs), [txs]);
    const withdrawDisabled = balance <= 0;
  
    return (
      <Card className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Wallet balance</p>
              <p className="text-3xl font-semibold tabular-nums">${balance.toFixed(2)}</p>
            </div>
          </div>
  
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Total deposited</p>
              <p className="font-medium tabular-nums">${totalDeposit.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">As of</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
  
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={onDeposit}>
              Deposit
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onWithdraw}
              disabled={withdrawDisabled}
              title={withdrawDisabled ? "No available balance" : ""}>
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }