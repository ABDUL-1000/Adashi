"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  CreditCard,
  Edit3,
  GripVertical,
  Send,
  Trash2,
  UserMinus,
  Users,
  Wallet,
} from "lucide-react";

import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { StateCard } from "@/components/shared/StateCard";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfile } from "@/hooks/auth/useProfile";
import { useDeleteGroup } from "@/hooks/groups/useDeleteGroup";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useRemoveGroupMember } from "@/hooks/groups/useRemoveGroupMember";
import { useReorderGroupPositions } from "@/hooks/groups/useReorderGroupPositions";
import { useManualPayout } from "@/hooks/payouts/useManualPayout";
import { useTriggerReminder } from "@/hooks/reminders/useTriggerReminder";
import { useGetWallet } from "@/hooks/wallet/useGetWallet";
import {
  canDeleteGroup,
  canEditGroup,
  canRemoveMember,
  canReorderMembers,
  isGroupOwner,
} from "@/lib/groupPermissions";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { Group, GroupMember } from "@/types/group.types";

export function GroupDetailsView() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const profileQuery = useProfile();
  const walletQuery = useGetWallet();
  const triggerReminder = useTriggerReminder();
  const deleteGroup = useDeleteGroup();
  const currentUserId = profileQuery.data?.data.id;

  if (groupQuery.isLoading || profileQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (groupQuery.isError) {
    return (
      <EmptyState
        title="Could not load group"
        description={getErrorMessage(groupQuery.error)}
      />
    );
  }

  const details = groupQuery.data?.data;
  if (!details) {
    return <EmptyState title="Group not found" />;
  }

  const group = details.group;
  const ownsGroup = isGroupOwner(group, currentUserId);
  const inviteCode = group.invites?.[0]?.code;
  const walletBalance = Number(walletQuery.data?.data.balance ?? 0);
  const contributionAmount = Number(group.contributionAmount);
  const hasLowBalance = walletQuery.isSuccess && walletBalance < contributionAmount;

  async function handleTriggerReminder() {
    try {
      const response = await triggerReminder.mutateAsync();
      notify.success(response.message || "Reminder triggered successfully.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

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
    <div className="grid gap-6">
      <PageHeader
        title={group.name}
        description={`Organized by ${group.organizer.name}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={group.status} />
            <Badge variant={ownsGroup ? "default" : "secondary"}>
              {ownsGroup ? "Created by you" : "Joined group"}
            </Badge>
            {ownsGroup && canEditGroup(group, currentUserId) ? (
              <Button asChild variant="outline" size="icon" aria-label="Edit group">
                <Link href={`/groups/${group.id}/edit`}>
                  <Edit3 className="size-4" />
                </Link>
              </Button>
            ) : null}
            {ownsGroup && canDeleteGroup(group, currentUserId) ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" aria-label="Delete group">
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
            {ownsGroup ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleTriggerReminder}
                disabled={triggerReminder.isPending}
              >
                {triggerReminder.isPending ? <InlineLoader label="Triggering" /> : "Trigger Reminder"}
              </Button>
            ) : null}
            {ownsGroup && details.currentCycle ? (
              <ManualPayoutDialog
                groupId={group.id}
                cycleId={details.currentCycle.id}
                members={group.members}
                defaultAmount={contributionAmount}
              />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StateCard title="Contribution" value={formatCurrency(group.contributionAmount)} icon={Wallet} />
        <StateCard title="Frequency" value={group.frequency} icon={CalendarDays} />
        <StateCard title="Start date" value={formatDate(group.startDate)} icon={CalendarDays} />
        <StateCard title="Payout position" value={details.userContext?.payoutPosition ?? "Not joined"} icon={Users} />
      </div>

      {ownsGroup && inviteCode ? <InviteLinkBox code={inviteCode} /> : null}

      <Card className="bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_55%,#cfacec3d_100%)]">
        <CardHeader>
          <CardTitle>Wallet and reminders</CardTitle>
          <CardDescription>Members should keep wallet balances ready before each due date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
          <p>Reminder settings stay attached to this group&apos;s contribution cycle.</p>
          <p className="font-medium text-foreground">
            Wallet balance: {formatCurrency(walletQuery.data?.data.balance)}
          </p>
          {hasLowBalance ? (
            <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
              Your wallet balance is below your next contribution. Please top up before the due date.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current cycle</CardTitle>
        </CardHeader>
        <CardContent>
          {details.currentCycle ? (
            <p className="text-sm">
              Cycle {details.currentCycle.cycleNumber}: {formatDate(details.currentCycle.startDate)} to{" "}
              {formatDate(details.currentCycle.endDate)}
            </p>
          ) : (
            <EmptyState title="No active cycle yet" />
          )}
        </CardContent>
      </Card>

      <PayoutOrderSection
        key={`${group.id}-${group.updatedAt}-${group.members.length}`}
        group={group}
        currentUserId={currentUserId}
      />

      <MembersSection group={group} currentUserId={currentUserId} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LedgerCard title="Payments" items={details.ledger.payments ?? []} icon={<CreditCard className="size-5" />} />
        <LedgerCard title="Payouts" items={details.ledger.payouts ?? []} icon={<Wallet className="size-5" />} />
      </div>
    </div>
  );
}

function PayoutOrderSection({
  group,
  currentUserId,
}: {
  group: Group & { members: GroupMember[] };
  currentUserId?: string;
}) {
  const reorderPositions = useReorderGroupPositions();
  const canReorder = canReorderMembers(group, currentUserId);
  const sortedMembers = useMemo(
    () => [...group.members].sort((a, b) => a.payoutPosition - b.payoutPosition),
    [group.members]
  );
  const [orderedMembers, setOrderedMembers] = useState(sortedMembers);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedMembers((members) => {
      const oldIndex = members.findIndex((member) => member.id === active.id);
      const newIndex = members.findIndex((member) => member.id === over.id);
      return arrayMove(members, oldIndex, newIndex);
    });
  }

  async function handleSaveOrder() {
    try {
      const response = await reorderPositions.mutateAsync({
        groupId: group.id,
        payload: {
          positions: orderedMembers.map((member, index) => ({
            memberId: member.id,
            position: index + 1,
          })),
        },
      });
      notify.success(response.message || "Payout order updated.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle>Payout Order</CardTitle>
        <CardDescription>
          {canReorder
            ? "Drag members to adjust payout positions while the group is pending."
            : "Payout positions for this group."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {orderedMembers.length ? (
          canReorder ? (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={orderedMembers.map((member) => member.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-2">
                    {orderedMembers.map((member, index) => (
                      <SortableMember key={member.id} member={member} position={index + 1} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                type="button"
                className="w-full sm:w-fit"
                onClick={handleSaveOrder}
                disabled={reorderPositions.isPending}
              >
                {reorderPositions.isPending ? <InlineLoader label="Saving order" /> : "Save Order"}
              </Button>
            </>
          ) : (
            <div className="grid gap-2">
              {orderedMembers.map((member) => (
                <MemberOrderRow key={member.id} member={member} position={member.payoutPosition} />
              ))}
            </div>
          )
        ) : (
          <EmptyState title="No payout order yet" />
        )}
      </CardContent>
    </Card>
  );
}

function SortableMember({
  member,
  position,
}: {
  member: GroupMember;
  position: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: member.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <MemberOrderRow
        member={member}
        position={position}
        handle={
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-border-soft bg-white text-muted-foreground"
            aria-label="Drag member"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  );
}

function MemberOrderRow({
  member,
  position,
  handle,
}: {
  member: GroupMember;
  position: number;
  handle?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-page-bg p-3">
      {handle}
      <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {position}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{member.user.name}</p>
        <p className="truncate text-sm text-muted-foreground">{member.user.email}</p>
      </div>
    </div>
  );
}

function MembersSection({
  group,
  currentUserId,
}: {
  group: Group & { members: GroupMember[] };
  currentUserId?: string;
}) {
  const removeMember = useRemoveGroupMember();
  const canRemove = canRemoveMember(group, currentUserId);

  async function handleRemoveMember(memberId: string) {
    try {
      const response = await removeMember.mutateAsync({ groupId: group.id, memberId });
      notify.success(response.message || "Member removed successfully.");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        {group.members.length ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-border-soft md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Payout position</TableHead>
                    {canRemove ? <TableHead className="w-12" /> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.user.name}</TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>{member.user.phone}</TableCell>
                      <TableCell>{member.payoutPosition}</TableCell>
                      {canRemove ? (
                        <TableCell>
                          <RemoveMemberDialog
                            memberName={member.user.name}
                            isPending={removeMember.isPending}
                            onConfirm={() => handleRemoveMember(member.id)}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {group.members.map((member) => (
                <div key={member.id} className="rounded-2xl border border-border-soft bg-page-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{member.user.name}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                    {canRemove ? (
                      <RemoveMemberDialog
                        memberName={member.user.name}
                        isPending={removeMember.isPending}
                        onConfirm={() => handleRemoveMember(member.id)}
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm font-medium text-primary">
                    Payout position {member.payoutPosition}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState title="No members yet" />
        )}
      </CardContent>
    </Card>
  );
}

function RemoveMemberDialog({
  memberName,
  isPending,
  onConfirm,
}: {
  memberName: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="icon-sm" variant="destructive" aria-label="Remove member">
          <UserMinus className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the member from the pending group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isPending ? "Removing..." : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LedgerCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: Array<Record<string, unknown>>;
  icon?: React.ReactNode;
}) {
  const visibleItems = items.filter((item) => Object.keys(item).length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary-soft text-primary">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleItems.length ? (
          <div className="overflow-hidden rounded-2xl border border-border-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.map((item, index) => (
                  <TableRow key={String(item.id ?? index)}>
                    <TableCell>{formatCurrency(getString(item.amount))}</TableCell>
                    <TableCell><StatusBadge status={getString(item.status) || "PENDING"} /></TableCell>
                    <TableCell>{formatDate(getString(item.createdAt) || getString(item.paidAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState title={`No ${title.toLowerCase()} yet`} />
        )}
      </CardContent>
    </Card>
  );
}

function ManualPayoutDialog({
  groupId,
  cycleId,
  members,
  defaultAmount,
}: {
  groupId: string;
  cycleId: string;
  members: Array<{ userId: string; user: { name: string }; payoutPosition: number }>;
  defaultAmount: number;
}) {
  const manualPayout = useManualPayout();
  const [open, setOpen] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const response = await manualPayout.mutateAsync({
        groupId,
        cycleId,
        receiverUserId: String(form.get("receiverUserId")),
        amount: Number(form.get("amount")),
      });
      notify.success(response.message || "Manual payout submitted.");
      setOpen(false);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Send className="size-4" />
          Manual Payout
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual payout</DialogTitle>
          <DialogDescription>
            Select a receiver and amount for the current contribution cycle.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="receiverUserId">
              Receiver
            </label>
            <select
              id="receiverUserId"
              name="receiverUserId"
              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
              required
            >
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name} - position {member.payoutPosition}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="amount">
              Amount
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              defaultValue={defaultAmount}
              required
            />
          </div>
          <Button type="submit" disabled={manualPayout.isPending}>
            {manualPayout.isPending ? <InlineLoader label="Submitting" /> : "Confirm payout"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
