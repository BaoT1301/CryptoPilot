export type DepositStatus = "PENDING" | "COMPLETED" | "FAILED";

export type NetworkKey = "bitcoin" | "ethereum" | "bsc" | "BNB" | "solana" | "";

export type NetworkConfig = {
  key: NetworkKey;
  label: string;
  addressFormat: "btc" | "evm" | "BNB" | "solana";
  requiredConfirmations: number;
  estimatedBlockTimeSec: number;
};

export type Asset = {
  symbol: string;
  name: string;
  minDeposit: string;
  networks: NetworkConfig[];
};
export type Deposit = {
  _id: string;
  userId: string;
  asset: string;
  network: string;
  address: string;
  amount: string;
  txHash?: string | null;
  confirmations: number;
  status: DepositStatus;
  createdAt: string;
  updatedAt: string;
  networkMeta: Pick<
    NetworkConfig,
    "requiredConfirmations" | "estimatedBlockTimeSec"
  >;
};

export type ListDepositParams = {
  limit: number;
  offset: number;
};

export type ListDeposit = {
  data: Deposit[];
};

export type CreateDeposit = {
  asset: string;
  network: string;
  amount?: string;
};

export type WithdrawStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type Withdraw = {
  _id: string;
  userId: string;
  asset: string;
  network: NetworkKey;
  address: string;
  amount: string;
  fee: number;
  memo?: string | null;
  txHash?: string | null;
  confirmations: number;
  status: string;
  createdAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
  networkMeta: Pick<
    NetworkConfig,
    "requiredConfirmations" | "estimatedBlockTimeSec"
  >;
};
export type WithdrawListResponse = {
  data: Withdraw[];
  limit: number;
  offset: number;
};
export type ListWithdrawParams = {
  limit: number;
  offset: number;
};

export type CreateWithdraw = {
  asset: string;
  network: NetworkKey;
  address: string;
  amount: string;
  fee: number;
  memo?: string | null;
  txHash?: string | null;
  confirmations: number;
  status: string;
  createdAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
};
