"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed, Mail, Plus, ShoppingBag, Timer, Users, WalletCards } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/auth/useProfile";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { useMyInvitations } from "@/hooks/invitations/useMyInvitations";
import { usePssPurchases } from "@/hooks/pss/usePss";
import { formatKobo } from "@/lib/money";
import { lastPayDay } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { isGroupOwner } from "@/lib/groupPermissions";

export function DashboardView() {
  const profileQuery = useProfile();
  const groupsQuery = useGetGroups();
  const invitationsQuery = useMyInvitations();
  const userId = profileQuery.data?.data.id;
  const groups = groupsQuery.data?.data ?? [];
  const invitations = invitationsQuery.data?.data ?? [];
  const purchasesQuery = usePssPurchases();
  const purchases = (purchasesQuery.data?.data ?? []).filter((purchase) => purchase.status === "ACTIVE");
  const createdGroups = groups.filter((group) => isGroupOwner(group, userId));
  const activeGroups = groups.filter((group) => group.status === "ACTIVE");
  const pendingGroups = groups.filter((group) => group.status === "PENDING");
  const thisRound = activeGroups.filter((group) => group.mySummary?.isMember);
  const owed = thisRound.filter((group) => group.mySummary && !group.mySummary.hasPaid);
  const totalOwed = owed.reduce((sum, group) => sum + Number(group.mySummary?.amountDue ?? 0), 0);

  if (groupsQuery.isLoading || profileQuery.isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back${profileQuery.data?.data.name ? `, ${profileQuery.data.data.name}` : ""}.`}
        action={
          <Button asChild className="min-h-11">
            <Link href="/groups/create">
              <Plus className="size-4" /> Create group
            </Link>
          </Button>
        }
      />

      {invitations.length ? (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" />
              Invitations waiting for you
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {invitations.map((invitation) => (
              <Link
                key={invitation.token}
                href={`/invitations/${invitation.token}`}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{invitation.group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    From {invitation.group.organizer.name} · {formatCurrency(invitation.group.contributionAmount)}{" "}
                    {invitation.group.frequency.toLowerCase()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">Answer</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Pay Small Small
          </CardTitle>
          <CardDescription>Sell on installments and share one record with your customer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {purchases.map((purchase) => (
            <Link
              key={purchase.shareToken}
              href={`/pss/${purchase.shareToken}`}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">You are buying: {purchase.itemName}</p>
                <p className="text-sm text-muted-foreground">
                  From {purchase.shopName} · Balance {formatKobo(purchase.balance)}
                </p>
              </div>
            </Link>
          ))}
          <Button asChild variant="outline" className="min-h-11 sm:w-fit">
            <Link href="/pay-small-small">Open Pay Small Small</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StateCard
          title="Due this round"
          value={formatCurrency(totalOwed)}
          caption={owed.length ? `${owed.length} group(s) unpaid` : "All paid"}
          icon={WalletCards}
        />
        <StateCard title="Active groups" value={activeGroups.length} icon={Users} />
        <StateCard title="Filling up" value={pendingGroups.length} icon={Timer} />
        <StateCard title="Groups I organise" value={createdGroups.length} icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>This round</CardTitle>
          <CardDescription>What you owe and who collects in each active group.</CardDescription>
        </CardHeader>
        <CardContent>
          {thisRound.length ? (
            <ul className="grid gap-2">
              {thisRound.map((group) => {
                const summary = group.mySummary!;
                return (
                  <li key={group.id}>
                    <Link
                      href={`/groups/${group.id}`}
                      className="flex min-h-14 items-start gap-3 rounded-2xl border border-border-soft bg-page-bg p-4 transition hover:border-primary/30 hover:bg-primary-soft"
                    >
                      {summary.hasPaid ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      ) : (
                        <CircleDashed className="mt-0.5 size-5 shrink-0 text-amber-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {summary.hasPaid
                            ? `Paid for round ${summary.cycleNumber} of ${summary.totalCycles}`
                            : `${formatCurrency(summary.amountDue)} due by ${formatDate(lastPayDay(summary.dueDate))}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {summary.isMyTurnToCollect
                            ? "Your turn to collect this round"
                            : `${summary.collectorName ?? "Someone"} collects this round`}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="No active rounds"
              description="When a group you're in fills up, your round details show here."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your groups</CardTitle>
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
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{group.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(group.contributionAmount)} {group.frequency === "WEEKLY" ? "weekly" : "monthly"}
                      </p>
                    </div>
                    <StatusBadge status={group.status} />
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
