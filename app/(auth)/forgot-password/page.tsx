import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="grid max-w-md gap-4 text-center">
        <EmptyState
          title="Password reset endpoint pending"
          description="This public route is reserved for the real backend reset flow."
        />
        <Button asChild variant="outline">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    </main>
  );
}
