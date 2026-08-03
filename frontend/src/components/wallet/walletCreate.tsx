import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset, NetworkKey } from "@/types/wallet";
import { Loader2 } from "lucide-react";

function isPositiveNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export function CreateDepositCard({
  assets,
  assetSymbol,
  setAssetSymbol,
  networkKey,
  setNetworkKey,
  amount,
  setAmount,
  isCreating,
  onCreate,
}: {
  assets: Asset[];
  assetSymbol: string;
  setAssetSymbol: (v: string) => void;
  networkKey: NetworkKey;
  setNetworkKey: (v: NetworkKey) => void;
  amount: string;
  setAmount: (v: string) => void;
  isCreating: boolean;
  onCreate: () => void;
}) {
  const asset = assets.find(a => a.symbol === assetSymbol)!;
  const network = asset.networks.find(n => n.key === networkKey)!;

  const minDeposit = asset.minDeposit;
  const validAmount = amount === "" || isPositiveNumber(amount);
  const minimum = amount === "" ||Number(amount) >= Number(minDeposit);

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Deposit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset</label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map(a => (
              <SelectItem key={a.symbol} value={a.symbol}>
                {a.symbol} · {a.name}
              </SelectItem>
            ))}
          </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Network</label>
            <Select value={networkKey} onValueChange={(v: NetworkKey) => setNetworkKey(v)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {asset.networks.map(n => (
                  <SelectItem key={n.key} value={n.key}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Required confirmations: {network.requiredConfirmations}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Amount</label>
              <p className="text-xs text-muted-foreground">
                min: {minDeposit} {assetSymbol}
              </p>
            </div>
            <Input
              className="rounded-xl"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Leave empty to accept any amount"
            />
            {!validAmount && (
              <p className="text-xs text-destructive">Amount must be a positive number</p>
            )}
            {!minimum && (
              <p className="text-xs text-destructive">
                Amount below minimum deposit of {minDeposit} {assetSymbol}
              </p>
            )}
          </div>

          <Button
            className="w-full rounded-xl"
            disabled={!minimum}
            onClick={onCreate}>
            {isCreating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </span>
            ) : (
              "Deposit"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>

  );
}


