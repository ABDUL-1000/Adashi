"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Edit3, Trash2, Users } from "lucide-react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDeleteGroup } from "@/hooks/groups/useDeleteGroup";
import { canDeleteGroup, canEditGroup, isGroupOwner } from "@/lib/groupPermissions";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { Group } from "@/types/group.types";

export function GroupCard({
  group,
  href,
  currentUserId,
}: {
  group: Group;
  href: string;
  currentUserId?: string;
}) {
  const router = useRouter();
  const deleteGroup = useDeleteGroup();
  const inviteCode = group.invites?.[0]?.code;
  const ownsGroup = isGroupOwner(group, currentUserId);

  async function handleDeleteGroup() {
    try {
      const response = await deleteGroup.mutateAsync(group.id);
      notify.success(response.message || "Group deleted successfully.");
      router.push("/groups");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_65px_rgba(146,68,212,0.12)]">
      <Link href={href} className="block">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
            <StatusBadge status={group.status} />
          </div>
          <Badge variant={ownsGroup ? "default" : "secondary"} className="w-fit">
            {ownsGroup ? "Created by you" : "Joined group"}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Contribution</span>
            <p className="mt-1 text-2xl font-semibold leading-tight text-primary">{formatCurrency(group.contributionAmount)}</p>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4 text-primary" />
              <span>{formatDate(group.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4 text-primary" />
              <span>{group.members?.length ?? group.slots} slots</span>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardContent className="flex items-center gap-2 pt-0">
        {ownsGroup && canEditGroup(group, currentUserId) ? (
          <Button asChild size="icon-sm" variant="outline" aria-label="Edit group">
            <Link href={`/groups/${group.id}/edit`}>
              <Edit3 className="size-4" />
            </Link>
          </Button>
        ) : null}
        {ownsGroup && canDeleteGroup(group, currentUserId) ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon-sm" variant="destructive" aria-label="Delete group">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the pending group and cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteGroup}>
                  {deleteGroup.isPending ? "Deleting..." : "Delete group"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </CardContent>
      {ownsGroup && inviteCode ? (
        <CardContent className="pt-0">
          <InviteLinkBox code={inviteCode} />
        </CardContent>
      ) : null}
    </Card>
  );
}
