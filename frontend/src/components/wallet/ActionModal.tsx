import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Spinner } from "../ui/spinner";

export function ActionModal({
  mode,
  amount,
  setAmount,
  onClose,
  onConfirm,
  submitting,
  error,
}: {
  mode: "Deposit" | "Withdraw";
  amount: string;
  setAmount: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  submitting?: boolean;
  error?: string | null;
  maxAmount?: number;
}) {
  const n = Number(amount);
  const canSubmit = Number.isFinite(n) && n > 0 && !submitting;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{mode} Funds</DialogTitle>
          <DialogDescription>
            {mode === "Withdraw"
              ? "Withdrawal must not exceed available balance"
              : "Enter the amount to deposit"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
            <Input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              inputMode="decimal"/>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={onConfirm}
                disabled={!canSubmit}>
                {submitting
                  ? (<Spinner className="mx-auto" />)
                  : mode === "Deposit"
                  ? "Deposit"
                  : "Withdraw"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={onClose}
                disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
