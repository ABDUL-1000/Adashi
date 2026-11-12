"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { FormSection } from "@/components/shared/FormSection";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useCreateGroup } from "@/hooks/groups/useCreateGroup";
import { dateInputToISO, toDateInputValue } from "@/lib/dates";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { Group } from "@/types/group.types";

const selectClassName =
  "h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20";

function getCreatedGroup(data: Group | { group?: Group }) {
  return "group" in data && data.group ? data.group : (data as Group);
}

export function CreateGroupForm() {
  const createGroup = useCreateGroup();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Group | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);

    const form = new FormData(event.currentTarget);

    try {
      const response = await createGroup.mutateAsync({
        name: String(form.get("name")).trim(),
        contributionAmount: Number(form.get("contributionAmount")),
        slots: Number(form.get("slots")),
        frequency: String(form.get("frequency")) as "WEEKLY" | "MONTHLY",
        startDate: dateInputToISO(String(form.get("startDate"))),
        joinAsContributor: form.get("joinAsContributor") === "on",
        inviteExpiresInDays: Number(form.get("inviteExpiresInDays")) || 30,
      });

      setCreated(getCreatedGroup(response.data));
      notify.success("Group created. Share the invite link with members.");
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  if (created) {
    const invite = created.invites?.[0];
    return (
      <div className="grid gap-5">
        <FormSection title="Group created" description={`Now invite your members to "${created.name}".`}>
          {invite ? (
            <InviteLinkBox
              code={invite.code}
              expiresAt={invite.expiresAt}
              groupName={created.name}
              contributionAmount={created.contributionAmount}
              frequency={created.frequency}
            />
          ) : null}
          <p className="text-sm text-muted-foreground">
            On the group page you can also add members by email, change the link expiry and set the payout order.
          </p>
          <Button asChild size="lg">
            <Link href={`/groups/${created.id}`}>Go to group</Link>
          </Button>
        </FormSection>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormSection
        title="Group basics"
        description="Name, how much each member pays per round, and how many members."
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="name">
            Group name
          </label>
          <Input id="name" name="name" placeholder="e.g. Family support circle" minLength={3} maxLength={100} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="contributionAmount">
              Contribution amount (₦)
            </label>
            <Input
              id="contributionAmount"
              name="contributionAmount"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              placeholder="50000"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="slots">
              Number of members
            </label>
            <Input id="slots" name="slots" type="number" inputMode="numeric" min="2" max="100" placeholder="10" required />
            <p className="text-xs text-muted-foreground">Include yourself if you contribute.</p>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Schedule"
        description="Members pay every week or month. Email reminders go out 3 days before, 1 day before and on the due day."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="frequency">
              Frequency
            </label>
            <select id="frequency" name="frequency" className={selectClassName}>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="startDate">
              Start date
            </label>
            <Calendar id="startDate" name="startDate" min={toDateInputValue(new Date())} required />
            <p className="text-xs text-muted-foreground">If the group fills up after this date, it starts on the day it fills.</p>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="You and the invite link"
        description="Choose whether you also contribute, and how long the invite link works."
      >
        <label className="flex min-h-11 items-start gap-3 rounded-2xl border border-border-soft bg-page-bg p-4 text-sm">
          <input type="checkbox" name="joinAsContributor" defaultChecked className="mt-0.5 size-4 accent-primary" />
          <span>
            <span className="font-medium text-foreground">I will contribute and collect too</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Untick if you only manage the group. You can change this until the first payment is recorded.
            </span>
          </span>
        </label>
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="inviteExpiresInDays">
            Invite link works for
          </label>
          <select id="inviteExpiresInDays" name="inviteExpiresInDays" defaultValue="14" className={selectClassName}>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
          <p className="text-xs text-muted-foreground">You can extend, shorten or expire it later.</p>
        </div>
      </FormSection>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={createGroup.isPending} size="lg">
        {createGroup.isPending ? <InlineLoader label="Creating group" /> : "Create group"}
      </Button>
    </form>
  );
}
