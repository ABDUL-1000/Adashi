import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: React.ReactNode;
  caption?: string;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "warning";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-muted-foreground">{title}</p>
          <div className="mt-3 text-lg font-semibold leading-tight tracking-tight text-foreground">
            {value}
          </div>
          {caption ? (
            <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
