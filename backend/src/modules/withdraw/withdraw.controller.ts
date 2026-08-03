import { handleError } from "../../utils/error";
import { AuthRequest } from "../authentication/auth.types";
import { Network, NetworkKey } from "../constantAssets/asset.model";
import { Response, Request } from "express";
import { createWithdraw, getListWithDraw, getWithdraw, updateWithDraw } from "./withdraw.service";

function parsePagination(req: Request) {
    const limitRaw = req.query.limit;
    const offsetRaw = req.query.offset;
  
    const limit = typeof limitRaw === "string" ? Number(limitRaw) : 50;
    const offset = typeof offsetRaw === "string" ? Number(offsetRaw) : 0;
  
    return {
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(200, limit)) : 50,
      offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
    };
}
function isNetworkKey(value: string): value is NetworkKey {
    return value in Network;
}

export const createWithdrawInput = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Balances are computed as (deposits - withdrawals), so an unvalidated
    // amount was directly exploitable:
    //   "-100"  -> balance = 0 - (-100) = +100. Free money.
    //   "abc"   -> parseFloat gives NaN, and Math.max(0, NaN) is NaN, which
    //              permanently poisons that asset's balance with no way back.
    const { amount, network, asset, address } = req.body ?? {};
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res
            .status(400)
            .json({ message: "amount must be a positive number" });
    }
    if (typeof network !== "string" || !isNetworkKey(network)) {
        return res.status(400).json({ message: "Unsupported network" });
    }
    if (typeof asset !== "string" || !asset.trim()) {
        return res.status(400).json({ message: "asset is required" });
    }
    if (typeof address !== "string" || !address.trim()) {
        return res.status(400).json({ message: "address is required" });
    }

    try{
        const data = await createWithdraw(userId, {
            ...req.body,
            amount: numericAmount,
            network,
            asset,
            address,
        })
        return res.status(200).json(data)
    }
    catch(err){
        return handleError(res, err)
    }
}

export const getWithdrawById = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const data = await getWithdraw(req.params.id);

        if (!data) {
            return res.status(404).json({ message: "Withdrawal not found" });
        }
        // Ownership check -- this previously returned any user's withdrawal.
        if (data.userId !== userId) {
            return res.status(404).json({ message: "Withdrawal not found" });
        }

        // The old guard was `if (data?.network && !isNetworkKey(...))`, so a
        // missing/empty network skipped it and Network[undefined] threw a
        // TypeError on the next line, surfacing as a 500.
        if (!data.network || !isNetworkKey(data.network)) {
            return res.status(422).json({ message: "Invalid network key" });
        }

        const chain = Network[data.network]
        return res.status(200).json({...data,
            networkMeta: {
            requiredConfirmations: chain.requiredConfirmations,
            estimatedBlockTimeSec: chain.estimatedBlockTimeSec,
        }});
    } catch (err) {
        return handleError(res, err);
    }
}

export const getListWithdraws = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try{
        const query = {
            userId
        }
        const { limit, offset } = parsePagination(req);
        const data = await getListWithDraw(query, { limit, offset })
        return res.status(200).json({ data, limit, offset });
    }
    catch(err){
        return handleError(res, err)
    }
    
}
export const updateWithDrawInput = async (req: Request, res: Response) => {
    try{
        const id = req.params.id;
        const updated = await updateWithDraw(id, req.body);
        return res.status(200).json(updated)
    }
    catch(err){
        return handleError(res, err)
    }
}