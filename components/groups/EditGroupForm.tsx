"use client";

import { FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { FormSection } from "@/components/shared/FormSection";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useUpdateGroup } from "@/hooks/groups/useUpdateGroup";
import { dateInputToISO, toDateInputValue } from "@/lib/dates";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { UpdateGroupPayload } from "@/types/group.types";

const selectClassName =
  "h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-60";

export function EditGroupForm() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const updateGroup = useUpdateGroup();
  const details = groupQuery.data?.data;
  const group = details?.group;
  const canEdit = Boolean(details?.viewer.isOrganizer && group?.status !== "COMPLETED");
  // Amount, size and schedule are locked once any payment or payout has been recorded.
  const structureLocked = !details?.viewer.canEditStructure;

  useEffect(() => {
    if (!details || canEdit) return;
    notify.error(
      details.viewer.isOrganizer ? "A completed group cannot be edited." : "Only the organiser can edit this group."
    );
    router.replace(`/groups/${details.group.id}`);
  }, [canEdit, details, router]);

  if (groupQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (!group || !canEdit) {
    return null;
  }

  const editableGroup = group;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload: UpdateGroupPayload = { name: String(form.get("name")).trim() };
    if (!structureLocked) {
      payload.contributionAmount = Number(form.get("contributionAmount"));
      payload.slots = Number(form.get("slots"));
      payload.frequency = String(form.get("frequency")) as "WEEKLY" | "MONTHLY";
      payload.startDate = dateInputToISO(String(form.get("startDate")));
    }

    try {
      const response = await updateGroup.mutateAsync({ id: editableGroup.id, payload });
      notify.success(response.message || "Group updated successfully.");
      router.push(`/groups/${editableGroup.id}`);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {structureLocked ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Payments or payouts have been recorded, so only the name can change. This protects the group&apos;s records.
        </p>
      ) : null}
      <FormSection title="Group basics" description="Name, contribution amount and number of members.">
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="name">
            Group name
          </label>
          <Input id="name" name="name" defaultValue={editableGroup.name} minLength={3} maxLength={100} required />
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
              defaultValue={Number(editableGroup.contributionAmount)}
              disabled={structureLocked}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="slots">
              Number of members
            </label>
            <Input
              id="slots"
              name="slots"
              type="number"
              inputMode="numeric"
              min={Math.max(2, editableGroup.members.length)}
              max="100"
              defaultValue={editableGroup.slots}
              disabled={structureLocked}
              required
            />
          </div>
        </div>
      </FormSection>
      <FormSection title="Schedule" description="How often members pay and when the first round starts.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="frequency">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              defaultValue={editableGroup.frequency}
              disabled={structureLocked}
              className={selectClassName}
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="startDate">
              Start date
            </label>
            <Calendar
              id="startDate"
              name="startDate"
              defaultValue={toDateInputValue(editableGroup.startDate)}
              disabled={structureLocked}
              required
            />
          </div>
        </div>
      </FormSection>
      <Button type="submit" disabled={updateGroup.isPending} size="lg">
        {updateGroup.isPending ? <InlineLoader label="Saving" /> : "Save changes"}
      </Button>
    </form>
  );
}
