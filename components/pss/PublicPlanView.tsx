"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Receipt, ShieldAlert } from "lucide-react";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
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
import { usePssPublicPlan, useRespondToPssPayment } from "@/hooks/pss/usePss";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { formatKobo } from "@/lib/money";
import { notify } from "@/lib/notify";
import { pssService } from "@/services/pss.service";
import { useAuthStore } from "@/store/authStore";
import type { PssPayment } from "@/types/pss.types";
import { CustomerStatusBadge, PlanStatusBadge, TotalsBlock, collectionRuleLabel, methodLabel } from "./PssShared";

export function PublicPlanView({ token }: { token: string }) {
  const planQuery = usePssPublicPlan(token);
  const plan = planQuery.data?.data;
  const [last4, setLast4] = useState("");

  return (
    <main className="min-h-screen bg-page-bg px-4 pb-16">
      <div className="mx-auto grid max-w-xl gap-4">
        <header className="py-5">
          <BrandLogo />
        </header>

        {planQuery.isLoading ? <EmptyState title="Loading..." /> : null}
        {planQuery.isError ? (
          <EmptyState title="Link not found" description={getErrorMessage(planQuery.error)} />
        ) : null}

        {plan ? (
          <>
            <LinkToAccount token={token} />
            <Card>
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{plan.shopName}</p>
                    <CardTitle className="mt-1 text-xl">{plan.itemName}</CardTitle>
                  </div>
                  <PlanStatusBadge status={plan.status} />
                </div>
                <CardDescription>
                  For {plan.customerName}
                  {plan.dueDate ? ` · pay by ${formatDate(plan.dueDate)}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <TotalsBlock totals={plan} />
                {plan.itemDescription ? <p className="text-sm text-muted-foreground">{plan.itemDescription}</p> : null}
                <p className="text-sm text-muted-foreground">
                  {collectionRuleLabel[plan.collectionRule]}. {plan.collected ? "Item collected." : "Item not collected yet."}
                </p>
                {plan.status === "COMPLETED" ? (
                  <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="size-5" /> Fully paid
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Check each payment. Tap Confirm if it is correct, or Dispute if it is not.</CardDescription>
              </CardHeader>
              <CardContent>
                {plan.payments.length ? (
                  <ul className="grid gap-2">
                    {plan.payments.map((payment) => (
                      <PublicPaymentRow
                        key={payment.id}
                        token={token}
                        payment={payment}
                        last4={last4}
                        onLast4={setLast4}
                      />
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No payments yet" />
                )}
              </CardContent>
            </Card>
            <p className="text-center text-xs text-muted-foreground">
              Adashi keeps a record only. Adashi does not collect or hold money.
            </p>
          </>
        ) : null}
      </div>
    </main>
  );
}

function PublicPaymentRow({
  token,
  payment,
  last4,
  onLast4,
}: {
  token: string;
  payment: PssPayment;
  last4: string;
  onLast4: (value: string) => void;
}) {
  return (
    <li className={`grid gap-2 rounded-2xl border border-border-soft p-3 ${payment.isReversed ? "bg-slate-50 opacity-75" : "bg-page-bg"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-semibold ${payment.isReversed ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {formatKobo(payment.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {methodLabel[payment.method]} · {formatDateTime(payment.createdAt)}
          </p>
          {payment.isReversed ? <p className="text-xs text-red-700">Reversed by shop: {payment.reversalReason}</p> : null}
        </div>
        <CustomerStatusBadge status={payment.customerStatus} reversed={payment.isReversed} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm" className="min-h-10">
          <Link href={`/pss/receipt/${payment.receiptNumber}?t=${encodeURIComponent(token)}`}>
            <Receipt className="size-4" />
            {payment.receiptNumber}
          </Link>
        </Button>
        {!payment.isReversed && payment.customerStatus === "PENDING" ? (
          <>
            <RespondDialog token={token} payment={payment} action="confirm" last4={last4} onLast4={onLast4} />
            <RespondDialog token={token} payment={payment} action="dispute" last4={last4} onLast4={onLast4} />
          </>
        ) : null}
      </div>
    </li>
  );
}

function RespondDialog({
  token,
  payment,
  action,
  last4,
  onLast4,
}: {
  token: string;
  payment: PssPayment;
  action: "confirm" | "dispute";
  last4: string;
  onLast4: (value: string) => void;
}) {
  const respond = useRespondToPssPayment(token);
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await respond.mutateAsync({ paymentId: payment.id, last4, action });
      notify.success(response.message);
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={action === "confirm" ? "default" : "outline"} className="min-h-10">
          {action === "confirm" ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />}
          {action === "confirm" ? "Confirm" : "Dispute"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "confirm" ? "Confirm" : "Dispute"} {formatKobo(payment.amount)}?
          </DialogTitle>
          <DialogDescription>
            {action === "confirm"
              ? "Confirm only if you really paid this amount."
              : "Dispute if you did not pay this, or the amount is wrong. The shop will see it."}{" "}
            Enter the last 4 digits of your phone number to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor={`last4-${payment.id}-${action}`}>
              Last 4 digits of your phone
            </label>
            <Input
              id={`last4-${payment.id}-${action}`}
              inputMode="numeric"
              autoComplete="off"
              pattern="\d{4}"
              maxLength={4}
              value={last4}
              onChange={(event) => onLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
              required
            />
          </div>
          <Button type="submit" size="lg" variant={action === "confirm" ? "default" : "destructive"} disabled={respond.isPending}>
            {respond.isPending ? <InlineLoader label="Saving" /> : action === "confirm" ? "Yes, I paid this" : "Dispute payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** If the visitor is logged in with the plan's phone number, link it so it shows in their dashboard. */
function LinkToAccount({ token }: { token: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [message, setMessage] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || attempted.current) return;
    attempted.current = true;
    pssService
      .linkToMe(token)
      .then((response) => {
        if (response.data.linked) setMessage(response.message);
      })
      .catch(() => undefined);
  }, [isAuthenticated, token]);

  if (!message) return null;
  return (
    <p className="rounded-2xl border border-primary/20 bg-primary-soft p-3 text-sm text-foreground">{message}</p>
  );
}
