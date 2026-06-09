import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-md border bg-card px-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
