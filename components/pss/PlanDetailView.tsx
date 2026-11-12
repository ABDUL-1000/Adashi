"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Ban, Copy, ExternalLink, MessageCircle, PackageCheck, Phone, Receipt, Undo2 } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
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
import { useRecordPssPayment, useReversePssPayment, usePssPlan, useUpdatePssPlan } from "@/hooks/pss/usePss";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { formatKobo, nairaInputToKobo } from "@/lib/money";
import { notify } from "@/lib/notify";
import { displayPhone, whatsappLink } from "@/lib/phone";
import type { PssPayment, PssPaymentMethod, PssPlan } from "@/types/pss.types";
import {
  CustomerStatusBadge,
  PlanStatusBadge,
  TotalsBlock,
  collectionRuleLabel,
  methodLabel,
  planLink,
  receiptLink,
} from "./PssShared";

const selectClassName =
  "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

export function PlanDetailView() {
  const params = useParams<{ planId: string }>();
  const planQuery = usePssPlan(params.planId);

  if (planQuery.isLoading) return <PageSkeleton />;
  if (planQuery.isError || !planQuery.data) {
    return <EmptyState title="Plan not found" description={planQuery.error ? getErrorMessage(planQuery.error) : undefined} />;
  }

  const plan = planQuery.data.data;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={plan.itemName}
        description={`${plan.customerName} · ${collectionRuleLabel[plan.collectionRule]}`}
        action={<PlanStatusBadge status={plan.status} />}
      />

      <Card>
        <CardContent className="grid gap-4 py-5">
          <TotalsBlock totals={plan} />
          {plan.itemDescription ? <p className="text-sm text-muted-foreground">{plan.itemDescription}</p> : null}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:+${plan.customerPhone}`} className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
              <Phone className="size-3.5" />
              {displayPhone(plan.customerPhone)}
            </a>
            {plan.dueDate ? <span>Pay by {formatDate(plan.dueDate)}</span> : null}
            {plan.customerLinked ? <span>Customer has an Adashi account</span> : null}
          </div>
          {plan.status === "ACTIVE" ? <RecordPaymentForm plan={plan} /> : null}
          {plan.status === "COMPLETED" ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              Fully paid. {plan.collected ? "Item collected." : "Remember to mark the item as collected when they take it."}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <ShareCard plan={plan} />

      <CollectionCard plan={plan} />

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            Payments cannot be edited or deleted. If one is wrong, reverse it and record the correct one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plan.payments.length ? (
            <ul className="grid gap-2">
              {plan.payments.map((payment) => (
                <PaymentRow key={payment.id} plan={plan} payment={payment} />
              ))}
            </ul>
          ) : (
            <EmptyState title="No payments yet" />
          )}
        </CardContent>
      </Card>

      {plan.status === "ACTIVE" ? <CancelPlan plan={plan} /> : null}
    </div>
  );
}

function RecordPaymentForm({ plan }: { plan: PssPlan }) {
  const recordPayment = useRecordPssPayment();
  const [error, setError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{ number: string; amount: number; balance: number } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const amount = nairaInputToKobo(form.get("amount"));

    if (!amount || amount <= 0) return setError("Enter an amount more than ₦0.");
    if (amount > plan.balance) return setError(`That is more than the balance of ${formatKobo(plan.balance)}.`);

    try {
      const response = await recordPayment.mutateAsync({
        id: plan.id,
        payload: {
          amount,
          method: String(form.get("method")) as PssPaymentMethod,
          note: String(form.get("note") || "").trim() || undefined,
        },
      });
      notify.success(response.message || "Payment recorded.");
      setLastReceipt({ number: response.data.receiptNumber, amount, balance: response.data.plan.balance });
      formElement.reset();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  return (
    <div className="grid gap-3">
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-border-soft p-4">
        <p className="font-semibold text-foreground">Record payment</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="pss-amount">Amount (₦)</label>
            <Input id="pss-amount" name="amount" inputMode="decimal" placeholder={String(plan.balance / 100)} required />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="pss-method">Method</label>
            <select id="pss-method" name="method" className={selectClassName} defaultValue="CASH">
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="pss-note">Note (optional)</label>
          <Input id="pss-note" name="note" maxLength={200} placeholder="e.g. transfer ref" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={recordPayment.isPending}>
          {recordPayment.isPending ? <InlineLoader label="Saving" /> : "Save payment"}
        </Button>
      </form>
      {lastReceipt ? (
        <div className="grid gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>
            Saved {formatKobo(lastReceipt.amount)}. Receipt {lastReceipt.number}.
          </p>
          <Button asChild className="min-h-11">
            <a
              href={whatsappLink(
                `Hi ${plan.customerName}, you paid ${formatKobo(lastReceipt.amount)} for ${plan.itemName}. Balance: ${formatKobo(lastReceipt.balance)}. View/confirm: ${receiptLink(plan.shareToken, lastReceipt.number)}`,
                plan.customerPhone
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              Send receipt on WhatsApp
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ShareCard({ plan }: { plan: PssPlan }) {
  const link = planLink(plan.shareToken);
  const message =
    plan.status === "COMPLETED"
      ? `Hi ${plan.customerName}, your ${plan.itemName} is fully paid (${formatKobo(plan.totalPrice)}). Thank you! See your receipts: ${link}`
      : `Hi ${plan.customerName}, here is your Pay Small Small record for ${plan.itemName}. Paid: ${formatKobo(plan.paid)}. Balance: ${formatKobo(plan.balance)}. View/confirm: ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      notify.success("Link copied");
    } catch {
      notify.error("Unable to copy link");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share with customer</CardTitle>
        <CardDescription>They can see every payment and confirm it, without an account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:flex sm:flex-wrap">
        <Button asChild className="min-h-11">
          <a href={whatsappLink(message, plan.customerPhone)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            Share on WhatsApp
          </a>
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={copy}>
          <Copy className="size-4" />
          Copy link
        </Button>
        <Button asChild variant="ghost" className="min-h-11">
          <Link href={`/pss/${plan.shareToken}`} target="_blank">
            <ExternalLink className="size-4" />
            See customer view
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CollectionCard({ plan }: { plan: PssPlan }) {
  const updatePlan = useUpdatePssPlan();
  if (plan.status === "CANCELLED") return null;
  const blocked =
    !plan.collected &&
    ((plan.collectionRule === "PAY_BEFORE_COLLECT" && plan.balance > 0) ||
      (plan.collectionRule === "COLLECT_AFTER_PART_PAYMENT" && plan.paid <= 0));

  async function toggle() {
    try {
      const response = await updatePlan.mutateAsync({ id: plan.id, payload: { collected: !plan.collected } });
      notify.success(response.data.collected ? "Marked as collected." : "Marked as not collected.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{plan.collected ? "Item collected" : "Item not collected yet"}</p>
          <p className="text-sm text-muted-foreground">
            {blocked
              ? plan.collectionRule === "PAY_BEFORE_COLLECT"
                ? "Can be collected when the balance is ₦0."
                : "Can be collected after the first payment."
              : collectionRuleLabel[plan.collectionRule]}
          </p>
        </div>
        <Button
          type="button"
          variant={plan.collected ? "outline" : "default"}
          className="min-h-11"
          onClick={toggle}
          disabled={updatePlan.isPending || blocked}
        >
          <PackageCheck className="size-4" />
          {plan.collected ? "Undo collected" : "Mark as collected"}
        </Button>
      </CardContent>
    </Card>
  );
}

function PaymentRow({ plan, payment }: { plan: PssPlan; payment: PssPayment }) {
  return (
    <li className={`grid gap-2 rounded-2xl border border-border-soft p-3 ${payment.isReversed ? "bg-slate-50 opacity-75" : "bg-page-bg"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-semibold ${payment.isReversed ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {formatKobo(payment.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {methodLabel[payment.method]} · {formatDateTime(payment.createdAt)} · {payment.receiptNumber}
          </p>
          {payment.note ? <p className="text-xs text-muted-foreground">{payment.note}</p> : null}
          {payment.isReversed ? (
            <p className="text-xs text-red-700">Reversed: {payment.reversalReason}</p>
          ) : null}
        </div>
        <CustomerStatusBadge status={payment.customerStatus} reversed={payment.isReversed} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm" className="min-h-10">
          <Link href={`/pss/receipt/${payment.receiptNumber}?t=${encodeURIComponent(plan.shareToken)}`} target="_blank">
            <Receipt className="size-4" />
            Receipt
          </Link>
        </Button>
        {!payment.isReversed && plan.status !== "CANCELLED" ? <ReverseDialog plan={plan} payment={payment} /> : null}
      </div>
    </li>
  );
}

function ReverseDialog({ plan, payment }: { plan: PssPlan; payment: PssPayment }) {
  const reverse = useReversePssPayment();
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get("reason") || "").trim();
    try {
      await reverse.mutateAsync({ id: plan.id, paymentId: payment.id, reason });
      notify.success("Payment reversed. Record the correct amount if needed.");
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-10 text-destructive">
          <Undo2 className="size-4" />
          Reverse
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reverse {formatKobo(payment.amount)} ({payment.receiptNumber})?</DialogTitle>
          <DialogDescription>
            The payment stays in the history marked as reversed, and the balance goes back up. The customer will see the reason.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`reason-${payment.id}`}>Reason</label>
            <Input id={`reason-${payment.id}`} name="reason" minLength={3} maxLength={200} placeholder="e.g. Recorded twice" required />
          </div>
          <Button type="submit" variant="destructive" size="lg" disabled={reverse.isPending}>
            {reverse.isPending ? <InlineLoader label="Reversing" /> : "Reverse payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelPlan({ plan }: { plan: PssPlan }) {
  const updatePlan = useUpdatePssPlan();

  async function cancel() {
    try {
      await updatePlan.mutateAsync({ id: plan.id, payload: { cancel: true } });
      notify.success("Plan cancelled.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="min-h-11 justify-self-start text-destructive">
          <Ban className="size-4" />
          Cancel this plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this plan?</AlertDialogTitle>
          <AlertDialogDescription>
            No more payments can be recorded. Payments already made stay in the history. Settle any refund with the customer
            directly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep plan</AlertDialogCancel>
          <AlertDialogAction onClick={cancel}>Cancel plan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
