"use client";

import { FormEvent, useState } from "react";
import { Copy, Mail, UserCheck, UserMinus, X } from "lucide-react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useOrganizerMembership } from "@/hooks/groups/useOrganizerMembership";
import { useCancelMemberInvitation, useCreateMemberInvitation } from "@/hooks/invitations/useCreateMemberInvitation";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { GroupDetails } from "@/types/group.types";

/** Organiser tools while the group is still filling up. */
export function GroupSetupSection({ details, currentUserId }: { details: GroupDetails; currentUserId?: string }) {
  const { group, viewer, memberInvitations } = details;
  const invite = group.invites?.[0];
  const memberCount = group.members.length;
  const pendingCount = memberInvitations?.length ?? 0;
  const freeSlots = Math.max(group.slots - memberCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fill your group</CardTitle>
        <CardDescription>
          {memberCount} of {group.slots} slots filled. The group starts automatically when every slot is taken.
        </CardDescription>
        <Progress value={Math.round((memberCount / group.slots) * 100)} aria-label={`${memberCount} of ${group.slots} slots filled`} />
      </CardHeader>
      <CardContent className="grid gap-5">
        {invite ? (
          <section className="grid gap-2">
            <h3 className="text-sm font-semibold text-foreground">Invite with a link</h3>
            <InviteLinkBox
              code={invite.code}
              expiresAt={invite.expiresAt}
              groupId={group.id}
              groupName={group.name}
              contributionAmount={group.contributionAmount}
              frequency={group.frequency}
            />
          </section>
        ) : null}

        <AddMemberByEmail groupId={group.id} freeSlots={freeSlots - pendingCount} />

        {pendingCount ? <PendingInvitations details={details} /> : null}

        {viewer.canEditStructure ? (
          <OrganizerSlotToggle
            groupId={group.id}
            isMember={group.members.some((m) => m.userId === currentUserId)}
            freeSlots={freeSlots}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function AddMemberByEmail({ groupId, freeSlots }: { groupId: string; freeSlots: number }) {
  const createInvitation = useCreateMemberInvitation();
  const [lastLink, setLastLink] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const email = String(new FormData(formElement).get("email") || "").trim();
    setLastLink(null);

    try {
      const response = await createInvitation.mutateAsync({ groupId, email });
      if (response.data.emailSent) {
        notify.success(response.message || "Invitation sent.");
      } else {
        notify.error(response.message || "Invitation created but the email could not be sent.");
        setLastLink(response.data.link);
      }
      formElement.reset();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  async function copyLink() {
    if (!lastLink) return;
    try {
      await navigator.clipboard.writeText(lastLink);
      notify.success("Invitation link copied");
    } catch {
      notify.error("Unable to copy link");
    }
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold text-foreground">Add a member by email</h3>
      <p className="text-sm text-muted-foreground">
        They get an email and only join after they accept.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-2 sm:flex">
        <label className="sr-only" htmlFor={`invite-email-${groupId}`}>
          Member email
        </label>
        <Input
          id={`invite-email-${groupId}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="member@example.com"
          required
          disabled={freeSlots <= 0}
          className="sm:flex-1"
        />
        <Button type="submit" className="min-h-11" disabled={createInvitation.isPending || freeSlots <= 0}>
          {createInvitation.isPending ? (
            <InlineLoader label="Sending" />
          ) : (
            <>
              <Mail className="size-4" />
              Send invitation
            </>
          )}
        </Button>
      </form>
      {freeSlots <= 0 ? (
        <p className="text-xs text-muted-foreground">No free slots left (counting invitations waiting for an answer).</p>
      ) : null}
      {lastLink ? (
        <div className="grid gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <p>The email did not go through. Send them this link on WhatsApp instead:</p>
          <p className="break-all text-xs">{lastLink}</p>
          <Button type="button" variant="outline" className="min-h-11" onClick={copyLink}>
            <Copy className="size-4" />
            Copy invitation link
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function PendingInvitations({ details }: { details: GroupDetails }) {
  const cancelInvitation = useCancelMemberInvitation();

  async function handleCancel(invitationId: string) {
    try {
      const response = await cancelInvitation.mutateAsync({ groupId: details.group.id, invitationId });
      notify.success(response.message || "Invitation cancelled.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm font-semibold text-foreground">Waiting for an answer</h3>
      <ul className="grid gap-2">
        {details.memberInvitations.map((invitation) => (
          <li
            key={invitation.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-page-bg p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{invitation.email}</p>
              <p className="text-xs text-muted-foreground">Expires {formatDate(invitation.expiresAt)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              aria-label={`Cancel invitation for ${invitation.email}`}
              disabled={cancelInvitation.isPending}
              onClick={() => handleCancel(invitation.id)}
            >
              <X className="size-4" />
              Cancel
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OrganizerSlotToggle({
  groupId,
  isMember,
  freeSlots,
}: {
  groupId: string;
  isMember: boolean;
  freeSlots: number;
}) {
  const organizerMembership = useOrganizerMembership();

  async function toggle() {
    try {
      const response = await organizerMembership.mutateAsync({ groupId, join: !isMember });
      notify.success(response.message || "Updated.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <section className="grid gap-2 rounded-2xl border border-border-soft p-4">
      <h3 className="text-sm font-semibold text-foreground">Your own slot</h3>
      <p className="text-sm text-muted-foreground">
        {isMember
          ? "You are contributing and will collect in your turn. You can give up your slot and just manage the group."
          : "You manage this group without contributing. You can take a slot if you also want to contribute and collect."}
      </p>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 sm:w-fit"
        onClick={toggle}
        disabled={organizerMembership.isPending || (!isMember && freeSlots <= 0)}
      >
        {organizerMembership.isPending ? (
          <InlineLoader label="Saving" />
        ) : isMember ? (
          <>
            <UserMinus className="size-4" />
            Give up my slot
          </>
        ) : (
          <>
            <UserCheck className="size-4" />
            Take a slot as a member
          </>
        )}
      </Button>
      {!isMember && freeSlots <= 0 ? (
        <p className="text-xs text-muted-foreground">All slots are full. Increase the number of slots first.</p>
      ) : null}
    </section>
  );
}
