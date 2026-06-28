"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { useLogin } from "@/hooks/auth/useLogin";
import { notify } from "@/lib/notify";
import { getApiErrorMessage } from "@/services/api";

function LoginFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const redirect = searchParams.get("redirect") || searchParams.get("next") || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await login.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      notify.success("Welcome back to Adashi.");
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
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="password">
          Password
        </label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={login.isPending} className="mt-2 w-full">
        {login.isPending ? <InlineLoader label="Signing in" /> : "Login"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={`/register?redirect=${encodeURIComponent(redirect)}`}
          className="font-medium text-primary"
        >
          Register
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <LoginFields />
    </Suspense>
  );
}
