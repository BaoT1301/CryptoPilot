// walletWithdrawCreate.tsx
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset, NetworkKey } from "@/types/wallet";

type Props = {
  withdrawableAssets: Asset[];
  withdrawableNetworks: NetworkKey[];
  selectedAsset: Asset;
  selectedNetwork: { key: NetworkKey; label: string; requiredConfirmations: number; withdrawalFee?: number } | null;
  assetSymbol: string;
  setAssetSymbol: (s: string) => void;
  networkKey: NetworkKey | "";
  setNetworkKey: (n: NetworkKey) => void;
  amount: string;
  setAmount: (a: string) => void;
  address: string;
  setAddress: (a: string) => void;
  availableBalance: number;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function WithdrawCreateCard({
  withdrawableAssets,
  withdrawableNetworks,
  selectedAsset,
  selectedNetwork,
  assetSymbol,
  setAssetSymbol,
  networkKey,
  setNetworkKey,
  amount,
  setAmount,
  address,
  setAddress,
  availableBalance,
  isSubmitting,
  onSubmit,
}: Props) {
  const fee = selectedNetwork?.withdrawalFee ?? 0;
  const total = Number(amount || 0) + fee;
  const isValid = amount && Number(amount) > 0 && Number(amount) <= availableBalance && address;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Withdraw Crypto</h2>

      <div className="space-y-2">
        <Label>Asset</Label>
        <Select value={assetSymbol} onValueChange={setAssetSymbol}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {withdrawableAssets.map(asset => (
              <SelectItem key={asset.symbol} value={asset.symbol}>
                {asset.name} ({asset.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Network</Label>
        <Select value={networkKey} onValueChange={(v: string) => setNetworkKey(v as NetworkKey)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {withdrawableNetworks.map(net => {
              const network = selectedAsset.networks.find(n => n.key === net);
              return (
                <SelectItem key={net} value={net}>
                  {network?.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Amount</Label>
          <span className="text-sm text-muted-foreground">
            Available: {availableBalance.toFixed(8)} {assetSymbol}
          </span>
        </div>
        <Input
          type="number"
          step="0.00000001"
          placeholder="0.00000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAmount((availableBalance - fee).toString())}
          className="text-xs"
        >
          Max
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Withdrawal Address</Label>
        <Input
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Network Fee</span>
          <span>{fee} {assetSymbol}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{total.toFixed(8)} {assetSymbol}</span>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Withdraw"}
      </Button>
    </Card>
  );
}