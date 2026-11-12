"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";

import { InlineLoader } from "@/components/shared/InlineLoader";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/auth/useLogout";
import { useProfile } from "@/hooks/auth/useProfile";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { notify } from "@/lib/notify";
import { userService } from "@/services/user.service";

export function SettingsView() {
  const profileQuery = useProfile();
  const profile = profileQuery.data?.data;
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const response = await userService.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "adashi-my-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Your account and your data." />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span> {profile?.name ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {profile?.email ?? "-"}
          </p>
          <p>
            <span className="text-muted-foreground">Phone:</span> {profile?.phone || "Not given"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Your data
          </CardTitle>
          <CardDescription>
            Adashi stores your name, email, phone (if given) and your group records. Read the{" "}
            <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
              privacy notice
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:flex">
          <Button type="button" variant="outline" className="min-h-11" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <InlineLoader label="Preparing" />
            ) : (
              <>
                <Download className="size-4" />
                Download my data
              </>
            )}
          </Button>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteAccountDialog() {
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") || "");
    setPending(true);
    try {
      const response = await userService.deleteAccount(password);
      notify.success(response.message || "Your account has been deleted.");
      setOpen(false);
      logout();
    } catch (error) {
      notify.error(getErrorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="min-h-11 text-destructive">
          <Trash2 className="size-4" />
          Delete my account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            Your name, email and phone are erased and you are logged out. You cannot do this while a group you are in is
            still running. Records in finished groups stay, without your name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="delete-password">
              Enter your password to confirm
            </label>
            <Input id="delete-password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <Button type="submit" variant="destructive" size="lg" disabled={pending}>
            {pending ? <InlineLoader label="Deleting" /> : "Delete my account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
