import { useEffect, useMemo, useState } from "react";
import { WalletCard } from "@/components/wallet/WalletCard";
import { ActionModal } from "@/components/wallet/ActionModal";
import { TransactionTable } from "@/components/wallet/TransactionTable";
import type { Tx } from "@/components/wallet/types";
import { mockWalletApi } from "@/components/wallet/mockWalletApi";
import { ComputeTotals } from "@/components/wallet/ComputeTotals";

export default function WalletPage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"Deposit" | "Withdraw" | null>(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const totals = useMemo(() => ComputeTotals(txs), [txs]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockWalletApi.fetchTransactions();
      setTxs(data);
    } catch {
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const confirm = async () => {
    if (!mode) return;
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    if (mode === "Withdraw" && n > totals.balance) {
      setActionError("Withdrawal amount exceeds available balance");
      return;
    }

    setActionError(null);
    setSubmitting(true);
    try {
      const created = await mockWalletApi.createTransaction({
        type: mode,
        amount: n,
        note: mode === "Deposit" ? "Deposit" : "Withdraw",
      });
      setTxs(prev => [created, ...prev]);
      setAmount("");
      setMode(null);
    } catch {
      setActionError("Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">My Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your balance and transactions
        </p>
      </header>

      <WalletCard
        txs={txs}
        onDeposit={() => {
          setMode("Deposit");
          setActionError(null);
        }}
        onWithdraw={() => {
          setMode("Withdraw");
          setActionError(null);
        }}/>

      {mode && (
        <ActionModal
          mode={mode}
          amount={amount}
          setAmount={setAmount}
          onClose={() => {
            setMode(null);
            setActionError(null);
          }}
          onConfirm={confirm}
          submitting={submitting}
          error={actionError}
          maxAmount={totals.balance}/>
      )}

        <TransactionTable txs={txs} loading={loading} error={error}onRefresh={loadHistory}/>
    </div>
  );
}