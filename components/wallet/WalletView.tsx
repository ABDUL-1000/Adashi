"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Button } from "@/components/ui/button";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { formatCurrency } from "@/lib/formatCurrency";
import { getApiErrorMessage } from "@/services/api";

export function WalletView() {
  const walletQuery = useGetWallet();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Wallet"
        description="Fund your wallet before contribution due dates."
        action={
          <Button asChild>
            <Link href="/member/wallet/top-up">Top up wallet</Link>
          </Button>
        }
      />
      {walletQuery.isLoading ? <PageSkeleton /> : null}
      {walletQuery.isError ? (
        <EmptyState
          title="Could not load wallet"
          description={getApiErrorMessage(walletQuery.error)}
        />
      ) : null}
      {walletQuery.isSuccess ? (
        <div className="grid gap-4 md:grid-cols-2">
          <StateCard title="Balance" value={formatCurrency(walletQuery.data.data.balance)} icon={CreditCard} />
          <StateCard
            title="Auto deduction consent"
            value={walletQuery.data.data.autoDeductionEnabled ? "Enabled" : "Not enabled"}
            caption="Used for automated group contribution collection"
            icon={ShieldCheck}
          />
        </div>
      ) : null}
    </div>
  );
}
