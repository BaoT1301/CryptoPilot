import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useConfirmationCountdown } from "@/api/wallet/ultilities";
import type { Deposit } from "@/types/wallet";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Copy, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

function StatusBadge({ status }: { status: Deposit["status"] }) {
  if (status === "COMPLETED") return <Badge>completed</Badge>;
  if (status === "FAILED") return <Badge variant="destructive">failed</Badge>;
  return <Badge variant="secondary">pending</Badge>;
}

function StatusIcon({ status }: { status: Deposit["status"] }) {
  if (status === "COMPLETED") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "FAILED") return <XCircle className="h-5 w-5 text-red-500" />;
  return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
}

function shortenHash(hash: string, length = 10) {
  if (!hash || hash.length <= length * 2 + 3) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

export function DepositDetailsCard({ deposit }: { deposit: Deposit | null }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);
  const confirmations = deposit?.confirmations ?? 0;
  const required = deposit?.networkMeta?.requiredConfirmations ?? 0;
  const blockTime = deposit?.networkMeta?.estimatedBlockTimeSec ?? 60;
  const hasTx = Boolean(deposit?.txHash);

  const { estimatedProgress, remainingSec } = useConfirmationCountdown(
    confirmations,
    required,
    blockTime,
    hasTx
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (!deposit) {
    return (
      <Card>
        <CardContent>
        <Alert>
            <AlertDescription>
              Deposit or click history to view details
            </AlertDescription>
          </Alert>

        </CardContent>
      </Card>
    );
  }

  const progress =
    confirmations > 0
      ? Math.min(100, (confirmations / required) * 100)
      : estimatedProgress;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Deposit Detail</CardTitle>
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {deposit.asset} Deposit
                </h3>
                <StatusBadge status={deposit.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Network: {deposit.network}
              </p>
            </div>
            <StatusIcon status={deposit.status} />
          </div>

          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">Deposit Address</p>
            <div className="mt-1 flex justify-between gap-2">
              <code className="break-all text-sm">{deposit.address}</code>
              <Button size="sm" variant="secondary" onClick={() => copyToClipboard(deposit.address)}>
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border p-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Confirmations</span>
              <span>{confirmations} / {required}</span>
            </div>
            <Progress value={progress} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {deposit.status === "COMPLETED"
                ? "Successfully Completed"
                : confirmations > 0 && confirmations < required
                  ? `Time Remaining: ~${Math.ceil(remainingSec / 60)} min`
                  : hasTx
                    ? `Time Remaining: ~${Math.ceil(remainingSec / 60)} min`
                    : "waiting for transaction"}
            </p>
          </div>

          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p>{deposit.amount}</p>
          </div>
          <div className="rounded-2xl border p-3">
            <p className="text-xs text-muted-foreground">Transaction Hash</p>
            {deposit.txHash ? (
                <p className="text-xs text-muted-foreground">{shortenHash(deposit.txHash, 12)}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Not Generated Yet</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Created: {new Date(deposit.createdAt).toLocaleString()}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
