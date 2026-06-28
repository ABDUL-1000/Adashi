import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandLogo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-bold text-white shadow-[0_12px_28px_rgba(146,68,212,0.28)]">
        A
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-semibold text-foreground">Adashi</span>
        <span className="block text-xs font-medium text-muted-foreground">
          Contributions
        </span>
      </span>
    </Link>
  );
}
