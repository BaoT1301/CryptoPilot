import type { Tx } from "./types";

export function ComputeTotals(txs: Tx[]) {
    const totalDeposit = txs
      .filter(t => t.type === "Deposit")
      .reduce((a, b) => a + b.amount, 0);
    const totalWithdraw = txs
      .filter(t => t.type === "Withdraw")
      .reduce((a, b) => a + b.amount, 0);
    const balance = totalDeposit - totalWithdraw;
    return { totalDeposit, totalWithdraw, balance };
  }