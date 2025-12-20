export interface Tx {
    id: string;
    type: "Deposit" | "Withdraw";
    amount: number;
    date: string;
    note?: string;
  }