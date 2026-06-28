"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJoinGroup } from "@/hooks/invites/useJoinGroup";
import { useValidateInvite } from "@/hooks/invites/useValidateInvite";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import { useAuthStore } from "@/store/authStore";

export default function JoinGroupPage() {
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const inviteQuery = useValidateInvite(params.inviteCode);
  const joinGroup = useJoinGroup();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/join/${params.inviteCode}`)}`);
      return;
    }


    try {
      const response = await joinGroup.mutateAsync({
        code: params.inviteCode,
      });
      setMessage(response.message);
      notify.success(response.message || "Joined group successfully.");
      const groupId =
        response.data && "groupId" in response.data
          ? response.data.groupId
          : response.data && "group" in response.data
            ? response.data.group?.id
            : undefined;
      router.push(groupId ? `/groups/${groupId}` : "/groups");
    } catch (err) {
      const nextError = getErrorMessage(err);
      setError(nextError);
      notify.error(nextError);
    }
  }

  const invite = inviteQuery.data?.data;

  return (
    <main className="min-h-screen bg-page-bg px-4">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <header className="flex items-center justify-between py-5">
          <BrandLogo />
          <Button variant="outline" onClick={() => router.push("/login")}>
            Login
          </Button>
        </header>

        <section className="grid flex-1 place-items-center py-10">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Join contribution group</CardTitle>
              <CardDescription>Review the invite details before choosing your payout position.</CardDescription>
            </CardHeader>
            <CardContent>
              {inviteQuery.isLoading ? <EmptyState title="Validating invite..." /> : null}
              {inviteQuery.isError ? (
                <EmptyState title="Invalid invite" description={getErrorMessage(inviteQuery.error)} />
              ) : null}
              {invite ? (
                <div className="grid gap-5">
                  <div className="rounded-2xl border border-border-soft bg-page-bg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-semibold text-foreground">{invite.group.name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Expires {formatDate(invite.expiresAt)}
                        </p>
                      </div>
                      <StatusBadge status={invite.group.status} />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <Info label="Contribution" value={formatCurrency(invite.group.contributionAmount)} />
                      <Info label="Frequency" value={invite.group.frequency} />
                      <Info label="Members" value={`${invite.group._count.members}/${invite.group.slots}`} />
                    </div>
                  </div>
                  {isAuthenticated ? (
                    <form onSubmit={handleJoin} className="grid gap-5">
                  
                      <Button type="submit" disabled={joinGroup.isPending}>
                        {joinGroup.isPending ? <InlineLoader label="Joining" /> : "Join group"}
                      </Button>
                    </form>
                  ) : (
                    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4">
                      <p className="text-sm text-muted-foreground">
                        Login or create an account to choose your payout position and join this group.
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild>
                          <Link href={`/login?redirect=${encodeURIComponent(`/join/${params.inviteCode}`)}`}>
                            Login to join
                          </Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/register?redirect=${encodeURIComponent(`/join/${params.inviteCode}`)}`}>
                            Register to join
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
