import type { Asset, CreateDeposit, CreateWithdraw, Deposit, ListDeposit,ListDepositParams, ListWithdrawParams, Withdraw, WithdrawListResponse } from "@/types/wallet";
import { apiCall } from "../http";

export async function createDeposit(input: CreateDeposit) : Promise<Deposit> {
    return apiCall<Deposit>("/deposit", "POST", input)
}

export async function getDeposit(params: ListDepositParams):Promise<ListDeposit>{
    const { limit, offset } = params;
    return apiCall<ListDeposit>(`/deposit?limit=${limit}&offset=${offset}`, "GET")
}

export async function getDepositById(id: string):Promise<Deposit>{
    return apiCall<Deposit>(`/deposit/${id}`, "GET")
}

export async function getAssets():Promise<Asset[]>{
    return apiCall<Asset[]>(`/asset`, "GET")
}


//Withdraw
export async function createWithdraw(input: CreateWithdraw): Promise<Withdraw>{
    return apiCall<Withdraw>("/withdraw","POST", input)
}

export async function getListWithdraw(params: ListWithdrawParams): Promise<WithdrawListResponse> {
    const { limit, offset } = params;
    const response = await apiCall<{ data: Withdraw[], limit: number, offset: number }>(`/withdraw?limit=${limit}&offset=${offset}`, "GET");
    return response; 
  }

export async function getWithdraw(id: string): Promise<Withdraw>{
    return apiCall<Withdraw>(`/withdraw/${id}`, "GET")
}