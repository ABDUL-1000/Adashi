import Link from "next/link";

import { GroupsList } from "@/components/groups/GroupsList";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default function MemberGroupsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="My groups"
        description="Groups you have joined or organized."
        action={
          <Button asChild>
            <Link href="/member/groups/create">Create group</Link>
          </Button>
        }
      />
      <GroupsList basePath="/member/groups" />
    </div>
  );
}
