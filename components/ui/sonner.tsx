"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-2xl border border-border-soft bg-white shadow-xl",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
