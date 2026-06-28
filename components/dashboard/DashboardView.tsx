"use client";

import Link from "next/link";
import { AlertTriangle, Plus, Timer, Users, Wallet, WalletCards } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/auth/useProfile";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { isGroupOwner } from "@/lib/groupPermissions";
import { formatCurrency } from "@/lib/formatCurrency";

export function DashboardView() {
  const profileQuery = useProfile();
  const groupsQuery = useGetGroups();
  const walletQuery = useGetWallet();
  const userId = profileQuery.data?.data.id;
  const groups = groupsQuery.data?.data ?? [];
  const createdGroups = groups.filter((group) => isGroupOwner(group, userId));
  const joinedGroups = groups.filter((group) => !isGroupOwner(group, userId));
  const pendingGroups = groups.filter((group) => group.status === "PENDING");
  const activeGroups = groups.filter((group) => group.status === "ACTIVE");
  const walletBalance = Number(walletQuery.data?.data.balance ?? 0);
  const nextContributionAmount = groups
    .map((group) => Number(group.contributionAmount))
    .filter((amount) => !Number.isNaN(amount) && amount > 0)
    .sort((a, b) => a - b)[0];
  const hasLowWalletBalance = Boolean(
    nextContributionAmount && walletBalance < nextContributionAmount
  );

  if (groupsQuery.isLoading || profileQuery.isLoading || walletQuery.isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${profileQuery.data?.data.name ? `, ${profileQuery.data.data.name}` : ""}. Track the groups you created and joined from one workspace.`}
        action={
          <Button asChild>
            <Link href="/groups/create">
              <Plus className="size-4" /> Create group
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
        <StateCard title="Total groups" value={groups.length} icon={Users} />
        <StateCard title="Groups I Created" value={createdGroups.length} icon={Users} />
        <StateCard title="Groups I Joined" value={joinedGroups.length} icon={WalletCards} />
        <StateCard title="Pending groups" value={pendingGroups.length} icon={Timer} />
        <StateCard title="Active groups" value={activeGroups.length} icon={WalletCards} />
        <StateCard
          title="Wallet"
          value={formatCurrency(walletQuery.data?.data.balance)}
          caption="Available wallet balance"
          icon={Wallet}
        />
      </div>
      {hasLowWalletBalance ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm leading-6">
            Your wallet balance may be below your next contribution. Please top up before the due date.
          </p>
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Recent groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.slice(0, 6).map((group) => (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{group.frequency}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(group.contributionAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No groups yet"
              description="Create a group or join one from an invite link to see it here."
            />
          )}
          {groupsQuery.isError ? <EmptyState title="Could not load groups" /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
