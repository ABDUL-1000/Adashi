import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateMemberGroupPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Create group"
        description="Create a contribution group and invite members."
      />
      <Card>
        <CardContent>
          <CreateGroupForm />
        </CardContent>
      </Card>
    </div>
  );
}
