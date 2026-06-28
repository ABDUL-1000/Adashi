"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { notify } from "@/lib/notify";
import { getApiErrorMessage } from "@/services/api";

function VerifyOtpFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtp = useVerifyOtp();
  const [error, setError] = useState<string | null>(null);
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await verifyOtp.mutateAsync({
        email: String(form.get("email")),
        otp: String(form.get("otp")),
      });
      notify.success("OTP verified successfully.");
      router.replace(redirect);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" defaultValue={email} required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="otp">
          OTP
        </label>
        <Input id="otp" name="otp" inputMode="numeric" required />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={verifyOtp.isPending} className="mt-2 w-full">
        {verifyOtp.isPending ? <InlineLoader label="Verifying" /> : "Verify OTP"}
      </Button>
    </form>
  );
}

export function VerifyOtpForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <VerifyOtpFields />
    </Suspense>
  );
}
