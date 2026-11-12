"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, Printer } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { usePssReceipt } from "@/hooks/pss/usePss";
import { formatDateTime } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { formatKobo } from "@/lib/money";
import { whatsappLink } from "@/lib/phone";
import { methodLabel, receiptLink } from "./PssShared";

const customerStatusText = {
  PENDING: "Not yet confirmed by customer",
  CONFIRMED: "Confirmed by customer",
  DISPUTED: "Disputed by customer",
} as const;

export function ReceiptView({ receiptNumber, token }: { receiptNumber: string; token: string }) {
  const receiptQuery = usePssReceipt(token, receiptNumber);
  const receipt = receiptQuery.data?.data;

  return (
    <main className="min-h-screen bg-page-bg px-4 py-6 print:bg-white print:p-0">
      <div className="mx-auto grid max-w-md gap-4">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button asChild variant="ghost" className="min-h-11">
            <Link href={`/pss/${token}`}>
              <ArrowLeft className="size-4" />
              All payments
            </Link>
          </Button>
        </div>

        {!token ? <EmptyState title="Receipt link is incomplete" /> : null}
        {receiptQuery.isLoading ? <EmptyState title="Loading receipt..." /> : null}
        {receiptQuery.isError ? (
          <EmptyState title="Receipt not found" description={getErrorMessage(receiptQuery.error)} />
        ) : null}

        {receipt ? (
          <>
            <article className="relative grid gap-4 overflow-hidden rounded-3xl border border-border-soft bg-white p-6 text-sm print:rounded-none print:border-0">
              {receipt.isReversed ? (
                <Stamp text="REVERSED" className="border-red-600 text-red-600" />
              ) : receipt.fullyPaid ? (
                <Stamp text="FULLY PAID" className="border-emerald-600 text-emerald-600" />
              ) : null}

              <header className="grid gap-1 border-b border-dashed border-border-soft pb-4 text-center">
                <p className="text-lg font-bold text-foreground">{receipt.shopName}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Pay Small Small receipt</p>
                <p className="font-mono text-base font-semibold text-foreground">{receipt.receiptNumber}</p>
              </header>

              <dl className="grid gap-2">
                <Row label="Customer" value={receipt.customerName} />
                <Row label="Item" value={receipt.itemName} />
                <Row label="Date" value={formatDateTime(receipt.paidAt)} />
                <Row label="Method" value={methodLabel[receipt.method]} />
                {receipt.note ? <Row label="Note" value={receipt.note} /> : null}
              </dl>

              <div className="grid gap-1 rounded-2xl bg-page-bg p-4 text-center print:border print:border-black">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Amount paid</p>
                <p className={`text-3xl font-bold ${receipt.isReversed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {formatKobo(receipt.amount)}
                </p>
              </div>

              <dl className="grid gap-2 border-t border-dashed border-border-soft pt-4">
                <Row label="Item price" value={formatKobo(receipt.totalPrice)} />
                <Row label="Total paid so far" value={formatKobo(receipt.totalPaidSoFar)} />
                <Row label="Balance remaining" value={formatKobo(receipt.balanceRemaining)} strong />
                <Row label="Status" value={customerStatusText[receipt.customerStatus]} />
              </dl>

              {receipt.isReversed ? (
                <p className="rounded-xl bg-red-50 p-3 text-xs text-red-800">
                  This payment was reversed by the shop: {receipt.reversalReason}. It is not counted.
                </p>
              ) : null}

              <footer className="border-t border-dashed border-border-soft pt-3 text-center text-[11px] text-muted-foreground">
                Totals are as at this payment. Record kept with Adashi; Adashi does not hold money.
              </footer>
            </article>

            <div className="grid grid-cols-2 gap-2 print:hidden">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => window.print()}>
                <Printer className="size-4" />
                Print / Save PDF
              </Button>
              <Button asChild className="min-h-11">
                <a
                  href={whatsappLink(
                    `Receipt ${receipt.receiptNumber}: ${formatKobo(receipt.amount)} paid for ${receipt.itemName}. Balance: ${formatKobo(receipt.balanceRemaining)}. ${receiptLink(token, receipt.receiptNumber)}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right ${strong ? "font-bold text-foreground" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}

function Stamp({ text, className }: { text: string; className: string }) {
  return (
    <div
      aria-label={text}
      className={`pointer-events-none absolute right-4 top-20 rotate-[-14deg] rounded-lg border-4 px-3 py-1 text-xl font-black tracking-widest opacity-80 ${className}`}
    >
      {text}
    </div>
  );
}
