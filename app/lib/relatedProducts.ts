import type { CatalogProduct } from "../types";

const COLOR_PREFIX =
  /^(grey|gray|green|black|white|navy|red|blue|pink|brown|cream|olive|charcoal|purple|yellow|orange|beige|tan|silver|gold|ivory|burgundy|maroon|teal|khaki|camo)\s+/i;

/** Pull the drop/collection name from titles like "Tshirt - Grey Hot Roll". */
export function extractDropName(title: string): string {
  const raw = String(title || "").trim();
  if (!raw) return "";
  const afterDash = raw.includes(" - ") ? raw.split(" - ").slice(1).join(" - ").trim() : raw;
  const withoutColor = afterDash.replace(COLOR_PREFIX, "").trim();
  const drop = withoutColor || afterDash;
  return drop.length >= 3 ? drop : "";
}

export function relatedFromDrop(
  products: CatalogProduct[],
  current: { id?: string; handle?: string; title?: string }
): { dropName: string; related: CatalogProduct[] } {
  const dropName = extractDropName(current.title || "");
  if (!dropName) return { dropName: "", related: [] };
  const needle = dropName.toLowerCase();
  const related = products.filter((product) => {
    if (product.id === current.id || product.handle === current.handle) return false;
    return String(product.title || "").toLowerCase().includes(needle);
  });
  return { dropName, related };
}
