import type { Tx } from "./types";

export const mockWalletApi = {
  async fetchTransactions(): Promise<Tx[]> {
    await new Promise(r => setTimeout(r, 400));
    return [
      {
        id: "ord_1001",
        type: "Deposit",
        amount: 250,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toLocaleString(),
      },
      {
        id: "ord_1002",
        type: "Withdraw",
        amount: 50,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toLocaleString(),
      },
      {
        id: "ord_1003",
        type: "Deposit",
        amount: 1200,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toLocaleString(),
      },
    ];
  },

  async createTransaction(tx: Omit<Tx, "id" | "date">): Promise<Tx> {
    await new Promise(r => setTimeout(r, 300));
    return {
      ...tx,
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toLocaleString(),
    };
  },
};