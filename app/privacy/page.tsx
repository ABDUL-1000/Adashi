import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";

export const metadata: Metadata = {
  title: "Privacy notice | Adashi",
  description: "What personal data Adashi collects, why, and your rights under the Nigeria Data Protection Act.",
};

// TODO before launch: replace the [bracketed] placeholders with your registered details.
const CONTROLLER = "[Registered business name]";
const CONTACT_EMAIL = "[privacy contact email]";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-page-bg px-4 pb-16">
      <div className="mx-auto max-w-2xl">
        <header className="py-5">
          <BrandLogo />
        </header>
        <article className="grid gap-6 rounded-3xl border border-border-soft bg-white p-5 text-sm leading-6 text-foreground sm:p-8">
          <div>
            <h1 className="text-2xl font-semibold">Privacy notice</h1>
            <p className="mt-1 text-muted-foreground">Last updated: 12 November 2026</p>
          </div>

          <Section title="Who we are">
            <p>
              Adashi is run by {CONTROLLER} (&quot;we&quot;). We are responsible for your personal data under the
              Nigeria Data Protection Act 2023 (NDPA). Contact us at {CONTACT_EMAIL}.
            </p>
          </Section>

          <Section title="Adashi does not hold your money">
            <p>
              Adashi is a record-keeping tool for savings groups (adashi, ajo, esusu). You pay your contributions the
              way your group already does. Your organiser records payments and payouts in the app. We never collect,
              hold or move your money.
            </p>
          </Section>

          <Section title="What we collect">
            <ul className="list-disc pl-5">
              <li>Your name and email address (to create your account and send codes and reminders).</li>
              <li>Your phone number, if you give it (so your group organiser can contact you).</li>
              <li>Your groups, your payout position, and the payments and payouts your organiser records.</li>
              <li>Emails we have sent you (subject and delivery status).</li>
            </ul>
            <p>
              We do <strong>not</strong> collect your BVN, NIN, bank account details or card details.
            </p>
          </Section>

          <Section title="Why we use it">
            <p>
              Only to run your savings groups: showing who has paid, who collects each round, and sending payment
              reminders. Our legal basis is your consent, given when you create an account, and performing the service
              you asked for. We do not sell your data or use it for advertising.
            </p>
          </Section>

          <Section title="Who can see it">
            <ul className="list-disc pl-5">
              <li>Members of your group see your name, payout position and whether you have paid.</li>
              <li>Only your group organiser sees your email address and phone number.</li>
              <li>
                Our service providers for hosting and sending email process data for us under contract. [List providers
                and where data is stored.]
              </li>
            </ul>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep your account while you use Adashi. Payment records in a finished group are kept so the group&apos;s
              history stays correct, but after you delete your account they no longer show your name.
            </p>
          </Section>

          <Section title="Your rights">
            <p>Under the NDPA you can:</p>
            <ul className="list-disc pl-5">
              <li>download a copy of your data (Settings, then &quot;Download my data&quot;);</li>
              <li>correct your name or phone number;</li>
              <li>delete your account (Settings, then &quot;Delete my account&quot;);</li>
              <li>withdraw consent at any time by deleting your account;</li>
              <li>complain to the Nigeria Data Protection Commission (ndpc.gov.ng).</li>
            </ul>
            <p>For anything else, email {CONTACT_EMAIL}.</p>
          </Section>

          <p>
            <Link href="/register" className="font-medium text-primary underline-offset-2 hover:underline">
              Back to sign up
            </Link>
          </p>
        </article>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}
