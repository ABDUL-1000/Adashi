"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineLoader } from "@/components/shared/InlineLoader";
import { useRegister } from "@/hooks/auth/useRegister";
import { notify } from "@/lib/notify";
import { getApiErrorMessage } from "@/services/api";

function RegisterFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));

    try {
      const response = await register.mutateAsync({
        name: String(form.get("name")),
        email,
        phone: String(form.get("phone")),
        password: String(form.get("password")),
      });
      setMessage(response.message);
      notify.success(response.message || "Account created. Check your OTP.");
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`
      );
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      notify.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="name">
          Full name
        </label>
        <Input id="name" name="name" required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="phone">
          Phone
        </label>
        <Input id="phone" name="phone" required />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium leading-5" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="pr-11"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={register.isPending} className="mt-2 w-full">
        {register.isPending ? <InlineLoader label="Creating account" /> : "Register"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-medium text-primary"
        >
          Login
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <RegisterFields />
    </Suspense>
  );
}
