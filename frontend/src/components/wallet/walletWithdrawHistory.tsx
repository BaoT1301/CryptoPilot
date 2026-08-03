import type { Withdraw } from "@/types/wallet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
type Props = {
  withdraws: Withdraw[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  currentPage: number;
};

export function WithdrawHistory({
  withdraws,
  selectedId,
  onSelect,
  hasNext,
  hasPrev,
  onNext,
  onPrev,
  isLoading,
  currentPage,
}: Props) {
  return (
    <div className="rounded-xl border p-4 space-y-4">
      <h2 className="text-lg font-semibold">Withdraw history</h2>

      {isLoading && <div>Loading...</div>}

      {!isLoading && withdraws.length === 0 && (
        <div className="text-sm text-muted-foreground">No withdraws yet</div>
      )}

      <div className="space-y-2">
        {withdraws.map((w) => (
          <button
            key={w._id}
            onClick={() => onSelect(w._id)}
            className={`w-full rounded-xl border p-3 text-left ${
              selectedId === w._id ? "border-primary" : ""
            }`}
          >
            <div className="flex justify-between">
              <div>
                {w.amount} {w.asset}
              </div>
              <div className="text-sm">{w.status}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(w.createdAt).toLocaleString()}
            </div>
          </button>
        ))}
      </div>

      {(hasPrev || hasNext) && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={onPrev}
                aria-disabled={!hasPrev}
                className={
                  !hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>

            <PaginationItem>
              <span className="text-sm px-4">{currentPage}</span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={onNext}
                aria-disabled={!hasNext}
                className={
                  !hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
