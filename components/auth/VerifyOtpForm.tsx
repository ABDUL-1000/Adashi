"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { useVerifyOtp } from "@/hooks/auth/useVerifyOtp";
import { notify } from "@/lib/notify";
import { getApiErrorMessage } from "@/services/api";

function VerifyOtpFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtp = useVerifyOtp();
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const email = searchParams.get("email") ?? "";
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await verifyOtp.mutateAsync({
        email,
        otp,
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
        <p className="text-sm font-medium leading-5">
          Email
        </p>
        <div className="rounded-xl border border-border-soft bg-page-bg px-3 py-2 text-sm font-medium text-foreground">
          {email || "No email provided"}
        </div>
      </div>
      <div className="grid items-center justify-center gap-2">
        <label className="text-sm text-center font-medium leading-5" htmlFor="otp">
          OTP
        </label>
        <InputOTP
          id="otp"
          name="otp"
          value={otp}
          onChange={setOtp}
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]*"
          containerClassName="justify-center sm:justify-start"
          required
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={verifyOtp.isPending || !email || otp.length < 6}
        className="mt-2 w-full"
      >
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
