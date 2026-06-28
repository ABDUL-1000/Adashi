import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export default function TopUpWalletPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Top up wallet" description="Wallet funding UI is ready for the future backend endpoint." />
      <EmptyState title="Top up endpoint pending" description="No dummy payment flow is implemented." />
    </div>
  );
}
