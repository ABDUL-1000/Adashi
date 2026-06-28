"use client";

import { useParams } from "next/navigation";
import { CalendarDays, CreditCard, Users, Wallet } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getApiErrorMessage } from "@/services/api";

export function GroupDetailsView() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const walletQuery = useGetWallet();

  if (groupQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (groupQuery.isError) {
    return (
      <EmptyState
        title="Could not load group"
        description={getApiErrorMessage(groupQuery.error)}
      />
    );
  }

  const details = groupQuery.data?.data;
  if (!details) {
    return <EmptyState title="Group not found" />;
  }

  const group = details.group;
  const walletBalance = Number(walletQuery.data?.data.balance ?? 0);
  const contributionAmount = Number(group.contributionAmount);
  const hasLowBalance = walletQuery.isSuccess && walletBalance < contributionAmount;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={group.name}
        description={`Organized by ${group.organizer.name}`}
        action={<StatusBadge status={group.status} />}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StateCard title="Contribution" value={formatCurrency(group.contributionAmount)} icon={Wallet} />
        <StateCard title="Frequency" value={group.frequency} icon={CalendarDays} />
        <StateCard title="Start date" value={formatDate(group.startDate)} icon={CalendarDays} />
        <StateCard title="Payout position" value={details.userContext?.payoutPosition ?? "Not joined"} icon={Users} />
      </div>

      <Card className="bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_55%,#cfacec3d_100%)]">
        <CardHeader>
          <CardTitle>Wallet and reminders</CardTitle>
          <CardDescription>Members should keep wallet balances ready before each due date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
          <p>Organizer reminders are automatic based on this group&apos;s reminder settings.</p>
          <p className="font-medium text-foreground">
            Auto deduction consent:{" "}
            {walletQuery.data?.data.autoDeductionEnabled ? "Enabled" : "Not enabled"}
          </p>
          {hasLowBalance ? (
            <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
              Your wallet balance is below your next contribution. Please top up before the due date.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current cycle</CardTitle>
        </CardHeader>
        <CardContent>
          {details.currentCycle ? (
            <p className="text-sm">
              Cycle {details.currentCycle.cycleNumber}: {formatDate(details.currentCycle.startDate)} to{" "}
              {formatDate(details.currentCycle.endDate)}
            </p>
          ) : (
            <EmptyState title="No active cycle yet" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {group.members.length ? (
            <>
            <div className="hidden overflow-hidden rounded-2xl border border-border-soft md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Payout position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.members.map((member) => (
                  <TableRow key={member.id}>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{member.user.phone}</TableCell>
                  <TableCell>{member.payoutPosition}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {group.members.map((member) => (
                <div key={member.id} className="rounded-2xl border border-border-soft bg-page-bg p-4">
                  <p className="font-medium text-foreground">{member.user.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.user.email}</p>
                  <p className="mt-3 text-sm font-medium text-primary">Payout position {member.payoutPosition}</p>
                </div>
              ))}
            </div>
            </>
          ) : (
            <EmptyState title="No members yet" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <LedgerCard title="Payments" items={details.ledger.payments} icon={<CreditCard className="size-5" />} />
        <LedgerCard title="Payouts" items={details.ledger.payouts} icon={<Wallet className="size-5" />} />
      </div>
    </div>
  );
}

function LedgerCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: Array<{ id: string; amount?: string; status?: string; createdAt?: string }>;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="overflow-hidden rounded-2xl border border-border-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell><StatusBadge status={item.status ?? "PENDING"} /></TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        ) : (
          <EmptyState title={`No ${title.toLowerCase()} yet`} />
        )}
      </CardContent>
    </Card>
  );
}
