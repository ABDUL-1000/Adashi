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
  TouchSensor,
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
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Edit3,
  GripVertical,
  RotateCcw,
  Trash2,
  UserMinus,
  Users,
  Wallet,
} from "lucide-react";

import { GroupRoundSection } from "@/components/groups/GroupRoundSection";
import { GroupSetupSection, OrganizerSlotToggle } from "@/components/groups/GroupSetupSection";
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
import { useProfile } from "@/hooks/auth/useProfile";
import { useDeleteGroup } from "@/hooks/groups/useDeleteGroup";
import { useGetGroupDetails } from "@/hooks/groups/useGetGroupDetails";
import { useRemoveGroupMember } from "@/hooks/groups/useRemoveGroupMember";
import { useReorderGroupPositions } from "@/hooks/groups/useReorderGroupPositions";
import { useStartNewRound } from "@/hooks/groups/useStartNewRound";
import { dateInputToISO, lastPayDay, toDateInputValue } from "@/lib/dates";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import type { GroupDetails, GroupMember } from "@/types/group.types";

export function GroupDetailsView() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const groupId = params.groupId;
  const groupQuery = useGetGroupDetails(groupId);
  const profileQuery = useProfile();
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

  const { group, viewer } = details;
  const ownsGroup = viewer.isOrganizer;
  const canDelete = ownsGroup && group.status === "PENDING" && !viewer.hasActivity;

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
        description={`Organised by ${group.organizer.name}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={group.status} />
            <Badge variant={ownsGroup ? "default" : "secondary"}>
              {ownsGroup ? "You organise this" : "Member"}
            </Badge>
            {ownsGroup && group.status !== "COMPLETED" ? (
              <Button asChild variant="outline" className="min-h-11">
                <Link href={`/groups/${group.id}/edit`}>
                  <Edit3 className="size-4" />
                  Edit
                </Link>
              </Button>
            ) : null}
            {canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="min-h-11 text-destructive" aria-label="Delete group">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the group and its members. It cannot be undone.
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
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StateCard title="Contribution" value={formatCurrency(group.contributionAmount)} icon={Wallet} />
        <StateCard title="Frequency" value={group.frequency === "WEEKLY" ? "Weekly" : "Monthly"} icon={CalendarDays} />
        <StateCard title="Members" value={`${group.members.length}/${group.slots}`} icon={Users} />
        <StateCard
          title="Your turn"
          value={details.userContext ? `Position ${details.userContext.payoutPosition}` : "Not contributing"}
          icon={Users}
        />
      </div>

      {group.status === "PENDING" && ownsGroup ? (
        <GroupSetupSection details={details} currentUserId={currentUserId} />
      ) : null}

      {group.status === "PENDING" && !ownsGroup ? (
        <Card>
          <CardContent className="py-5 text-sm text-muted-foreground">
            Waiting for {group.slots - group.members.length} more member(s) to join. The first round starts on{" "}
            {formatDate(group.startDate)} or when the group is full, whichever is later.
          </CardContent>
        </Card>
      ) : null}

      {group.status === "ACTIVE" && ownsGroup && viewer.canEditStructure ? (
        <OrganizerSlotToggle
          groupId={group.id}
          isMember={group.members.some((m) => m.userId === currentUserId)}
          freeSlots={group.slots - group.members.length}
        />
      ) : null}

      {group.status === "COMPLETED" ? <RoundCompleteCard details={details} /> : null}

      {group.status !== "PENDING" ? <GroupRoundSection details={details} currentUserId={currentUserId} /> : null}

      <PayoutOrderSection
        key={`${group.id}-${group.updatedAt}-${group.members.map((m) => `${m.id}:${m.payoutPosition}`).join(",")}`}
        details={details}
      />

      <MembersSection details={details} currentUserId={currentUserId} />

      <HistorySection details={details} />
    </div>
  );
}

function RoundCompleteCard({ details }: { details: GroupDetails }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50">
      <CardHeader>
        <CardTitle>Round complete</CardTitle>
        <CardDescription className="text-emerald-900">
          Every member has collected. {details.viewer.isOrganizer ? "Start the next round when the group is ready." : ""}
        </CardDescription>
      </CardHeader>
      {details.viewer.isOrganizer ? (
        <CardContent>
          <NewRoundDialog details={details} />
        </CardContent>
      ) : null}
    </Card>
  );
}

function NewRoundDialog({ details }: { details: GroupDetails }) {
  const router = useRouter();
  const startNewRound = useStartNewRound();
  const [open, setOpen] = useState(false);
  const members = [...details.group.members].sort((a, b) => a.payoutPosition - b.payoutPosition);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const memberIds = form.getAll("memberIds").map(String);

    if (memberIds.length < 2) {
      notify.error("Choose at least 2 members to continue.");
      return;
    }

    try {
      const response = await startNewRound.mutateAsync({
        groupId: details.group.id,
        payload: { startDate: dateInputToISO(String(form.get("startDate"))), memberIds },
      });
      notify.success(response.message || "New round created.");
      setOpen(false);
      router.push(`/groups/${response.data.id}`);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11">
          <RotateCcw className="size-4" />
          Start a new round
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new round</DialogTitle>
          <DialogDescription>
            Same contribution and frequency. Untick anyone who is not continuing. Payout order stays the same; you can
            change it before the first payment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Continuing members</legend>
            {members.map((member) => (
              <label
                key={member.id}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-input px-3 text-sm"
              >
                <input type="checkbox" name="memberIds" value={member.id} defaultChecked className="size-4 accent-primary" />
                {member.payoutPosition}. {member.user.name}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="newRoundStart">
              First round starts on
            </label>
            <Input
              id="newRoundStart"
              name="startDate"
              type="date"
              min={toDateInputValue(new Date())}
              defaultValue={toDateInputValue(new Date())}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={startNewRound.isPending}>
            {startNewRound.isPending ? <InlineLoader label="Creating" /> : "Create new round"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PayoutOrderSection({ details }: { details: GroupDetails }) {
  const { group, viewer } = details;
  const reorderPositions = useReorderGroupPositions();
  const canReorder = viewer.canEditStructure && group.members.length > 1;
  const sortedMembers = useMemo(
    () => [...group.members].sort((a, b) => a.payoutPosition - b.payoutPosition),
    [group.members]
  );
  const [orderedMembers, setOrderedMembers] = useState(sortedMembers);
  const isDirty = orderedMembers.some((member, index) => member.id !== sortedMembers[index]?.id);
  const sensors = useSensors(
    // Small movement threshold so scrolling the page on a phone does not start a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
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

  function move(index: number, delta: number) {
    setOrderedMembers((members) => {
      const target = index + delta;
      if (target < 0 || target >= members.length) return members;
      return arrayMove(members, index, target);
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
        <CardTitle>Payout order</CardTitle>
        <CardDescription>
          {canReorder
            ? "Use the arrows (or drag) to set who collects first. You can change this until the first payment is recorded."
            : "Position 1 collects in round 1, position 2 in round 2, and so on."}
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
                      <SortableMember
                        key={member.id}
                        member={member}
                        position={index + 1}
                        onUp={index > 0 ? () => move(index, -1) : undefined}
                        onDown={index < orderedMembers.length - 1 ? () => move(index, 1) : undefined}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <Button
                type="button"
                className="min-h-11 w-full sm:w-fit"
                onClick={handleSaveOrder}
                disabled={reorderPositions.isPending || !isDirty}
              >
                {reorderPositions.isPending ? <InlineLoader label="Saving order" /> : "Save order"}
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
          <EmptyState title="No members yet" />
        )}
      </CardContent>
    </Card>
  );
}

function SortableMember({
  member,
  position,
  onUp,
  onDown,
}: {
  member: GroupMember;
  position: number;
  onUp?: () => void;
  onDown?: () => void;
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
            className="grid size-11 shrink-0 touch-none place-items-center rounded-xl border border-border-soft bg-white text-muted-foreground"
            aria-label={`Drag ${member.user.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        }
        actions={
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              className="size-11 p-0"
              onClick={onUp}
              disabled={!onUp}
              aria-label={`Move ${member.user.name} up`}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="size-11 p-0"
              onClick={onDown}
              disabled={!onDown}
              aria-label={`Move ${member.user.name} down`}
            >
              <ArrowDown className="size-4" />
            </Button>
          </div>
        }
      />
    </div>
  );
}

function MemberOrderRow({
  member,
  position,
  handle,
  actions,
}: {
  member: GroupMember;
  position: number;
  handle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-page-bg p-3">
      {handle}
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
        {position}
      </div>
      <p className="min-w-0 flex-1 truncate font-medium text-foreground">{member.user.name}</p>
      {actions}
    </div>
  );
}

function MembersSection({ details, currentUserId }: { details: GroupDetails; currentUserId?: string }) {
  const { group, viewer } = details;
  const removeMember = useRemoveGroupMember();
  const router = useRouter();
  const showContacts = viewer.isOrganizer;

  async function handleRemoveMember(member: GroupMember) {
    try {
      const response = await removeMember.mutateAsync({ groupId: group.id, memberId: member.id });
      notify.success(response.message || "Member removed successfully.");
      if (member.userId === currentUserId && !viewer.isOrganizer) router.push("/groups");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        {!showContacts ? (
          <CardDescription>Only the organiser can see members&apos; phone numbers and emails.</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {group.members.length ? (
          <ul className="grid gap-2">
            {[...group.members]
              .sort((a, b) => a.payoutPosition - b.payoutPosition)
              .map((member) => {
                const isSelf = member.userId === currentUserId;
                const canRemove = viewer.canEditStructure && !isSelf;
                const canLeave = !viewer.isOrganizer && isSelf && !viewer.hasActivity && group.status !== "COMPLETED";

                return (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border-soft bg-page-bg p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {member.user.name}
                        {isSelf ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                        {member.userId === group.organizerId ? (
                          <span className="ml-2 text-xs text-primary">Organiser</span>
                        ) : null}
                      </p>
                      {showContacts && (member.user.phone || member.user.email) ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {member.user.phone ? (
                            <a className="underline-offset-2 hover:underline" href={`tel:${member.user.phone}`}>
                              {member.user.phone}
                            </a>
                          ) : null}
                          {member.user.phone && member.user.email ? " · " : null}
                          {member.user.email}
                        </p>
                      ) : null}
                    </div>
                    {canRemove || canLeave ? (
                      <RemoveMemberDialog
                        memberName={member.user.name}
                        isSelf={isSelf}
                        isPending={removeMember.isPending}
                        onConfirm={() => handleRemoveMember(member)}
                      />
                    ) : null}
                  </li>
                );
              })}
          </ul>
        ) : (
          <EmptyState title="No members yet" />
        )}
      </CardContent>
    </Card>
  );
}

function RemoveMemberDialog({
  memberName,
  isSelf,
  isPending,
  onConfirm,
}: {
  memberName: string;
  isSelf: boolean;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 shrink-0 text-destructive"
          aria-label={isSelf ? "Leave group" : `Remove ${memberName}`}
        >
          <UserMinus className="size-4" />
          {isSelf ? "Leave" : "Remove"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isSelf ? "Leave this group?" : `Remove ${memberName}?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf
              ? "You will lose your payout position. You can rejoin with the invite link while there is space."
              : `${memberName} will lose their payout position. They can rejoin with the invite link while there is space.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isPending ? "Removing..." : isSelf ? "Leave group" : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function HistorySection({ details }: { details: GroupDetails }) {
  const cycles = details.ledger.cycles ?? [];
  if (!cycles.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All rounds</CardTitle>
        <CardDescription>Who collects each round, how many have paid, and recorded payouts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2">
          {cycles.map((cycle) => (
            <li
              key={cycle.id}
              className="grid gap-1 rounded-2xl border border-border-soft bg-page-bg p-3 text-sm sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4"
            >
              <p className="font-semibold text-foreground">Round {cycle.cycleNumber}</p>
              <p className="text-muted-foreground">
                Due {formatDate(lastPayDay(cycle.endDate))} · {cycle.expectedCollector?.name ?? "No collector"} collects ·{" "}
                {cycle.paidCount}/{cycle.members.length} paid
              </p>
              <p className="font-medium text-foreground">
                {cycle.payout
                  ? `Paid out ${formatCurrency(cycle.payout.amount)} to ${cycle.payout.receiverName}`
                  : cycle.phase === "UPCOMING"
                    ? "Upcoming"
                    : "Payout not recorded"}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
