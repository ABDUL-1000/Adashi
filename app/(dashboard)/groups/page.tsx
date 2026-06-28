import Link from "next/link";
import { Plus } from "lucide-react";

import { GroupsList } from "@/components/groups/GroupsList";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default function GroupsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Groups"
        description="Create groups, join groups, and manage only the groups you started."
        action={
          <Button asChild>
            <Link href="/groups/create">
              <Plus className="size-4" /> Create group
            </Link>
          </Button>
        }
      />
      <GroupsList />
    </div>
  );
}
