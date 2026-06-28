"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useJoinGroup } from "@/hooks/members/useJoinGroup";
import { getApiErrorMessage } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function JoinGroupPage() {
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const joinGroup = useJoinGroup();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!isAuthenticated) {
      router.push(`/login?next=/join/${params.inviteCode}`);
      return;
    }

    try {
      const response = await joinGroup.mutateAsync(params.inviteCode);
      setMessage(response.message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="grid w-full max-w-md gap-4 rounded-lg border bg-background p-6">
        <EmptyState
          title="Join contribution group"
          description="Preview endpoint details can be added here when available."
        />
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button onClick={handleJoin} disabled={joinGroup.isPending}>
          {joinGroup.isPending ? "Joining..." : "Join group"}
        </Button>
      </div>
    </main>
  );
}
