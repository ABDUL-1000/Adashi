"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { GroupCard } from "@/components/groups/GroupCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/auth/useProfile";
import { useGetGroups } from "@/hooks/groups/useGetGroups";
import { isGroupMember, isGroupOwner } from "@/lib/groupPermissions";
import { getApiErrorMessage } from "@/services/api";

export function GroupsList() {
  const groupsQuery = useGetGroups();
  const profileQuery = useProfile();
  const userId = profileQuery.data?.data.id;

  if (groupsQuery.isLoading || profileQuery.isLoading) {
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
  const tabs = [
    { value: "all", label: "All Groups", groups },
    {
      value: "created",
      label: "Groups I Created",
      groups: groups.filter((group) => isGroupOwner(group, userId)),
    },
    {
      value: "joined",
      label: "Groups I Joined",
      groups: groups.filter(
        (group) => !isGroupOwner(group, userId) && isGroupMember(group, userId)
      ),
    },
  ];

  if (!groups.length) {
    return <EmptyState title="No groups yet" description="Create or join a group to see it here." />;
  }

  return (
    <Tabs defaultValue="all" className="gap-4">
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl bg-white p-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="h-10 px-3">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.groups.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tab.groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  href={`/groups/${group.id}`}
                  currentUserId={userId}
                />
              ))}
            </div>
          ) : (
            <EmptyState title={`No ${tab.label.toLowerCase()} yet`} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
