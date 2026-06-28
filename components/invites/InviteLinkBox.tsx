"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { buildInviteLink } from "@/lib/invite";
import { notify } from "@/lib/notify";

export function InviteLinkBox({ code }: { code: string }) {
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
      await navigator.share({
        title: "Join my Adashi group",
        text: `Use invite code ${code} to join this Adashi group.`,
        url: inviteLink,
      });
    } catch {
      notify.error("Unable to copy invite link");
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
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary">
          <Check className="size-3" />
          Active
        </span>
      </div>
      <div className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-muted-foreground break-all">
        {inviteLink || "Generating invite link..."}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyInviteLink}
          disabled={!inviteLink}
        >
          <Copy className="size-4" />
          Copy
        </Button>
        {canShare ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={shareInviteLink}
            disabled={!inviteLink}
          >
            <Share2 className="size-4" />
            Share
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function subscribeToBrowserSnapshot() {
  return () => undefined;
}
