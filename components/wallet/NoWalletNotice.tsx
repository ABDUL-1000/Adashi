import Link from "next/link";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Adashi does not hold or move members' money, so there is no wallet to top up. */
export function NoWalletNotice() {
  return (
    <div className="grid gap-6">
      <PageHeader title="No wallet needed" description="Adashi does not hold your money." />
      <Card>
        <CardContent className="grid gap-4 py-6 text-sm leading-6 text-muted-foreground">
          <p>
            Keep paying your contribution the way your group already does (cash or bank transfer to your organiser).
            Your organiser marks it as paid in Adashi, and everyone in the group can see who has paid and who collects
            each round.
          </p>
          <p>Adashi never asks you to deposit money into the app.</p>
          <div className="grid gap-2 sm:flex">
            <Button asChild className="min-h-11">
              <Link href="/payments">See my payments</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/groups">Go to my groups</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
