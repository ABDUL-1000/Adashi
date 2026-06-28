import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateOrganizerGroupPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Create group"
        description="Set contribution rules, payout order, reminders, and wallet deduction preferences."
      />
      <Card>
        <CardContent>
          <CreateGroupForm />
        </CardContent>
      </Card>
    </div>
  );
}
