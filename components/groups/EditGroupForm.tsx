"use client";

import { FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { FormSection } from "@/components/shared/FormSection";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/auth/useProfile";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useUpdateGroup } from "@/hooks/groups/useUpdateGroup";
import { canEditGroup, isGroupOwner } from "@/lib/groupPermissions";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";

function toDateInputValue(value: string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function EditGroupForm() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const profileQuery = useProfile();
  const updateGroup = useUpdateGroup();
  const group = groupQuery.data?.data.group;
  const userId = profileQuery.data?.data.id;

  useEffect(() => {
    if (!group || !userId) return;

    if (!isGroupOwner(group, userId) || !canEditGroup(group, userId)) {
      notify.error(
        group.status === "ACTIVE"
          ? "Active groups cannot be edited."
          : "Only the group creator can edit this group."
      );
      router.replace(`/groups/${group.id}`);
    }
  }, [group, router, userId]);

  if (groupQuery.isLoading || profileQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (!group || !canEditGroup(group, userId)) {
    return null;
  }

  const editableGroup = group;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const response = await updateGroup.mutateAsync({
        id: editableGroup.id,
        payload: {
          name: String(form.get("name")),
          contributionAmount: Number(form.get("contributionAmount")),
          slots: Number(form.get("slots")),
          frequency: String(form.get("frequency")) as "WEEKLY" | "MONTHLY",
          startDate: new Date(String(form.get("startDate"))).toISOString(),
        },
      });

      notify.success(response.message || "Group updated successfully.");
      router.push(`/groups/${editableGroup.id}`);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormSection
        title="Group basics"
        description="Update the editable group details before the cycle starts."
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-5" htmlFor="name">
            Group name
          </label>
          <Input id="name" name="name" defaultValue={editableGroup.name} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="contributionAmount">
              Contribution amount
            </label>
            <Input
              id="contributionAmount"
              name="contributionAmount"
              type="number"
              min="1"
              defaultValue={Number(editableGroup.contributionAmount)}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="slots">
              Slots
            </label>
            <Input
              id="slots"
              name="slots"
              type="number"
              min="2"
              defaultValue={editableGroup.slots}
              required
            />
          </div>
        </div>
      </FormSection>
      <FormSection title="Schedule" description="Update contribution cadence and start date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-5" htmlFor="frequency">
              Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              defaultValue={editableGroup.frequency}
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
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
