import { Network, NetworkKey } from "../constantAssets/asset.model";
import { depositModel } from "./deposit.model";

function fakeTxHash() {
  return (
    "0x" +
    Math.random().toString(16).slice(2).padEnd(64, "0")
  );
}

function isNetworkKey(value: string): value is NetworkKey {
  return value in Network;
}

export function startDepositWatcher() {
  setInterval(async () => {
    try {
    const deposits = await depositModel.findMany({status: 'PENDING'});

    for (const dep of deposits) {
      if (!isNetworkKey(dep.network)) {
        continue;
      }
      const chain = Network[dep.network];
      if (!chain) continue;

      if (!dep.txHash) {
        if (Math.random() < 0.7) continue;

        const initialConfirmations = 1;
        
        await depositModel.updateById(dep._id.toString(), {
          txHash: fakeTxHash(),
          confirmations: initialConfirmations,
          status: initialConfirmations >= chain.requiredConfirmations
            ? "COMPLETED"
            : "PENDING",
        });

        continue;
      }
      const next = dep.confirmations + 1;


      await depositModel.updateById(dep._id.toString(), {
        confirmations: next,
        status:
          next >= chain.requiredConfirmations
            ? "COMPLETED"
            : "PENDING",
      });
      if (dep.confirmations >= chain.requiredConfirmations) {
        continue;
      }
    }
    } catch (err) {
      // Never let a rejection escape: setInterval does not await this callback,
      // so an unhandled rejection would terminate the process on Node >= 15.
      console.error("[depositWatcher] tick failed:", err);
    }
  }, 15_000);
}