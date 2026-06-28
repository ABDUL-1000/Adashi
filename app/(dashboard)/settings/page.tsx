import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Manage your Adashi account preferences." />
      <EmptyState title="Settings are coming soon" />
    </div>
  );
}
