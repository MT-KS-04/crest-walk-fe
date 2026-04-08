import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * @param {{ page: number; totalPages: number; onPageChange: (n: number) => void; className?: string }} props
 */
export function AdminPaginationBar({ page, totalPages, onPageChange, className }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 mt-6",
        className,
      )}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </button>
      <span className="text-sm text-muted-foreground px-2 tabular-nums">
        Trang {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
