import Link from "next/link";

import { GroupsList } from "@/components/groups/GroupsList";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default function OrganizerGroupsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Organizer groups"
        description="Create, monitor, and manage contribution groups."
        action={
          <Button asChild>
            <Link href="/organizer/groups/create">Create group</Link>
          </Button>
        }
      />
      <GroupsList basePath="/organizer/groups" />
    </div>
  );
}
