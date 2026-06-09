import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductVisual } from "@/components/product-visual";
import { categoryLabel, t } from "@/lib/i18n";
import type { Locale, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Badge>{categoryLabel(product.category, locale)}</Badge>
          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ProductVisual product={product} />
        <CardTitle className="mt-4">{product.name[locale]}</CardTitle>
        <p className="mt-2 min-h-10 text-sm text-muted-foreground">{product.description[locale]}</p>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t[locale].ingredients}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.ingredients[locale].map((ingredient) => (
              <Badge key={ingredient} className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-200">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
