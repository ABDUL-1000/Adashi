import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export default function OrganizerRemindersPage() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Automatic reminders" description="Reminders are configured per group and sent automatically." />
      <EmptyState title="Reminder logs endpoint pending" />
    </div>
  );
}
