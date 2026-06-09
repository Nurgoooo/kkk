import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductVisual({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div
      className={cn(
        "relative mx-auto grid place-items-center overflow-hidden rounded-lg bg-gradient-to-b from-orange-50 to-white dark:from-zinc-900 dark:to-zinc-950",
        large ? "h-64 w-full max-w-sm" : "h-40 w-full",
      )}
      aria-label={product.name.kk}
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product.name.kk}
          className="h-full w-full object-contain p-2"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-semibold text-muted-foreground">
          {product.name.kk}
        </div>
      )}
      <span className="sr-only">{product.name.kk}</span>
    </div>
  );
}
