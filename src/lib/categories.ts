import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Enums"]["collectible_category"];

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "coins", label: "Coins", icon: "🪙" },
  { value: "notes", label: "Currency Notes", icon: "💵" },
  { value: "stamps", label: "Stamps", icon: "✉️" },
  { value: "antiques", label: "Antiques", icon: "🏺" },
  { value: "medals", label: "Medals", icon: "🎖️" },
  { value: "artifacts", label: "Artifacts", icon: "⚱️" },
  { value: "books", label: "Rare Books", icon: "📜" },
  { value: "other", label: "Other", icon: "✨" },
];

export const categoryLabel = (c: Category) =>
  CATEGORIES.find((x) => x.value === c)?.label ?? c;
