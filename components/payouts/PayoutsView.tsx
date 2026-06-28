"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPayouts } from "@/hooks/payouts/useGetPayouts";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getApiErrorMessage } from "@/services/api";

export function PayoutsView() {
  const payoutsQuery = useGetPayouts();

  return (
    <div className="grid gap-6">
      <PageHeader title="Payouts" description="Review payout records, recipient groups, and confirmation status." />
      {payoutsQuery.isLoading ? <PageSkeleton /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsQuery.isError ? (
            <EmptyState title="Could not load payouts" description={getApiErrorMessage(payoutsQuery.error)} />
          ) : null}
          {payoutsQuery.isSuccess && !payoutsQuery.data.data.length ? (
            <EmptyState title="No payouts yet" />
          ) : null}
          {payoutsQuery.isSuccess && payoutsQuery.data.data.length ? (
            <>
            <div className="hidden overflow-hidden rounded-2xl border border-border-soft md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutsQuery.data.data.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{payout.group?.name ?? "Payout"}</TableCell>
                    <TableCell>{formatCurrency(payout.amount)}</TableCell>
                    <TableCell><StatusBadge status={payout.status} /></TableCell>
                    <TableCell>{formatDate(payout.paidAt ?? payout.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {payoutsQuery.data.data.map((payout) => (
                <div key={payout.id} className="rounded-2xl border border-border-soft bg-page-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-foreground">{payout.group?.name ?? "Payout"}</p>
                    <StatusBadge status={payout.status} />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-primary">{formatCurrency(payout.amount)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(payout.paidAt ?? payout.createdAt)}</p>
                </div>
              ))}
            </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
