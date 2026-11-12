"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatKobo } from "@/lib/money";
import type { PssCustomerStatus, PssPaymentMethod, PssPlanStatus, PssTotals } from "@/types/pss.types";

export const methodLabel: Record<PssPaymentMethod, string> = {
  CASH: "Cash",
  TRANSFER: "Transfer",
  OTHER: "Other",
};

export const collectionRuleLabel = {
  PAY_BEFORE_COLLECT: "Pay in full before collecting",
  COLLECT_AFTER_PART_PAYMENT: "Can collect after part payment",
} as const;

export function planLink(token: string) {
  if (typeof window === "undefined") return `/pss/${token}`;
  return `${window.location.origin}/pss/${token}`;
}

export function receiptLink(token: string, receiptNumber: string) {
  const path = `/pss/receipt/${receiptNumber}?t=${encodeURIComponent(token)}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function PlanStatusBadge({ status }: { status: PssPlanStatus }) {
  const styles: Record<PssPlanStatus, string> = {
    ACTIVE: "border-amber-200 bg-amber-50 text-amber-800",
    COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED: "border-slate-200 bg-slate-50 text-slate-600",
  };
  const labels: Record<PssPlanStatus, string> = { ACTIVE: "Paying", COMPLETED: "Fully paid", CANCELLED: "Cancelled" };
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

export function CustomerStatusBadge({ status, reversed }: { status: PssCustomerStatus; reversed?: boolean }) {
  if (reversed) {
    return (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
        Reversed
      </Badge>
    );
  }
  const styles: Record<PssCustomerStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-800",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    DISPUTED: "border-red-200 bg-red-50 text-red-700",
  };
  const labels: Record<PssCustomerStatus, string> = {
    PENDING: "Awaiting customer",
    CONFIRMED: "Customer confirmed",
    DISPUTED: "Customer disputed",
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

export function TotalsBlock({ totals }: { totals: PssTotals }) {
  return (
    <div className="grid gap-3 rounded-2xl bg-page-bg p-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Amount label="Total" value={totals.totalPrice} />
        <Amount label="Paid" value={totals.paid} tone="text-emerald-700" />
        <Amount label="Balance" value={totals.balance} tone={totals.balance > 0 ? "text-amber-800" : "text-emerald-700"} />
      </div>
      <Progress value={totals.percentPaid} aria-label={`${totals.percentPaid}% paid`} />
      <p className="text-center text-xs text-muted-foreground">{totals.percentPaid}% paid</p>
    </div>
  );
}

function Amount({ label, value, tone = "text-foreground" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-base font-bold sm:text-lg ${tone}`}>{formatKobo(value)}</p>
    </div>
  );
}
