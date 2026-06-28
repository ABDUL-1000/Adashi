"use client";

import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notify";

export function InviteLinkDialog({
  inviteLink,
  open,
  onOpenChange,
}: {
  inviteLink: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    notify.success("Invite link copied.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share invite link</DialogTitle>
          <DialogDescription>
            Send this link to members so they can join the group.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-border-soft bg-page-bg p-3 text-sm break-all">
          {inviteLink}
        </div>
        <Button type="button" onClick={copyLink}>
          <Copy className="size-4" /> Copy link
        </Button>
      </DialogContent>
    </Dialog>
  );
}
