import { EditGroupForm } from "@/components/groups/EditGroupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function EditGroupPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Edit group"
        description="Edit group details while the group is still pending."
      />
      <Card>
        <CardContent>
          <EditGroupForm />
        </CardContent>
      </Card>
    </div>
  );
}
