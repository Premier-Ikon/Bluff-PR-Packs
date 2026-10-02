"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogSkeleton } from "./components/PageLoader";
import { api } from "./lib/api";
import type { CatalogProduct } from "./types";

export default function HomePage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ products: CatalogProduct[] }>({ action: "listProducts" })
      .then((payload) => {
        if (!cancelled) setProducts(payload.products || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const types = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.productType).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (type !== "all" && product.productType !== type) return false;
      if (!needle) return true;
      return `${product.title} ${product.productType}`.toLowerCase().includes(needle);
    });
  }, [products, query, type]);

  const sectionLabel = type === "all" ? "All product" : type;

  return (
    <main className={`page${loading ? "" : " content-fade"}`}>
      <section className="hero">
        <p className="eyebrow">Private catalog</p>
        <h1>Request the drop</h1>
        <p>
          Browse live Bluff inventory, pick available sizes, and submit a complimentary PR pack
          request. Same catalog as gotbluff.com — request-only for press and partners.
        </p>
      </section>

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search styles"
          aria-label="Search styles"
        />
        <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter type">
          <option value="all">All product</option>
          {types.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </div>

      <h2 className="section-label">{sectionLabel}</h2>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <CatalogSkeleton /> : null}
      {!loading && !visible.length ? <p className="empty">No matching styles right now.</p> : null}

      {!loading ? (
        <section className="grid">
          {visible.map((product) => (
            <Link className="card" href={`/product/${product.handle}`} key={product.id}>
              <div className="card-image">
                {product.image ? <img src={product.image} alt={product.title} /> : null}
                {!product.available ? <span className="card-badge">Sold out</span> : null}
              </div>
              <div>
                <h2>{product.title}</h2>
                {product.available ? (
                  <p>{product.availableSizes.slice(0, 6).join(" · ")}</p>
                ) : (
                  <p className="sold">Sold out</p>
                )}
              </div>
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}
