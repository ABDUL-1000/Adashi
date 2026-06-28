import { Loader2 } from "lucide-react";

export function InlineLoader({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </span>
  );
}
