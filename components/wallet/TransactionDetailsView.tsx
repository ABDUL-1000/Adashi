"use client";

import { useParams } from "next/navigation";
import { Copy, CreditCard } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionTypeBadge } from "@/components/wallet/WalletView";
import { useGetTransactionDetails } from "@/hooks/wallet/useGetTransactionDetails";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { notify } from "@/lib/notify";
import { getApiErrorMessage } from "@/services/api";

export function TransactionDetailsView() {
  const params = useParams<{ transactionId: string }>();
  const transactionQuery = useGetTransactionDetails(params.transactionId);
  const transaction = transactionQuery.data?.data;

  async function handleCopyReference() {
    if (!transaction?.reference) return;

    try {
      await navigator.clipboard.writeText(transaction.reference);
      notify.success("Reference copied.");
    } catch {
      notify.error("Could not copy reference.");
    }
  }

  if (transactionQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (transactionQuery.isError) {
    return (
      <Card>
        <CardContent className="grid gap-4">
          <EmptyState
            title="Could not load transaction"
            description={getApiErrorMessage(transactionQuery.error)}
          />
          <Button
            type="button"
            variant="outline"
            className="mx-auto"
            onClick={() => transactionQuery.refetch()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return <EmptyState title="Transaction not found" />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Transaction details"
        description="Review wallet transaction information."
        action={
          <Button type="button" variant="outline" onClick={handleCopyReference}>
            <Copy className="size-4" />
            Copy reference
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <StateCard
          title="Amount"
          value={formatCurrency(transaction.amount)}
          caption={formatDate(transaction.createdAt)}
          icon={CreditCard}
        />
        <Card>
          <CardHeader>
            <CardTitle>Type</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTypeBadge type={transaction.type} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <DetailRow label="Description" value={transaction.description} />
          <DetailRow label="Reference" value={transaction.reference} />
          <DetailRow label="Created" value={formatDate(transaction.createdAt)} />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-border-soft bg-page-bg p-4 sm:grid-cols-[160px_1fr] sm:gap-4">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="break-words font-medium text-foreground">{value || "Not available"}</p>
    </div>
  );
}
