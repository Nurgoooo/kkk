"use client";

import initialProducts from "@/data/products.json";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { categories, categoryLabel, t } from "@/lib/i18n";
import type { Category, Locale, Product, ProgressMap } from "@/lib/types";
import { cn, formatPrice, safeParseJson } from "@/lib/utils";
import {
  ArrowDownUp,
  BookOpenCheck,
  Check,
  Clipboard,
  Moon,
  RotateCcw,
  Search,
  Shuffle,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PRODUCTS_KEY = "dodo-academy-products";
const PROGRESS_KEY = "dodo-academy-progress";
const SETTINGS_KEY = "dodo-academy-settings";
const PRODUCTS_VERSION_KEY = "dodo-academy-products-version";
const PRODUCTS_VERSION = "dodo-aktobe-2026-06-full-catalog";

type SortMode = "name" | "price-asc" | "price-desc";
type QuizMode = "image" | "ingredients";

export function DodoAcademy({ admin = false }: { admin?: boolean }) {
  const [locale, setLocale] = useState<Locale>("kk");
  const [dark, setDark] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts as Product[]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<SortMode>("name");
  const [mode, setMode] = useState<QuizMode>("image");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const storedProducts = localStorage.getItem(PRODUCTS_KEY);
    const storedProductsVersion = localStorage.getItem(PRODUCTS_VERSION_KEY);
    const storedProgress = localStorage.getItem(PROGRESS_KEY);
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedProducts && storedProductsVersion === PRODUCTS_VERSION) {
      setProducts(safeParseJson<Product[]>(storedProducts, initialProducts as Product[]));
    } else {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
    }
    if (storedProgress) setProgress(safeParseJson<ProgressMap>(storedProgress, {}));
    if (storedSettings) {
      const parsed = safeParseJson<{ locale?: Locale; dark?: boolean }>(storedSettings, {});
      if (parsed.locale) setLocale(parsed.locale);
      setDark(Boolean(parsed.dark));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ locale, dark }));
  }, [dark, locale]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => {
        const names = `${product.name.kk} ${product.name.ru}`.toLowerCase();
        return names.includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        return a.name[locale].localeCompare(b.name[locale]);
      });
  }, [category, locale, products, query, sort]);

  const activeProduct = filteredProducts[activeIndex % Math.max(filteredProducts.length, 1)] ?? products[0];
  const totals = Object.values(progress).reduce(
    (acc, item) => ({
      correct: acc.correct + item.correct,
      wrong: acc.wrong + item.wrong,
      reviewed: acc.reviewed + item.reviewed,
    }),
    { correct: 0, wrong: 0, reviewed: 0 },
  );

  function mark(product: Product, result: "correct" | "wrong") {
    const next = {
      ...progress,
      [product.id]: {
        correct: (progress[product.id]?.correct ?? 0) + (result === "correct" ? 1 : 0),
        wrong: (progress[product.id]?.wrong ?? 0) + (result === "wrong" ? 1 : 0),
        reviewed: (progress[product.id]?.reviewed ?? 0) + 1,
        updatedAt: new Date().toISOString(),
      },
    };
    setProgress(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    nextCard();
  }

  function nextCard() {
    setFlipped(false);
    setActiveIndex((index) => (filteredProducts.length ? (index + 1) % filteredProducts.length : 0));
  }

  function shuffleCard() {
    setFlipped(false);
    setActiveIndex(Math.floor(Math.random() * Math.max(filteredProducts.length, 1)));
  }

  function saveJson() {
    const parsed = safeParseJson<Product[] | null>(jsonDraft, null);
    if (!parsed || !Array.isArray(parsed)) return;
    setProducts(parsed);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(parsed));
    localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
  }

  function resetProducts() {
    setProducts(initialProducts as Product[]);
    setJsonDraft(JSON.stringify(initialProducts, null, 2));
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCTS_VERSION);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-10 -mx-4 border-b bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-xl font-black text-white">до</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{t[locale].featured}</p>
              <h1 className="text-2xl font-black leading-tight">{t[locale].brand}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocale(locale === "kk" ? "ru" : "kk")}>
              {locale === "kk" ? "RU" : "ҚАЗ"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {dark ? t[locale].light : t[locale].dark}
            </Button>
            <Link
              href={admin ? "/" : "/admin"}
              className={cn(
                "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                admin
                  ? "bg-secondary text-secondary-foreground hover:brightness-95"
                  : "bg-primary text-primary-foreground hover:brightness-95",
              )}
            >
              <Clipboard className="h-4 w-4" />
              {admin ? t[locale].catalog : t[locale].admin}
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="rounded-lg border bg-card p-5 shadow-panel">
          <Badge className="bg-primary text-primary-foreground">Dodo Pizza</Badge>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">{t[locale].subtitle}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Metric label={t[locale].products} value={String(products.length)} />
            <Metric label={t[locale].correct} value={String(totals.correct)} />
            <Metric label={t[locale].wrong} value={String(totals.wrong)} />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-primary" />
              {t[locale].progress}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-3 overflow-hidden rounded-sm bg-muted">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.min(100, Math.round((totals.correct / Math.max(totals.reviewed, 1)) * 100))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {t[locale].score}: {totals.correct}/{totals.reviewed || 0}
            </p>
          </CardContent>
        </Card>
      </section>

      {admin ? (
        <AdminPanel
          locale={locale}
          products={products}
          jsonDraft={jsonDraft}
          setJsonDraft={setJsonDraft}
          saveJson={saveJson}
          resetProducts={resetProducts}
        />
      ) : (
        <>
          <section className="grid gap-3 rounded-lg border bg-card p-3 shadow-panel lg:grid-cols-[1fr_220px_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder={t[locale].search} value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <Select value={category} onChange={(event) => setCategory(event.target.value as "all" | Category)} aria-label={t[locale].category}>
              {categories.map((item) => (
                <option value={item.id} key={item.id}>
                  {item[locale]}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label={t[locale].sort}>
              <option value="name">{t[locale].nameAsc}</option>
              <option value="price-asc">{t[locale].priceAsc}</option>
              <option value="price-desc">{t[locale].priceDesc}</option>
            </Select>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <LearningPanel
              locale={locale}
              product={activeProduct}
              mode={mode}
              setMode={setMode}
              flipped={flipped}
              setFlipped={setFlipped}
              mark={mark}
              nextCard={nextCard}
              shuffleCard={shuffleCard}
            />
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">{t[locale].catalog}</h2>
                <Badge>{filteredProducts.length} {t[locale].products}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-2xl font-black">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function LearningPanel({
  locale,
  product,
  mode,
  setMode,
  flipped,
  setFlipped,
  mark,
  nextCard,
  shuffleCard,
}: {
  locale: Locale;
  product: Product;
  mode: QuizMode;
  setMode: (mode: QuizMode) => void;
  flipped: boolean;
  setFlipped: (flipped: boolean) => void;
  mark: (product: Product, result: "correct" | "wrong") => void;
  nextCard: () => void;
  shuffleCard: () => void;
}) {
  return (
    <Card className="lg:sticky lg:top-24 lg:self-start">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={mode === "image" ? "default" : "outline"} onClick={() => setMode("image")}>
            {t[locale].imageQuiz}
          </Button>
          <Button size="sm" variant={mode === "ingredients" ? "default" : "outline"} onClick={() => setMode("ingredients")}>
            {t[locale].ingredientQuiz}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <button
          className={cn(
            "min-h-[420px] w-full rounded-lg border bg-background p-5 text-left transition hover:border-primary",
            flipped && "border-primary",
          )}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flex items-center justify-between gap-3">
            <Badge>{categoryLabel(product.category, locale)}</Badge>
            <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          </div>
          <div className="mt-6 grid place-items-center">
            {mode === "image" ? (
              <ProductVisual product={product} large />
            ) : (
              <div className="grid h-56 w-full place-items-center rounded-lg bg-muted p-4 text-center">
                <h3 className="text-4xl font-black">{product.name[locale]}</h3>
              </div>
            )}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">{flipped ? t[locale].description : t[locale].flip}</p>
            {flipped ? (
              <div className="mt-3">
                <h3 className="text-3xl font-black">{product.name[locale]}</h3>
                <p className="mt-2 text-muted-foreground">{product.description[locale]}</p>
                <p className="mt-4 text-sm font-bold">{t[locale].ingredients}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.ingredients[locale].join(", ")}</p>
              </div>
            ) : (
              <p className="mt-3 text-2xl font-black">{mode === "image" ? "?" : "..."}</p>
            )}
          </div>
        </button>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="outline" onClick={() => setFlipped(true)}>
            <RotateCcw className="h-4 w-4" />
            {t[locale].showAnswer}
          </Button>
          <Button variant="secondary" onClick={() => mark(product, "correct")}>
            <Check className="h-4 w-4" />
            {t[locale].correct}
          </Button>
          <Button variant="outline" onClick={() => mark(product, "wrong")}>
            <X className="h-4 w-4" />
            {t[locale].wrong}
          </Button>
          <Button onClick={mode === "image" ? nextCard : shuffleCard}>
            {mode === "image" ? <ArrowDownUp className="h-4 w-4" /> : <Shuffle className="h-4 w-4" />}
            {t[locale].next}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPanel({
  locale,
  products,
  jsonDraft,
  setJsonDraft,
  saveJson,
  resetProducts,
}: {
  locale: Locale;
  products: Product[];
  jsonDraft: string;
  setJsonDraft: (value: string) => void;
  saveJson: () => void;
  resetProducts: () => void;
}) {
  useEffect(() => {
    setJsonDraft(JSON.stringify(products, null, 2));
  }, [products, setJsonDraft]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardHeader>
          <CardTitle>{t[locale].admin}</CardTitle>
          <p className="text-sm text-muted-foreground">{t[locale].jsonHint}</p>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[560px] w-full rounded-md border bg-background p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            value={jsonDraft}
            onChange={(event) => setJsonDraft(event.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={saveJson}>{t[locale].save}</Button>
            <Button variant="outline" onClick={resetProducts}>{t[locale].reset}</Button>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(jsonDraft)}>
              {t[locale].exportJson}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid content-start gap-3">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </section>
  );
}
