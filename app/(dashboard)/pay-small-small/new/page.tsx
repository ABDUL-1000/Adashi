import { CreatePlanForm } from "@/components/pss/CreatePlanForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NewPaySmallSmallPlanPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="New Pay Small Small plan"
        description="Record an item a customer is paying for in installments."
      />
      <CreatePlanForm />
    </div>
  );
}
