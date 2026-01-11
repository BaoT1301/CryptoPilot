import { useEffect, useMemo, useState } from "react";
import {
  createDeposit,
  createWithdraw,
  getAssets,
  getDeposit,
  getDepositById,
  getListWithdraw,
  getWithdraw,
} from "@/api/wallet/walletAPI";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepositHistory } from "@/components/wallet/walletHistory";
import { WalletOverview } from "@/components/wallet/walletOverview";
import { CreateDepositCard } from "@/components/wallet/walletCreate";
import { DepositDetailsCard } from "@/components/wallet/walletDetail";
import { Spinner } from "@/components/ui/spinner";
import type {
  Asset,
  CreateWithdraw,
  Deposit,
  NetworkKey,
  WithdrawListResponse,
} from "@/types/wallet";
import { WithdrawDetailsCard } from "@/components/wallet/walletWithdraw";
import { WithdrawCreateCard } from "@/components/wallet/walletWithdrawCreate";
import { WithdrawHistory } from "@/components/wallet/walletWithdrawHistory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function WalletPage() {
  const [tab, setTab] = useState<"wallet" | "deposit" | "withdraw">("wallet");

  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(
    null
  );
  const [selectedWithdrawId, setSelectedWithdrawId] = useState<string | null>(
    null
  );

  const [withdrawAsset, setWithdrawAsset] = useState("");
  const [withdrawNetwork, setWithdrawNetwork] = useState<NetworkKey | "">("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");

  const [assetSymbol, setAssetSymbol] = useState("BTC");
  const [networkKey, setNetworkKey] = useState<NetworkKey>("bitcoin");
  const [amount, setAmount] = useState("");

  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  const {
    data,
    isPending,
    error: depositErrors,
    isError,
  } = useQuery({
    queryKey: ["deposits", page],
    queryFn: () =>
      getDeposit({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    refetchInterval: 3000,
  });

  const deposits: Deposit[] = data?.data ?? [];
  const hasNext = deposits.length === PAGE_SIZE;
  const hasPrev = page > 1;

  const { data: selectedDeposit, error: depositError } = useQuery({
    queryKey: ["deposit", selectedDepositId],
    queryFn: () => getDepositById(selectedDepositId!),
    enabled: !!selectedDepositId,
    refetchInterval: 2000,
  });

  const selectedAsset = useMemo<Asset | null>(() => {
    return assets.find((a) => a.symbol === assetSymbol) ?? null;
  }, [assets, assetSymbol]);

  const selectedNetwork = useMemo(() => {
    if (!selectedAsset) return null;
    return selectedAsset.networks.find((n) => n.key === networkKey) ?? null;
  }, [selectedAsset, networkKey]);

  useEffect(() => {
    if (!selectedAsset) return;
    if (!selectedNetwork) {
      setNetworkKey(selectedAsset.networks[0].key);
    }
  }, [selectedAsset, selectedNetwork]);

  const createMutation = useMutation({
    mutationFn: createDeposit,
    onSuccess: (deposit) => {
      queryClient.invalidateQueries({ queryKey: ["deposits"] });
      setSelectedDepositId(deposit._id);
      setTab("deposit");
      setAmount("");
      setPage(1);
    },
  });

  //withdraw

  const balancesByAssetNetwork = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};

    deposits
      .filter((d) => d.status === "COMPLETED")
      .forEach((d) => {
        if (!map[d.asset]) map[d.asset] = {};
        map[d.asset][d.network] =
          (map[d.asset][d.network] || 0) + Number(d.amount);
      });

    return map;
  }, [deposits]);

  // get only assets that have balance > 0
  const withdrawableAssets = useMemo(() => {
    return assets.filter((asset) =>
      Object.values(balancesByAssetNetwork[asset.symbol] || {}).some(
        (v) => v > 0
      )
    );
  }, [assets, balancesByAssetNetwork]);

  // get only networks with balance > 0 for selected asset
  const withdrawableNetworks = useMemo(() => {
    if (!withdrawAsset) return [];

    return Object.entries(balancesByAssetNetwork[withdrawAsset] || {})
      .filter(([, amount]) => amount > 0)
      .map(([network]) => network as NetworkKey);
  }, [withdrawAsset, balancesByAssetNetwork]);

  // get current available balance
  const availableBalance = useMemo(() => {
    return balancesByAssetNetwork[withdrawAsset]?.[withdrawNetwork] ?? 0;
  }, [balancesByAssetNetwork, withdrawAsset, withdrawNetwork]);

  // auto-select first available asset/network
  useEffect(() => {
    if (withdrawableAssets.length === 0) return;
    if (
      !withdrawAsset ||
      !withdrawableAssets.find((a) => a.symbol === withdrawAsset)
    ) {
      setWithdrawAsset(withdrawableAssets[0].symbol);
    }
  }, [withdrawableAssets, withdrawAsset]);

  useEffect(() => {
    if (withdrawableNetworks.length === 0) return;
    if (!withdrawNetwork || !withdrawableNetworks.includes(withdrawNetwork)) {
      setWithdrawNetwork(withdrawableNetworks[0]);
    }
  }, [withdrawableNetworks, withdrawNetwork]);

  // get selected asset/network objects
  const selectedWithdrawAsset = useMemo<Asset | null>(() => {
    return withdrawableAssets.find((a) => a.symbol === withdrawAsset) ?? null;
  }, [withdrawableAssets, withdrawAsset]);

  const selectedWithdrawNetwork = useMemo(() => {
    if (!selectedWithdrawAsset) return null;
    return (
      selectedWithdrawAsset.networks.find((n) => n.key === withdrawNetwork) ??
      null
    );
  }, [selectedWithdrawAsset, withdrawNetwork]);

  // get withdraw list
  const { data: withdrawData } = useQuery<WithdrawListResponse>({
    queryKey: ["withdraws", page],
    queryFn: () =>
      getListWithdraw({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    refetchInterval: 3000,
  });

  const withdraws = withdrawData?.data ?? [];

  // get single withdraw details
  const { data: selectedWithdraw } = useQuery({
    queryKey: ["withdraw", selectedWithdrawId],
    queryFn: () => getWithdraw(selectedWithdrawId!),
    enabled: !!selectedWithdrawId,
    refetchInterval: 2000,
  });

  // create withdraw mutation
  const createWithdrawMutation = useMutation({
    mutationFn: createWithdraw,
    onSuccess: (withdraws) => {
      queryClient.invalidateQueries({ queryKey: ["withdraws"] });
      queryClient.invalidateQueries({ queryKey: ["deposits"] }); // refresh balances
      setSelectedWithdrawId(withdraws._id);
      setWithdrawAmount("");
      setWithdrawAddress("");
      setPage(1);
    },
  });

  //error
  const errorMessage = depositErrors || depositError || createMutation.error;
  if (isPending && page === 1) {
    return (
      <div className="min-h-screen w-full bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Spinner className="size-4" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen w-full bg-background p-4 md:p-8">
        <div className="mx-auto max-w-5xl space-y-4">
          {errorMessage && (
            <div className="rounded-2xl border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {String(errorMessage.message)}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Wallet</h1>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="rounded-2xl">
            <TabsTrigger value="wallet" className="rounded-2xl">
              Overview
            </TabsTrigger>
            <TabsTrigger value="deposit" className="rounded-2xl">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-2xl">
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <WalletOverview
              deposits={deposits}
              withdraw={withdraws}
              assets={assets}
              onOpenDeposit={(id) => {
                setSelectedDepositId(id);
                setTab("deposit");
              }}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onNext={() => setPage((p) => p + 1)}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              isLoading={isPending}
              currentPage={page}
            />
          </TabsContent>

          <TabsContent value="deposit" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {selectedAsset && selectedNetwork && (
                <CreateDepositCard
                  assets={assets}
                  assetSymbol={assetSymbol}
                  setAssetSymbol={setAssetSymbol}
                  networkKey={networkKey}
                  setNetworkKey={setNetworkKey}
                  amount={amount}
                  setAmount={setAmount}
                  isCreating={createMutation.isPending}
                  onCreate={() =>
                    createMutation.mutate({
                      asset: assetSymbol,
                      network: networkKey,
                      amount: amount || undefined,
                    })
                  }
                />
              )}
              <DepositDetailsCard deposit={selectedDeposit ?? null} />
            </div>

            <DepositHistory
              deposits={deposits}
              selectedId={selectedDepositId}
              onSelect={setSelectedDepositId}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onNext={() => setPage((p) => p + 1)}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              isLoading={isPending}
              currentPage={page}
            />
          </TabsContent>
          <TabsContent value="withdraw" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {selectedWithdrawAsset && selectedWithdrawNetwork && (
                <WithdrawCreateCard
                  withdrawableAssets={withdrawableAssets}
                  withdrawableNetworks={withdrawableNetworks}
                  selectedAsset={selectedWithdrawAsset}
                  selectedNetwork={selectedWithdrawNetwork}
                  assetSymbol={withdrawAsset}
                  setAssetSymbol={setWithdrawAsset}
                  networkKey={withdrawNetwork}
                  setNetworkKey={setWithdrawNetwork}
                  amount={withdrawAmount}
                  setAmount={setWithdrawAmount}
                  address={withdrawAddress}
                  setAddress={setWithdrawAddress}
                  availableBalance={availableBalance}
                  isSubmitting={createWithdrawMutation.isPending}
                  onSubmit={() => {
                    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
                    if (Number(withdrawAmount) > availableBalance) return;
                    if (!withdrawAddress.trim()) return;

                    const withdrawData: CreateWithdraw = {
                      asset: withdrawAsset,
                      network: withdrawNetwork,
                      address: withdrawAddress,
                      amount: withdrawAmount,
                      //fee: selectedWithdrawNetwork?.withdrawalFee ?? 0,
                      fee: 0,
                      confirmations: 0,
                      status: "PENDING",
                      createdAt: new Date(),
                      processedAt: null,
                      completedAt: null,
                    };

                    createWithdrawMutation.mutate(withdrawData);
                  }}
                />
              )}
              <WithdrawDetailsCard withdraw={selectedWithdraw ?? null} />
            </div>
            <WithdrawHistory
              withdraws={withdraws}
              selectedId={selectedWithdrawId}
              onSelect={setSelectedWithdrawId}
              hasNext={withdraws.length === PAGE_SIZE}
              hasPrev={hasPrev}
              onNext={() => setPage((p) => p + 1)}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              isLoading={isPending}
              currentPage={page}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
