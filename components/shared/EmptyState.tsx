import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/25 bg-white/70 p-8 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Inbox className="size-5" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
