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
import { useGetPayments } from "@/hooks/payments/useGetPayments";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getApiErrorMessage } from "@/services/api";

export function PaymentsView() {
  const paymentsQuery = useGetPayments();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Payments"
        description="Track contribution payments, statuses, and paid dates from the backend ledger."
      />
      {paymentsQuery.isLoading ? <PageSkeleton /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsQuery.isError ? (
            <EmptyState title="Could not load payments" description={getApiErrorMessage(paymentsQuery.error)} />
          ) : null}
          {paymentsQuery.isSuccess && !paymentsQuery.data.data.length ? (
            <EmptyState title="No payments yet" />
          ) : null}
          {paymentsQuery.isSuccess && paymentsQuery.data.data.length ? (
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
                {paymentsQuery.data.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.group?.name ?? "Contribution"}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell><StatusBadge status={payment.status} /></TableCell>
                    <TableCell>{formatDate(payment.paidAt ?? payment.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {paymentsQuery.data.data.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-border-soft bg-page-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-foreground">{payment.group?.name ?? "Contribution"}</p>
                    <StatusBadge status={payment.status} />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-primary">{formatCurrency(payment.amount)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(payment.paidAt ?? payment.createdAt)}</p>
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
