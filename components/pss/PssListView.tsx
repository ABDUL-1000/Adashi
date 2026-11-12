"use client";

import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePssPlans, usePssPurchases } from "@/hooks/pss/usePss";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { formatKobo } from "@/lib/money";
import { PlanStatusBadge } from "./PssShared";

export function PssListView() {
  const plansQuery = usePssPlans();
  const purchasesQuery = usePssPurchases();
  const data = plansQuery.data?.data;
  const purchases = purchasesQuery.data?.data ?? [];

  if (plansQuery.isLoading) return <PageSkeleton />;

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Pay Small Small"
        description="Sell on installments and keep one shared record with your customer: what's paid, what's left, with receipts."
        action={
          <Button asChild className="min-h-11">
            <Link href="/pay-small-small/new">
              <Plus className="size-4" /> New plan
            </Link>
          </Button>
        }
      />

      {plansQuery.isError ? (
        <EmptyState title="Could not load plans" description={getErrorMessage(plansQuery.error)} />
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="py-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Total outstanding</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{formatKobo(data.summary.totalOutstanding)}</p>
                <p className="text-xs text-muted-foreground">across {data.summary.activePlans} active plan(s)</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 sm:col-span-1">
              <CardContent className="py-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Fully paid</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{data.summary.completedPlans}</p>
                <p className="text-xs text-muted-foreground">plan(s) completed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your customers</CardTitle>
            </CardHeader>
            <CardContent>
              {data.plans.length ? (
                <ul className="grid gap-2">
                  {data.plans.map((plan) => (
                    <li key={plan.id}>
                      <Link
                        href={`/pay-small-small/${plan.id}`}
                        className="grid min-h-14 gap-1 rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate font-medium text-foreground">{plan.customerName}</p>
                          <PlanStatusBadge status={plan.status} />
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{plan.itemName}</p>
                        <p className="text-sm">
                          <span className="text-emerald-700">Paid {formatKobo(plan.paid)}</span>
                          <span className="text-muted-foreground"> · </span>
                          <span className={plan.balance > 0 ? "font-semibold text-amber-800" : "text-muted-foreground"}>
                            Balance {formatKobo(plan.balance)}
                          </span>
                          {plan.dueDate && plan.status === "ACTIVE" ? (
                            <span className="text-muted-foreground"> · due {formatDate(plan.dueDate)}</span>
                          ) : null}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No plans yet"
                  description="Create a plan when a customer buys something and pays small small."
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {purchases.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Things you are buying
            </CardTitle>
            <CardDescription>Plans shops have shared with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2">
              {purchases.map((purchase) => (
                <li key={purchase.shareToken}>
                  <Link
                    href={`/pss/${purchase.shareToken}`}
                    className="grid min-h-14 gap-1 rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate font-medium text-foreground">{purchase.itemName}</p>
                      <PlanStatusBadge status={purchase.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      From {purchase.shopName} · Balance {formatKobo(purchase.balance)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
