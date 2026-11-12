"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { FormSection } from "@/components/shared/FormSection";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePssPlan } from "@/hooks/pss/usePss";
import { dateInputToISO, toDateInputValue } from "@/lib/dates";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { nairaInputToKobo } from "@/lib/money";
import { notify } from "@/lib/notify";
import { normalizeNigerianPhone } from "@/lib/phone";
import type { PssCollectionRule, PssPaymentMethod } from "@/types/pss.types";

const selectClassName =
  "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

export function CreatePlanForm() {
  const router = useRouter();
  const createPlan = useCreatePssPlan();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    const phone = normalizeNigerianPhone(String(form.get("customerPhone")));
    const totalPrice = nairaInputToKobo(form.get("totalPrice"));
    const depositRaw = String(form.get("deposit") || "").trim();
    const deposit = depositRaw ? nairaInputToKobo(depositRaw) : 0;
    const dueDate = String(form.get("dueDate") || "");

    if (!phone) return setError("Enter a valid Nigerian phone number, e.g. 0803 123 4567.");
    if (!totalPrice || totalPrice <= 0) return setError("Enter the total price, e.g. 150000.");
    if (deposit === null) return setError("Enter the deposit as a number, e.g. 30000.");
    if (deposit > totalPrice) return setError("Deposit cannot be more than the total price.");

    try {
      const response = await createPlan.mutateAsync({
        customerName: String(form.get("customerName")).trim(),
        customerPhone: phone,
        itemName: String(form.get("itemName")).trim(),
        itemDescription: String(form.get("itemDescription") || "").trim() || undefined,
        totalPrice,
        deposit: deposit || undefined,
        depositMethod: deposit ? (String(form.get("depositMethod")) as PssPaymentMethod) : undefined,
        dueDate: dueDate ? dateInputToISO(dueDate) : null,
        collectionRule: String(form.get("collectionRule")) as PssCollectionRule,
      });
      notify.success("Plan created. Share it with your customer.");
      router.push(`/pay-small-small/${response.data.id}`);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormSection title="Customer" description="Who is buying.">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="customerName">Customer name</label>
          <Input id="customerName" name="customerName" autoComplete="off" minLength={2} maxLength={100} required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="customerPhone">Customer phone (WhatsApp)</label>
          <Input
            id="customerPhone"
            name="customerPhone"
            type="tel"
            inputMode="tel"
            placeholder="0803 123 4567"
            required
          />
          <p className="text-xs text-muted-foreground">The customer uses the last 4 digits to confirm payments.</p>
        </div>
      </FormSection>

      <FormSection title="Item" description="What they are buying and the full price.">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="itemName">Item</label>
          <Input id="itemName" name="itemName" placeholder="e.g. Samsung A15 phone" minLength={2} maxLength={120} required />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="itemDescription">Description (optional)</label>
          <Input id="itemDescription" name="itemDescription" placeholder="Colour, size, serial number..." maxLength={500} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="totalPrice">Total price (₦)</label>
            <Input id="totalPrice" name="totalPrice" inputMode="decimal" placeholder="150000" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="dueDate">Pay by (optional)</label>
            <Input id="dueDate" name="dueDate" type="date" min={toDateInputValue(new Date())} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Deposit" description="If they paid something today, it is recorded as the first payment.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="deposit">Deposit paid today (₦, optional)</label>
            <Input id="deposit" name="deposit" inputMode="decimal" placeholder="0" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="depositMethod">Paid by</label>
            <select id="depositMethod" name="depositMethod" className={selectClassName} defaultValue="CASH">
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection title="When can they take the item?">
        <fieldset className="grid gap-2">
          <legend className="sr-only">Collection rule</legend>
          <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-input p-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input type="radio" name="collectionRule" value="PAY_BEFORE_COLLECT" defaultChecked className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium text-foreground">After full payment</span>
              <span className="block text-xs text-muted-foreground">Item stays in the shop until the balance is ₦0.</span>
            </span>
          </label>
          <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-input p-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
            <input type="radio" name="collectionRule" value="COLLECT_AFTER_PART_PAYMENT" className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium text-foreground">After part payment</span>
              <span className="block text-xs text-muted-foreground">Customer can take the item and keep paying.</span>
            </span>
          </label>
        </fieldset>
      </FormSection>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={createPlan.isPending}>
        {createPlan.isPending ? <InlineLoader label="Creating plan" /> : "Create plan"}
      </Button>
    </form>
  );
}
