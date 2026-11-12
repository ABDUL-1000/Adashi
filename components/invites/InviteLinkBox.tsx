"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { Check, Clock, Copy, Link2Off, MessageCircle, RefreshCw, Share2 } from "lucide-react";

import { InlineLoader } from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateInvite } from "@/hooks/invites/useUpdateInvite";
import { dateTimeInputToISO, toDateTimeInputValue } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDateTime } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { buildInviteLink } from "@/lib/invite";
import { notify } from "@/lib/notify";

type InviteLinkBoxProps = {
  code: string;
  expiresAt?: string;
  /** When set, the organiser can change the expiry, expire the link or make a new one. */
  groupId?: string;
  groupName?: string;
  contributionAmount?: string;
  frequency?: string;
};

export function InviteLinkBox({ code, expiresAt, groupId, groupName, contributionAmount, frequency }: InviteLinkBoxProps) {
  const inviteLink = useSyncExternalStore(
    subscribeToBrowserSnapshot,
    () => buildInviteLink(code),
    () => ""
  );
  const canShare = useSyncExternalStore(
    subscribeToBrowserSnapshot,
    () => typeof navigator !== "undefined" && Boolean(navigator.share),
    () => false
  );
  // Time captured once on mount (render must stay pure).
  const [mountedAt] = useState(() => Date.now());
  const isExpired = expiresAt ? new Date(expiresAt).getTime() <= mountedAt : false;

  const whatsappMessage = [
    `Hello! I've set up our ${groupName ? `"${groupName}" ` : ""}savings group on Adashi so we can all see who has paid and who collects each round.`,
    contributionAmount
      ? `Contribution: ${formatCurrency(contributionAmount)}${frequency ? ` ${frequency.toLowerCase()}` : ""}.`
      : "",
    `Tap this link to join (it takes 2 minutes):`,
    inviteLink,
    expiresAt ? `The link works until ${formatDateTime(expiresAt)}.` : "",
    `Adashi does not hold our money. We keep paying the same way; I just record it in the app.`,
  ]
    .filter(Boolean)
    .join("\n");

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      notify.success("Invite link copied");
    } catch {
      notify.error("Unable to copy invite link");
    }
  }

  async function shareInviteLink() {
    if (!navigator.share || !inviteLink) return;
    try {
      await navigator.share({ title: "Join my Adashi group", text: whatsappMessage });
    } catch {
      // The user closed the share sheet; nothing to do.
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Invite code
          </p>
          <p className="mt-1 font-semibold text-primary">{code}</p>
        </div>
        {isExpired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            <Link2Off className="size-3" />
            Expired
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary">
            <Check className="size-3" />
            Active
          </span>
        )}
      </div>
      <div className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-muted-foreground break-all">
        {inviteLink || "Generating invite link..."}
      </div>
      {expiresAt ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {isExpired ? "Expired" : "Works until"} {formatDateTime(expiresAt)}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {!isExpired && inviteLink ? (
          <Button asChild className="min-h-11">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={copyInviteLink}
          disabled={!inviteLink}
        >
          <Copy className="size-4" />
          Copy link
        </Button>
        {canShare ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={shareInviteLink}
            disabled={!inviteLink || isExpired}
          >
            <Share2 className="size-4" />
            Share
          </Button>
        ) : null}
      </div>
      {groupId ? (
        <InviteExpiryControls groupId={groupId} expiresAt={expiresAt} isExpired={isExpired} now={mountedAt} />
      ) : null}
    </div>
  );
}

function InviteExpiryControls({
  groupId,
  expiresAt,
  isExpired,
  now,
}: {
  groupId: string;
  expiresAt?: string;
  isExpired: boolean;
  now: number;
}) {
  const updateInvite = useUpdateInvite();
  const [editing, setEditing] = useState(false);

  async function run(payload: Parameters<typeof updateInvite.mutateAsync>[0]["payload"], done?: () => void) {
    try {
      const response = await updateInvite.mutateAsync({ groupId, payload });
      notify.success(response.message || "Invite link updated.");
      done?.();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  function handleSaveExpiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("expiresAt") || "");
    if (!value) return;
    run({ expiresAt: dateTimeInputToISO(value) }, () => setEditing(false));
  }

  const defaultValue = toDateTimeInputValue(
    expiresAt && !isExpired ? expiresAt : new Date(now + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="grid gap-2 border-t border-primary/15 pt-3">
      {editing ? (
        <form onSubmit={handleSaveExpiry} className="grid gap-2 sm:flex sm:items-end">
          <div className="grid flex-1 gap-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`invite-expiry-${groupId}`}>
              Link works until (Nigeria time)
            </label>
            <Input
              id={`invite-expiry-${groupId}`}
              name="expiresAt"
              type="datetime-local"
              defaultValue={defaultValue}
              min={toDateTimeInputValue(new Date(now))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="submit" className="min-h-11" disabled={updateInvite.isPending}>
              {updateInvite.isPending ? <InlineLoader label="Saving" /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => setEditing(true)}>
            <Clock className="size-4" />
            {isExpired ? "Reopen link" : "Change expiry"}
          </Button>
          {!isExpired ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={updateInvite.isPending}
              onClick={() => run({ expireNow: true })}
            >
              <Link2Off className="size-4" />
              Expire now
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="col-span-2 min-h-11"
            disabled={updateInvite.isPending}
            onClick={() => run({ regenerate: true })}
          >
            <RefreshCw className="size-4" />
            New link (old one stops working)
          </Button>
        </div>
      )}
    </div>
  );
}

function subscribeToBrowserSnapshot() {
  return () => undefined;
}
