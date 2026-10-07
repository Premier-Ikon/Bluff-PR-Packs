"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CatalogSkeleton } from "./components/PageLoader";
import { api } from "./lib/api";
import type { CatalogProduct, CatalogSize } from "./types";

const FALLBACK_BANNER =
  "https://gotbluff.com/cdn/shop/files/DSC01964_-_2.png?v=1790870251&width=3840";
const FALLBACK_HEADING = "Welcome to Bluff Friends";
const FALLBACK_TEXT =
  "Grab what you want. Browse what's available, select your items and sizes, and submit your order. We'll take care of the rest.";

export default function HomePage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [sizes, setSizes] = useState<CatalogSize[]>([]);
  const [bannerUrl, setBannerUrl] = useState(FALLBACK_BANNER);
  const [bannerHeading, setBannerHeading] = useState(FALLBACK_HEADING);
  const [bannerText, setBannerText] = useState(FALLBACK_TEXT);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [size, setSize] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<{ products: CatalogProduct[]; sizes?: CatalogSize[] }>({ action: "listProducts" }),
      api<{
        settings?: { bannerImageUrl?: string; bannerHeading?: string; bannerText?: string };
      }>({ action: "getSiteSettings" }).catch(() => ({ settings: undefined })),
    ])
      .then(([catalog, settings]) => {
        if (cancelled) return;
        setProducts(catalog.products || []);
        setSizes(catalog.sizes || []);
        const next = settings.settings;
        if (!next) return;
        if (next.bannerImageUrl?.trim()) setBannerUrl(next.bannerImageUrl.trim());
        setBannerHeading(next.bannerHeading ?? FALLBACK_HEADING);
        setBannerText(next.bannerText ?? FALLBACK_TEXT);
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
      if (size !== "all" && !(product.sizeHandles || []).includes(size)) return false;
      if (!needle) return true;
      return `${product.title} ${product.productType}`.toLowerCase().includes(needle);
    });
  }, [products, query, type, size]);

  const sizeTitle = sizes.find((entry) => entry.handle === size)?.title || "";
  const sectionLabel = [sizeTitle, type === "all" ? "All product" : type].filter(Boolean).join(" · ");

  return (
    <main className={`home${loading ? "" : " content-fade"}`}>
      <section className="home-banner">
        <img src={bannerUrl} alt={bannerHeading || "Friends only"} />
        {bannerHeading || bannerText ? (
          <div className="home-banner-copy">
            {bannerHeading ? <h1>{bannerHeading}</h1> : null}
            {bannerText ? <p>{bannerText}</p> : null}
          </div>
        ) : null}
      </section>

      <div className="page home-page">
        <div className="toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search styles"
            aria-label="Search styles"
          />
          <div className="toolbar-filters">
            <select value={size} onChange={(event) => setSize(event.target.value)} aria-label="Filter size">
              <option value="all">All sizes</option>
              {sizes.map((entry) => (
                <option key={entry.handle} value={entry.handle}>
                  {entry.title}
                </option>
              ))}
            </select>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter type">
              <option value="all">All product</option>
              {types.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
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
      </div>
    </main>
  );
}
