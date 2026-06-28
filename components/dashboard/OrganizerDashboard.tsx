"use client";

import Link from "next/link";
import { BellRing, Plus, Users, WalletCards } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { formatCurrency } from "@/lib/formatCurrency";

export function OrganizerDashboard() {
  const groupsQuery = useGetGroups();
  const groups = groupsQuery.data?.data ?? [];
  const activeGroups = groups.filter((group) => group.status === "ACTIVE").length;
  const totalMonthly = groups.reduce(
    (sum, group) => sum + Number(group.contributionAmount || 0),
    0
  );

  if (groupsQuery.isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Organizer dashboard"
        description="Manage contribution groups and automatic reminder settings."
        action={
          <Button asChild>
            <Link href="/organizer/groups/create">
              <Plus className="size-4" /> Create group
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StateCard title="Total groups" value={groups.length} caption={`${activeGroups} active groups`} icon={Users} />
        <StateCard title="Contribution volume" value={formatCurrency(totalMonthly)} caption="Across visible groups" icon={WalletCards} />
        <StateCard title="Reminder mode" value="Automatic" caption="Configured per group" icon={BellRing} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length ? (
            <div className="grid gap-3">
              {groups.slice(0, 4).map((group) => (
                <Link
                  key={group.id}
                  href={`/organizer/groups/${group.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                >
                  <div>
                    <p className="font-medium text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.frequency} contribution</p>
                  </div>
                  <p className="font-semibold text-primary">{formatCurrency(group.contributionAmount)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No groups yet" description="Create your first contribution group to start tracking members and payouts." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
