export type Locale = "kk" | "ru";

export type Category =
  | "pizza"
  | "dodster"
  | "snack"
  | "pasta"
  | "salad"
  | "dessert"
  | "drink";

export type Product = {
  id: string;
  category: Category;
  name: Record<Locale, string>;
  price: number;
  ingredients: Record<Locale, string[]>;
  description: Record<Locale, string>;
  image: string;
  sourceUrl?: string;
  tags: string[];
};

export type ProgressRecord = {
  correct: number;
  wrong: number;
  reviewed: number;
  updatedAt: string;
};

export type ProgressMap = Record<string, ProgressRecord>;
