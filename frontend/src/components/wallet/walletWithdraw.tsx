// walletWithdrawDetail.tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Withdraw, WithdrawStatus } from "@/types/wallet";

type Props = {
  withdraw: Withdraw | null;
};

export function WithdrawDetailsCard({ withdraw }: Props) {
  if (!withdraw) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a withdrawal to view details
        </p>
      </Card>
    );
  }

  const statusColors: Record<WithdrawStatus, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500",
    PROCESSING: "bg-blue-500/10 text-blue-500",
    COMPLETED: "bg-green-500/10 text-green-500",
    FAILED: "bg-red-500/10 text-red-500",
    CANCELLED: "bg-gray-500/10 text-gray-500",
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Withdrawal Details</h2>
        <Badge className={statusColors[withdraw.status as WithdrawStatus]}>
          {withdraw.status}
        </Badge>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">
            {Number(withdraw.amount).toFixed(8)} {withdraw.asset}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Network</span>
          <span>{withdraw.network}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Fee</span>
          <span>{withdraw.fee} {withdraw.asset}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Address</span>
          <span className="font-mono text-xs truncate max-w-[200px]">
            {withdraw.address}
          </span>
        </div>

        {withdraw.memo && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Memo</span>
            <span className="font-mono text-xs">{withdraw.memo}</span>
          </div>
        )}

        {withdraw.txHash && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction</span>
            <span className="font-mono text-xs truncate max-w-[200px]">
              {withdraw.txHash}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Confirmations</span>
          <span>
            {withdraw.confirmations} / {withdraw.networkMeta.requiredConfirmations}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Created</span>
          <span>{new Date(withdraw.createdAt).toLocaleString()}</span>
        </div>

        {withdraw.processedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Processed</span>
            <span>{new Date(withdraw.processedAt).toLocaleString()}</span>
          </div>
        )}

        {withdraw.completedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed</span>
            <span>{new Date(withdraw.completedAt).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}