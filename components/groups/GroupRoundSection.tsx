"use client";

import { FormEvent, useState } from "react";
import { BellRing, CheckCircle2, CircleDashed, MessageCircle, Send, Undo2 } from "lucide-react";

import { InlineLoader } from "@/components/shared/InlineLoader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Progress } from "@/components/ui/progress";
import { useManualPayout } from "@/hooks/payouts/useManualPayout";
import { useRecordPayment } from "@/hooks/payments/useRecordPayment";
import { useUndoPayment } from "@/hooks/payments/useUndoPayment";
import { useTriggerReminder } from "@/hooks/reminders/useTriggerReminder";
import { lastPayDay, toDateInputValue } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { CycleLedger, CycleMemberStatus, GroupDetails } from "@/types/group.types";

const selectClassName =
  "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

const phaseLabel: Record<CycleLedger["phase"], string> = {
  UPCOMING: "upcoming",
  CURRENT: "current",
  CLOSED: "closed",
};

export function GroupRoundSection({ details, currentUserId }: { details: GroupDetails; currentUserId?: string }) {
  const { group, viewer, ledger, currentCycle } = details;
  const cycles = ledger.cycles ?? [];
  const [selectedId, setSelectedId] = useState<string | undefined>(currentCycle?.id);
  const cycle = cycles.find((c) => c.id === selectedId) ?? cycles.find((c) => c.id === currentCycle?.id) ?? cycles[0];

  if (!cycle) return null;

  const myRow = currentUserId ? cycle.members.find((m) => m.userId === currentUserId) : undefined;
  const percent = cycle.members.length ? Math.round((cycle.paidCount / cycle.members.length) * 100) : 0;
  const unpaid = cycle.members.filter((m) => m.status !== "PAID");
  const isMyTurn = Boolean(myRow && cycle.expectedCollector?.userId === myRow.userId);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              Round {cycle.cycleNumber} of {cycles.length}
            </CardTitle>
            <CardDescription>
              Pay by {formatDate(lastPayDay(cycle.endDate))} · {phaseLabel[cycle.phase]}
            </CardDescription>
          </div>
          {cycles.length > 1 ? (
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              Show round
              <select
                className={`${selectClassName} h-10 min-w-40`}
                value={cycle.id}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    Round {c.cycleNumber} ({phaseLabel[c.phase]})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="grid gap-3 rounded-2xl bg-page-bg p-4 sm:grid-cols-3">
          <Fact label="Collects this round" value={cycle.expectedCollector?.name ?? "Not assigned"} />
          <Fact label="Paid" value={`${cycle.paidCount} of ${cycle.members.length}`} />
          <Fact
            label="Collected"
            value={`${formatCurrency(cycle.collectedAmount)} / ${formatCurrency(cycle.expectedPot)}`}
          />
          <div className="sm:col-span-3">
            <Progress value={percent} aria-label={`${percent}% of members have paid`} />
          </div>
        </div>

        {myRow ? (
          <div
            className={
              myRow.status === "PAID"
                ? "flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
                : "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
            }
          >
            {myRow.status === "PAID" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            ) : (
              <CircleDashed className="mt-0.5 size-5 shrink-0" />
            )}
            <p className="text-sm leading-6">
              {myRow.status === "PAID"
                ? `Your ${formatCurrency(group.contributionAmount)} for round ${cycle.cycleNumber} is recorded.`
                : `You owe ${formatCurrency(group.contributionAmount)} for round ${cycle.cycleNumber}. Pay your organiser by ${formatDate(lastPayDay(cycle.endDate))}; they will mark it here.`}
              {isMyTurn ? " It's your turn to collect this round." : ""}
            </p>
          </div>
        ) : null}

        {cycle.payout ? (
          <p className="rounded-2xl border border-primary/20 bg-primary-soft p-4 text-sm text-foreground">
            <strong>{cycle.payout.receiverName}</strong> collected {formatCurrency(cycle.payout.amount)} on{" "}
            {formatDate(cycle.payout.disbursedAt)}.
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="grid gap-4">
        {viewer.isOrganizer && group.status === "ACTIVE" ? (
          <OrganizerRoundActions details={details} cycle={cycle} unpaid={unpaid} />
        ) : null}

        <ul className="grid gap-2" aria-label={`Payment status for round ${cycle.cycleNumber}`}>
          {cycle.members.map((member) => (
            <MemberPaymentRow
              key={member.memberId}
              groupId={group.id}
              cycle={cycle}
              member={member}
              canManage={viewer.isOrganizer && group.status === "ACTIVE"}
              isCollector={cycle.expectedCollector?.userId === member.userId}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MemberPaymentRow({
  groupId,
  cycle,
  member,
  canManage,
  isCollector,
}: {
  groupId: string;
  cycle: CycleLedger;
  member: CycleMemberStatus;
  canManage: boolean;
  isCollector: boolean;
}) {
  const undoPayment = useUndoPayment();

  async function handleUndo() {
    if (!member.payment) return;
    try {
      const response = await undoPayment.mutateAsync({ groupId, cycleId: cycle.id, paymentId: member.payment.id });
      notify.success(response.message || "Payment record removed.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-page-bg p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {member.name}
          {isCollector ? <span className="ml-2 text-xs font-semibold text-primary">Collects</span> : null}
        </p>
        <p className="text-xs text-muted-foreground">
          {member.payment
            ? `${member.payment.method === "CASH" ? "Cash" : member.payment.method === "TRANSFER" ? "Transfer" : "Online"} · ${formatDate(member.payment.paidAt)}${member.payment.note ? ` · ${member.payment.note}` : ""}`
            : member.status === "LATE"
              ? "Not paid. This round has closed."
              : "Not paid yet"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={member.status} />
        {canManage && !member.payment ? (
          <RecordPaymentDialog groupId={groupId} cycle={cycle} member={member} />
        ) : null}
        {canManage && member.payment && member.payment.method !== "PAYSTACK" ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="min-h-11" aria-label={`Undo ${member.name}'s payment`}>
                <Undo2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Undo {member.name}&apos;s payment?</AlertDialogTitle>
                <AlertDialogDescription>
                  Only do this if the payment was recorded by mistake. {member.name} will show as unpaid for round{" "}
                  {cycle.cycleNumber}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction onClick={handleUndo}>
                  {undoPayment.isPending ? "Removing..." : "Undo payment"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </li>
  );
}

function RecordPaymentDialog({
  groupId,
  cycle,
  member,
}: {
  groupId: string;
  cycle: CycleLedger;
  member: CycleMemberStatus;
}) {
  const recordPayment = useRecordPayment();
  const [open, setOpen] = useState(false);
  const today = toDateInputValue(new Date());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const paidOn = String(form.get("paidOn") || "");
    const note = String(form.get("note") || "").trim();

    try {
      const response = await recordPayment.mutateAsync({
        groupId,
        cycleId: cycle.id,
        payload: {
          memberId: member.memberId,
          method: String(form.get("method")) as "CASH" | "TRANSFER",
          note: note || undefined,
          // Payments made today keep the current time; earlier days are recorded at noon (WAT).
          paidAt: paidOn && paidOn !== today ? new Date(`${paidOn}T12:00:00+01:00`).toISOString() : undefined,
        },
      });
      notify.success(response.message || "Payment recorded.");
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11">
          Mark paid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record {member.name}&apos;s payment</DialogTitle>
          <DialogDescription>
            Round {cycle.cycleNumber}. Only record money you have actually received. Adashi does not move money.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">How did they pay?</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-input px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                <input type="radio" name="method" value="TRANSFER" defaultChecked className="size-4 accent-primary" />
                Bank transfer
              </label>
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-input px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                <input type="radio" name="method" value="CASH" className="size-4 accent-primary" />
                Cash
              </label>
            </div>
          </fieldset>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`paidOn-${member.memberId}`}>
              Date paid
            </label>
            <Input id={`paidOn-${member.memberId}`} name="paidOn" type="date" defaultValue={today} max={today} required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`note-${member.memberId}`}>
              Note (optional)
            </label>
            <Input id={`note-${member.memberId}`} name="note" maxLength={200} placeholder="e.g. transfer ref or who received it" />
          </div>
          <Button type="submit" size="lg" disabled={recordPayment.isPending}>
            {recordPayment.isPending ? <InlineLoader label="Saving" /> : "Confirm payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrganizerRoundActions({
  details,
  cycle,
  unpaid,
}: {
  details: GroupDetails;
  cycle: CycleLedger;
  unpaid: CycleMemberStatus[];
}) {
  const triggerReminder = useTriggerReminder();
  const { group } = details;

  const whatsappText = [
    `Hello ${group.name} members,`,
    `Round ${cycle.cycleNumber} contributions of ${formatCurrency(group.contributionAmount)} are due by ${formatDate(lastPayDay(cycle.endDate))}.`,
    unpaid.length ? `Still to pay: ${unpaid.map((m) => m.name).join(", ")}.` : "Everyone has paid. Thank you!",
    cycle.expectedCollector ? `${cycle.expectedCollector.name} collects this round.` : "",
    unpaid.length ? "Please pay and send me your proof of payment so I can mark it in Adashi. Thank you!" : "",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  async function handleEmailReminder() {
    try {
      const response = await triggerReminder.mutateAsync({ groupId: group.id });
      notify.success(response.message || "Reminders sent.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <div className="grid gap-2 sm:flex sm:flex-wrap">
      <Button asChild variant="outline" className="min-h-11">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" />
          Remind on WhatsApp
        </a>
      </Button>
      {cycle.phase !== "UPCOMING" && unpaid.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={handleEmailReminder}
          disabled={triggerReminder.isPending}
        >
          {triggerReminder.isPending ? (
            <InlineLoader label="Sending" />
          ) : (
            <>
              <BellRing className="size-4" />
              Email {unpaid.length} unpaid
            </>
          )}
        </Button>
      ) : null}
      <PayoutDialog details={details} cycle={cycle} />
    </div>
  );
}

function PayoutDialog({ details, cycle }: { details: GroupDetails; cycle: CycleLedger }) {
  const manualPayout = useManualPayout();
  const [open, setOpen] = useState(false);
  const { group } = details;
  const existing = cycle.payout;
  const defaultReceiver = existing?.receiverUserId ?? cycle.expectedCollector?.userId ?? group.members[0]?.userId;
  const [receiver, setReceiver] = useState(defaultReceiver);
  const outOfTurn = Boolean(cycle.expectedCollector && receiver !== cycle.expectedCollector.userId);
  const shortBy = cycle.members.length - cycle.paidCount;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const response = await manualPayout.mutateAsync({
        groupId: group.id,
        cycleId: cycle.id,
        receiverUserId: receiver,
        amount: Number(form.get("amount")),
        overrideOrder: form.get("overrideOrder") === "on",
        correction: Boolean(existing),
      });
      notify.success(response.message || "Payout recorded.");
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setReceiver(defaultReceiver);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={existing ? "outline" : "default"} className="min-h-11">
          <Send className="size-4" />
          {existing ? "Correct payout" : "Record payout"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Correct" : "Record"} round {cycle.cycleNumber} payout</DialogTitle>
          <DialogDescription>
            Record the payout after you have sent the money. Adashi does not move money.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {shortBy > 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              {shortBy} member(s) have no recorded payment for this round.
            </p>
          ) : null}
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`receiver-${cycle.id}`}>
              Receiver
            </label>
            <select
              id={`receiver-${cycle.id}`}
              className={selectClassName}
              value={receiver}
              onChange={(event) => setReceiver(event.target.value)}
              required
            >
              {[...group.members]
                .sort((a, b) => a.payoutPosition - b.payoutPosition)
                .map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.payoutPosition}. {member.user.name}
                    {member.userId === cycle.expectedCollector?.userId ? " (their turn)" : ""}
                  </option>
                ))}
            </select>
          </div>
          {outOfTurn ? (
            <label className="flex min-h-11 items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <input type="checkbox" name="overrideOrder" required className="mt-0.5 size-4 accent-primary" />
              The group agreed that this person collects instead of {cycle.expectedCollector?.name}.
            </label>
          ) : null}
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`amount-${cycle.id}`}>
              Amount paid out (full pot is {formatCurrency(cycle.expectedPot)})
            </label>
            <Input
              id={`amount-${cycle.id}`}
              name="amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              max={cycle.expectedPot}
              defaultValue={existing ? Number(existing.amount) : cycle.expectedPot}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={manualPayout.isPending}>
            {manualPayout.isPending ? <InlineLoader label="Saving" /> : existing ? "Save correction" : "Confirm payout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
