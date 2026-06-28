"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { GroupCard } from "@/components/groups/GroupCard";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { getApiErrorMessage } from "@/services/api";

export function GroupsList({ basePath }: { basePath: "/member/groups" | "/organizer/groups" }) {
  const groupsQuery = useGetGroups();
  const showInviteLinks = basePath === "/organizer/groups";

  if (groupsQuery.isLoading) {
    return <EmptyState title="Loading groups..." />;
  }

  if (groupsQuery.isError) {
    return (
      <EmptyState
        title="Could not load groups"
        description={getApiErrorMessage(groupsQuery.error)}
      />
    );
  }

  const groups = groupsQuery.data?.data ?? [];

  if (!groups.length) {
    return <EmptyState title="No groups yet" description="Create or join a group to see it here." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          href={`${basePath}/${group.id}`}
          showInviteLink={showInviteLinks}
        />
      ))}
    </div>
  );
}
