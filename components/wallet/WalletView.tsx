"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, CreditCard, Wallet } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { useGetWalletTransactions } from "@/hooks/wallet/useGetWalletTransactions";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getApiErrorMessage } from "@/services/api";
import type { WalletTransaction } from "@/types/wallet.types";

const PAGE_LIMIT = 20;

export function WalletView() {
  const [page, setPage] = useState(1);
  const walletQuery = useGetWallet();
  const transactionsQuery = useGetWalletTransactions(page, PAGE_LIMIT);
  const transactions = transactionsQuery.data?.data.transactions ?? [];
  const pagination = transactionsQuery.data?.data.pagination;
  const isLoading = walletQuery.isLoading || transactionsQuery.isLoading;
  const hasError = walletQuery.isError || transactionsQuery.isError;

  function handleRetry() {
    walletQuery.refetch();
    transactionsQuery.refetch();
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Wallet"
        description="View wallet balance and transaction history."
        action={
          <Button type="button" disabled title="Top-up endpoint is not available yet">
            Top Up Wallet Coming Soon
          </Button>
        }
      />

      {isLoading ? <PageSkeleton /> : null}

      {hasError ? (
        <Card>
          <CardContent className="grid gap-4">
            <EmptyState
              title="Could not load wallet"
              description={getApiErrorMessage(walletQuery.error ?? transactionsQuery.error)}
            />
            <Button type="button" variant="outline" className="mx-auto" onClick={handleRetry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {walletQuery.isSuccess ? (
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <StateCard
            title="Balance"
            value={formatCurrency(walletQuery.data.data.balance)}
            caption={`Last updated ${formatDate(walletQuery.data.data.updatedAt)}`}
            icon={Wallet}
          />
          <StateCard
            title="Balance"
            value={formatCurrency(walletQuery.data.data.balance)}
            caption={`Last updated ${formatDate(walletQuery.data.data.updatedAt)}`}
            icon={Wallet}
          />
      
        </div>
      ) : null}

      {transactionsQuery.isSuccess ? (
        <Card>
          <CardHeader className="gap-2">
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              {pagination
                ? `${pagination.total} transaction${pagination.total === 1 ? "" : "s"} found`
                : "Latest wallet activity"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {transactions.length ? (
              <>
                <TransactionsTable transactions={transactions} />
                <TransactionsCards transactions={transactions} />
                {pagination ? (
                  <div className="flex flex-col gap-3 border-t border-border-soft pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1 || transactionsQuery.isFetching}
                      >
                        <ChevronLeft className="size-4" />
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setPage((current) =>
                            Math.min(pagination.totalPages || current, current + 1)
                          )
                        }
                        disabled={page >= pagination.totalPages || transactionsQuery.isFetching}
                      >
                        Next
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Wallet transactions will appear here after wallet activity begins."
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function TransactionsTable({ transactions }: { transactions: WalletTransaction[] }) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-border-soft md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <TransactionTypeBadge type={transaction.type} />
              </TableCell>
              <TableCell className="font-semibold text-foreground">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="max-w-[280px] truncate">{transaction.description}</TableCell>
              <TableCell>
                <Link
                  href={`/wallet/transactions/${transaction.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {transaction.reference}
                </Link>
              </TableCell>
              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TransactionsCards({ transactions }: { transactions: WalletTransaction[] }) {
  return (
    <div className="grid gap-3 md:hidden">
      {transactions.map((transaction) => (
        <Link
          key={transaction.id}
          href={`/wallet/transactions/${transaction.id}`}
          className="rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <TransactionTypeBadge type={transaction.type} />
              <p className="mt-3 truncate font-medium text-foreground">
                {transaction.description}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {transaction.reference}
              </p>
            </div>
            <p className="shrink-0 font-semibold text-primary">
              {formatCurrency(transaction.amount)}
            </p>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function TransactionTypeBadge({ type }: { type: string }) {
  const normalizedType = type.toUpperCase();
  const config: Record<string, { className: string; icon: typeof ArrowUpRight }> = {
    CONTRIBUTION: {
      className: "bg-primary-soft text-primary",
      icon: ArrowUpRight,
    },
    TOP_UP: {
      className: "bg-emerald-50 text-emerald-700",
      icon: ArrowDownLeft,
    },
    PAYOUT: {
      className: "bg-blue-50 text-blue-700",
      icon: ArrowDownLeft,
    },
    REFUND: {
      className: "bg-amber-50 text-amber-700",
      icon: ArrowDownLeft,
    },
  };
  const badge = config[normalizedType] ?? {
    className: "bg-muted text-muted-foreground",
    icon: CreditCard,
  };
  const Icon = badge.icon;

  return (
    <Badge variant="secondary" className={badge.className}>
      <Icon className="size-3" />
      {normalizedType.replaceAll("_", " ")}
    </Badge>
  );
}
