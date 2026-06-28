"use client";

import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Calendar({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <label className={cn("relative block", className)}>
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
      <Input type="date" className="pl-10" {...props} />
    </label>
  );
}
