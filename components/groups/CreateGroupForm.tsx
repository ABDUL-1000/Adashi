"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { FormSection } from "@/components/shared/FormSection";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { InviteLinkDialog } from "@/components/shared/InviteLinkDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useCreateGroup } from "@/hooks/groups/useCreateGroup";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/services/api";
import type { Group, PayoutMethod } from "@/types/group.types";

function parseReminderDays(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item));
}

function getCreatedGroup(data: Group | { group?: Group; inviteLink?: string }) {
  return "group" in data && data.group ? data.group : (data as Group);
}

export function CreateGroupForm() {
  const router = useRouter();
  const createGroup = useCreateGroup();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("ORGANIZER_SELECTED");
  const [inviteOpen, setInviteOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setInviteLink(null);

    const form = new FormData(event.currentTarget);

    try {
      const response = await createGroup.mutateAsync({
        name: String(form.get("name")),
        contributionAmount: Number(form.get("contributionAmount")),
        slots: Number(form.get("slots")),
        frequency: String(form.get("frequency")) as "WEEKLY" | "MONTHLY",
        startDate: String(form.get("startDate")),
        payoutMethod: String(form.get("payoutMethod")) as PayoutMethod,
        reminderDaysBeforeDueDate: parseReminderDays(
          String(form.get("reminderDaysBeforeDueDate"))
        ),
        autoDeductionEnabled: form.get("autoDeductionEnabled") === "on",
      });

      const returnedInviteLink =
        "inviteLink" in response.data ? response.data.inviteLink : undefined;
      const group = getCreatedGroup(response.data);

      if (returnedInviteLink) {
        setInviteLink(returnedInviteLink);
        setInviteOpen(true);
        setSuccess("Group created. Share the invite link with members.");
        notify.success("Group created. Share the invite link with members.");
        return;
      }

      setSuccess(response.message);
      notify.success(response.message || "Group created successfully.");
      router.push(`/organizer/groups/${group.id}`);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  const payoutOptions: Array<{ value: PayoutMethod; title: string; description: string }> = [
    {
      value: "ORGANIZER_SELECTED",
      title: "Organizer Selected",
      description: "You control the payout order before the cycle begins.",
    },
    {
      value: "FIRST_COME_FIRST_SERVED",
      title: "First Come First Served",
      description: "Members receive payout positions in the order they join.",
    },
    {
      value: "RANDOM",
      title: "Random",
      description: "Adashi assigns the payout order randomly.",
    },
  ];

  return (
    <>
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormSection
        title="Group basics"
        description="Set the visible name, contribution amount, and available slots."
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="name">
            Group name
          </label>
          <Input id="name" name="name" placeholder="e.g. Family support circle" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="contributionAmount">
              Contribution amount
            </label>
            <Input id="contributionAmount" name="contributionAmount" type="number" min="1" placeholder="50000" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="slots">
              Slots
            </label>
            <Input id="slots" name="slots" type="number" min="2" placeholder="10" required />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Schedule and reminders"
        description="Choose when cycles begin and how early members should be reminded."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="frequency">
              Frequency
            </label>
            <select id="frequency" name="frequency" className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20">
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="startDate">
              Start date
            </label>
            <Calendar id="startDate" name="startDate" required />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="reminderDaysBeforeDueDate">
            Reminder days before due date
          </label>
          <Input id="reminderDaysBeforeDueDate" name="reminderDaysBeforeDueDate" defaultValue="10,5,2" />
          <p className="text-xs text-muted-foreground">Separate multiple reminder days with commas.</p>
        </div>
      </FormSection>

      <FormSection
        title="Payout rules"
        description="Select how member payout positions should be assigned."
      >
        <input type="hidden" name="payoutMethod" value={payoutMethod} />
        <div className="grid gap-3 lg:grid-cols-3">
          {payoutOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPayoutMethod(option.value)}
              className={cn(
                "rounded-2xl border border-border-soft bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary-soft",
                payoutMethod === option.value && "border-primary bg-primary-soft ring-2 ring-primary/10"
              )}
            >
              <span className="text-sm font-medium text-foreground">{option.title}</span>
              <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                {option.description}
              </span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-border-soft bg-page-bg p-4 text-sm font-medium">
          <input type="checkbox" name="autoDeductionEnabled" className="size-4 accent-primary" />
          Enable wallet auto deduction
        </label>
      </FormSection>

      {inviteLink ? (
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="rounded-2xl border border-primary/25 bg-primary-soft p-4 text-left text-sm text-primary"
        >
          Group created. Open invite link.
        </button>
      ) : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={createGroup.isPending} size="lg">
        {createGroup.isPending ? <InlineLoader label="Creating group" /> : "Create group"}
      </Button>
    </form>
    <InviteLinkDialog inviteLink={inviteLink} open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
