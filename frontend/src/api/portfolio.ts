import { apiCall } from "./http";

export interface PortfolioAsset {
  symbol: "BTC" | "ETH" | "BNB" | "SOL";
  name: string;
  balance: number;
  currentPrice: number;
  value: number;
  change24h: number;
}

export interface PortfolioResponse {
  portfolio: PortfolioAsset[];
  totalValue: number;
  totalAssets: number;
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  return apiCall<PortfolioResponse>("/profile/portfolio", "GET");
}
