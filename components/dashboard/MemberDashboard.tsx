"use client";

import Link from "next/link";
import { AlertTriangle, Users, Wallet, WalletCards } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/auth/useProfile";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { formatCurrency } from "@/lib/formatCurrency";

export function MemberDashboard() {
  const profileQuery = useProfile();
  const groupsQuery = useGetGroups();
  const walletQuery = useGetWallet();
  const groups = groupsQuery.data?.data ?? [];
  const balance = Number(walletQuery.data?.data.balance ?? 0);
  const nextContribution = groups[0]?.contributionAmount;
  const hasLowBalance = Boolean(nextContribution && balance < Number(nextContribution));

  if (groupsQuery.isLoading || walletQuery.isLoading || profileQuery.isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Member dashboard"
        description={`Welcome back${profileQuery.data?.data.name ? `, ${profileQuery.data.data.name}` : ""}. Track your groups, wallet, payments, and payout position.`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StateCard title="Wallet balance" value={formatCurrency(walletQuery.data?.data.balance)} caption="Fund your wallet before due dates" icon={Wallet} />
        <StateCard title="Joined groups" value={groups.length} caption="Active memberships" icon={Users} />
        <StateCard title="Next contribution" value={nextContribution ? formatCurrency(nextContribution) : "None"} caption="Based on your first visible group" icon={WalletCards} />
      </div>
      {hasLowBalance ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm leading-6">
            Your wallet balance is below the next contribution amount. Top up before the due date to stay current.
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/member/wallet">Top up wallet</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/member/groups">View groups</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Joined groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.slice(0, 4).map((group) => (
                <Link
                  key={group.id}
                  href={`/member/groups/${group.id}`}
                  className="rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                >
                  <p className="font-medium text-foreground">{group.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{group.frequency}</p>
                  <p className="mt-4 text-lg font-semibold text-primary">{formatCurrency(group.contributionAmount)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No joined groups" description="Join a group with an invite link or create one as an organizer." />
          )}
        </CardContent>
      </Card>
      {groupsQuery.isError ? <EmptyState title="Could not load groups" /> : null}
    </div>
  );
}
