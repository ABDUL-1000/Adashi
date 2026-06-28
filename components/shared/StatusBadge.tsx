import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const className =
    normalized === "ACTIVE" || normalized === "PAID" || normalized === "COMPLETED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "PENDING"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : normalized === "OVERDUE" || normalized === "FAILED" || normalized === "CANCELLED"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-primary/20 bg-primary-soft text-primary";

  return (
    <Badge variant="outline" className={className}>
      {normalized}
    </Badge>
  );
}
