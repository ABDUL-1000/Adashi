"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, CreditCard, Send, Users, Wallet } from "lucide-react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useManualPayout } from "@/hooks/payouts/useManualPayout";
import { useTriggerReminder } from "@/hooks/reminders/useTriggerReminder";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";

export function GroupDetailsView() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const walletQuery = useGetWallet();
  const triggerReminder = useTriggerReminder();

  if (groupQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (groupQuery.isError) {
    return (
      <EmptyState
        title="Could not load group"
        description={getErrorMessage(groupQuery.error)}
      />
    );
  }

  const details = groupQuery.data?.data;
  if (!details) {
    return <EmptyState title="Group not found" />;
  }

  const group = details.group;
  // TODO: Backend should include invites in single group details response.
  const inviteCode = group.invites?.[0]?.code;
  const walletBalance = Number(walletQuery.data?.data.balance ?? 0);
  const contributionAmount = Number(group.contributionAmount);
  const hasLowBalance = walletQuery.isSuccess && walletBalance < contributionAmount;

  async function handleTriggerReminder() {
    try {
      const response = await triggerReminder.mutateAsync();
      notify.success(response.message || "Reminder triggered successfully.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title={group.name}
        description={`Organized by ${group.organizer.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={group.status} />
            <Button
              type="button"
              variant="outline"
              onClick={handleTriggerReminder}
              disabled={triggerReminder.isPending}
            >
              {triggerReminder.isPending ? <InlineLoader label="Triggering" /> : "Trigger Reminder"}
            </Button>
            {details.currentCycle ? (
              <ManualPayoutDialog
                groupId={group.id}
                cycleId={details.currentCycle.id}
                members={group.members}
                defaultAmount={contributionAmount}
              />
            ) : null}
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StateCard title="Contribution" value={formatCurrency(group.contributionAmount)} icon={Wallet} />
        <StateCard title="Frequency" value={group.frequency} icon={CalendarDays} />
        <StateCard title="Start date" value={formatDate(group.startDate)} icon={CalendarDays} />
        <StateCard title="Payout position" value={details.userContext?.payoutPosition ?? "Not joined"} icon={Users} />
      </div>

      {inviteCode ? <InviteLinkBox code={inviteCode} /> : null}

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
        <LedgerCard title="Payments" items={details.ledger.payments ?? []} icon={<CreditCard className="size-5" />} />
        <LedgerCard title="Payouts" items={details.ledger.payouts ?? []} icon={<Wallet className="size-5" />} />
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
  items: Array<Record<string, unknown>>;
  icon?: React.ReactNode;
}) {
  const visibleItems = items.filter((item) => Object.keys(item).length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleItems.length ? (
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
              {visibleItems.map((item, index) => (
                <TableRow key={String(item.id ?? index)}>
                  <TableCell>{formatCurrency(getString(item.amount))}</TableCell>
                  <TableCell><StatusBadge status={getString(item.status) || "PENDING"} /></TableCell>
                  <TableCell>{formatDate(getString(item.createdAt) || getString(item.paidAt))}</TableCell>
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

function ManualPayoutDialog({
  groupId,
  cycleId,
  members,
  defaultAmount,
}: {
  groupId: string;
  cycleId: string;
  members: Array<{ userId: string; user: { name: string }; payoutPosition: number }>;
  defaultAmount: number;
}) {
  const manualPayout = useManualPayout();
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const response = await manualPayout.mutateAsync({
        groupId,
        cycleId,
        receiverUserId: String(form.get("receiverUserId")),
        amount: Number(form.get("amount")),
      });
      notify.success(response.message || "Manual payout submitted.");
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Send className="size-4" />
          Manual Payout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual payout</DialogTitle>
          <DialogDescription>
            Select a receiver and amount for the current contribution cycle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="receiverUserId">
              Receiver
            </label>
            <select
              id="receiverUserId"
              name="receiverUserId"
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              required
            >
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name} - position {member.payoutPosition}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="amount">
              Amount
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              defaultValue={defaultAmount}
              required
            />
          </div>
          <Button type="submit" disabled={manualPayout.isPending}>
            {manualPayout.isPending ? <InlineLoader label="Submitting" /> : "Confirm payout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
