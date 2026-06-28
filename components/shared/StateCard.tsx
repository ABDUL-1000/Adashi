import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/components/shared/StatCard";

export function StateCard({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  caption?: string;
  icon?: LucideIcon;
}) {
  return <StatCard title={title} value={value} caption={caption} icon={icon} />;
}
