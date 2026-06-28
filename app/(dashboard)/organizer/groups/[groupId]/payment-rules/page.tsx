import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export default function PaymentRulesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Payment rules" description="Payment and reminder settings are managed by the group API." />
      <EmptyState title="Payment rules endpoint pending" />
    </div>
  );
}
