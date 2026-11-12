"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { EmptyState } from "@/components/shared/EmptyState";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvitationPreview, useRespondToInvitation } from "@/hooks/invitations/useInvitation";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import { useAuthStore } from "@/store/authStore";

const statusText: Record<string, string> = {
  ACCEPTED: "You have already accepted this invitation.",
  DECLINED: "This invitation was declined.",
  CANCELLED: "The organiser cancelled this invitation.",
  EXPIRED: "This invitation has expired. Ask the organiser to invite you again.",
};

export default function MemberInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;
  const previewQuery = useInvitationPreview(token);
  const respond = useRespondToInvitation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const invitation = previewQuery.data?.data;
  const redirect = encodeURIComponent(`/invitations/${token}`);

  async function answer(accept: boolean) {
    try {
      const response = await respond.mutateAsync({ token, accept });
      notify.success(response.message || (accept ? "You joined the group." : "Invitation declined."));
      const groupId = accept ? (response.data as { groupId?: string } | null)?.groupId : undefined;
      if (groupId) {
        router.push(`/groups/${groupId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-page-bg px-4">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        <header className="flex items-center justify-between py-5">
          <BrandLogo />
        </header>
        <section className="grid flex-1 place-items-center py-10">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Savings group invitation</CardTitle>
              <CardDescription>You only join if you accept.</CardDescription>
            </CardHeader>
            <CardContent>
              {previewQuery.isLoading ? <EmptyState title="Loading invitation..." /> : null}
              {previewQuery.isError ? (
                <EmptyState title="Invitation not found" description={getErrorMessage(previewQuery.error)} />
              ) : null}
              {invitation ? (
                <div className="grid gap-5">
                  <div className="rounded-2xl border border-border-soft bg-page-bg p-4">
                    <h1 className="text-2xl font-semibold text-foreground">{invitation.group.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Invited by {invitation.group.organizerName} · sent to {invitation.invitedEmail}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <Info label="Contribution" value={formatCurrency(invitation.group.contributionAmount)} />
                      <Info label="Frequency" value={invitation.group.frequency === "WEEKLY" ? "Weekly" : "Monthly"} />
                      <Info label="Members" value={`${invitation.group.memberCount}/${invitation.group.slots}`} />
                    </dl>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Adashi does not hold your money. You pay your organiser as usual and they record it in the app.
                    </p>
                  </div>

                  {invitation.status !== "PENDING" ? (
                    <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                      {statusText[invitation.status] ?? "This invitation can no longer be answered."}
                    </p>
                  ) : isAuthenticated ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button className="min-h-11" onClick={() => answer(true)} disabled={respond.isPending}>
                        {respond.isPending ? <InlineLoader label="Saving" /> : "Accept and join"}
                      </Button>
                      <Button
                        variant="outline"
                        className="min-h-11"
                        onClick={() => answer(false)}
                        disabled={respond.isPending}
                      >
                        Decline
                      </Button>
                      <p className="text-xs text-muted-foreground sm:col-span-2">
                        Expires {formatDate(invitation.expiresAt)}. You must be logged in with {invitation.invitedEmail}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4">
                      <p className="text-sm text-muted-foreground">
                        Log in or create an account with <strong>{invitation.invitedEmail}</strong> to answer this invitation.
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button asChild className="min-h-11">
                          <Link href={`/register?redirect=${redirect}`}>Create account</Link>
                        </Button>
                        <Button asChild variant="outline" className="min-h-11">
                          <Link href={`/login?redirect=${redirect}`}>Log in</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
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
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
