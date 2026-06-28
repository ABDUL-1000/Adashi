import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import type { Group } from "@/types/group.types";

export function GroupCard({
  group,
  href,
  showInviteLink = false,
}: {
  group: Group;
  href: string;
  showInviteLink?: boolean;
}) {
  const inviteCode = group.invites?.[0]?.code;

  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_65px_rgba(146,68,212,0.12)]">
      <Link href={href} className="block">
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
            <StatusBadge status={group.status} />
          </div>
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
      {showInviteLink && inviteCode ? (
        <CardContent className="pt-0">
          <InviteLinkBox code={inviteCode} />
        </CardContent>
      ) : null}
    </Card>
  );
}
