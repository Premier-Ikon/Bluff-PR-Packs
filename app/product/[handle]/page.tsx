"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BrandModal } from "../../components/BrandModal";
import { ProductSkeleton } from "../../components/PageLoader";
import { useBag } from "../../lib/BagProvider";
import { api } from "../../lib/api";
import { relatedFromDrop } from "../../lib/relatedProducts";
import type { CatalogProduct, ProductDetail } from "../../types";

export default function ProductPage() {
  const params = useParams<{ handle: string }>();
  const handle = String(params.handle || "");
  const { add } = useBag();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [image, setImage] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [addedOpen, setAddedOpen] = useState(false);
  const [addedLabel, setAddedLabel] = useState("");
  const [addedImage, setAddedImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setLoading(true);
    setQty(1);
    Promise.all([
      api<{ product: ProductDetail }>({ action: "getProduct", handle }),
      api<{ products: CatalogProduct[] }>({ action: "listProducts" }).catch(() => ({ products: [] })),
    ])
      .then(([detailPayload, catalogPayload]) => {
        if (cancelled) return;
        const next = detailPayload.product;
        if (!next) {
          setError("Product not found.");
          return;
        }
        const variants = next.variants ?? [];
        const images = next.images ?? [];
        setProduct({ ...next, variants, images });
        setCatalog(catalogPayload.products || []);
        const firstAvailable = variants.find((variant) => variant.available);
        setVariantId(firstAvailable?.id || variants[0]?.id || "");
        setImage(firstAvailable?.image || images[0]?.url || next.image || "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const selected = useMemo(
    () => product?.variants.find((variant) => variant.id === variantId) || null,
    [product, variantId]
  );

  const { dropName, related } = useMemo(() => {
    if (!product) return { dropName: "", related: [] as CatalogProduct[] };
    return relatedFromDrop(catalog, product);
  }, [catalog, product]);

  function addToBag() {
    if (!product || !selected || !selected.available) return;
    const nextQty = Math.min(6, Math.max(1, qty));
    const imageUrl = selected.image || product.image || "";
    add({
      productId: product.id,
      handle: product.handle,
      title: product.title,
      variantId: selected.id,
      size: selected.size,
      color: selected.color,
      qty: nextQty,
      image: imageUrl,
    });
    setAddedLabel(`${product.title}\n${selected.size}${selected.color ? ` · ${selected.color}` : ""} · ×${nextQty}`);
    setAddedImage(imageUrl);
    setAddedOpen(true);
  }

  if (loading) {
    return (
      <main className="page">
        <ProductSkeleton />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <p className="error">{error || "Product not found."}</p>
      </main>
    );
  }

  return (
    <main className="page content-fade">
      <div className="product-layout">
        <section className="gallery">
          <div className="gallery-main">
            {image ? <img src={image} alt={product.title} /> : null}
          </div>
          {product.images.length > 1 ? (
            <div className="thumbs">
              {product.images.slice(0, 5).map((entry) => (
                <button
                  key={entry.url}
                  type="button"
                  className={image === entry.url ? "is-on" : ""}
                  onClick={() => setImage(entry.url)}
                >
                  <img src={entry.url} alt={entry.alt} />
                </button>
              ))}
            </div>
          ) : null}
        </section>
        <section className="product-copy">
          <p className="eyebrow">{product.productType}</p>
          <h1>{product.title}</h1>
          {product.description ? <p className="desc">{product.description}</p> : null}
          <p className="muted" style={{ textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em", fontSize: 12 }}>
            Available sizes
          </p>
          <div className="sizes">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`size-chip${variant.id === variantId ? " is-on" : ""}`}
                disabled={!variant.available}
                onClick={() => {
                  setVariantId(variant.id);
                  if (variant.image) setImage(variant.image);
                }}
              >
                {variant.size}
              </button>
            ))}
          </div>
          <div className="qty-row">
            <p className="muted qty-label">Quantity</p>
            <div className="qty-stepper">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={qty <= 1 || !selected?.available}
                onClick={() => setQty((current) => Math.max(1, current - 1))}
              >
                −
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= 6 || !selected?.available}
                onClick={() => setQty((current) => Math.min(6, current + 1))}
              >
                +
              </button>
            </div>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <button className="primary-btn" type="button" disabled={!selected?.available} onClick={addToBag}>
            {selected?.available ? "Add to request" : "Sold out"}
          </button>
        </section>
      </div>

      {related.length ? (
        <section className="related-drop" aria-label={`More from ${dropName}`}>
          <div className="related-drop-head">
            <p className="section-label">More from {dropName}</p>
            <p className="muted">Scroll for the rest of the drop</p>
          </div>
          <div className="related-rail">
            {related.map((entry) => (
              <Link className="related-card" href={`/product/${entry.handle}`} key={entry.id}>
                <div className="related-card-image">
                  {entry.image ? <img src={entry.image} alt={entry.title} /> : null}
                  {!entry.available ? <span className="card-badge">Sold out</span> : null}
                </div>
                <h3>{entry.title}</h3>
                {entry.available ? (
                  <p>{entry.availableSizes.slice(0, 4).join(" · ")}</p>
                ) : (
                  <p className="sold">Sold out</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <BrandModal open={addedOpen} title="Added to bag" onClose={() => setAddedOpen(false)}>
        <div className="brand-modal-item">
          <div className="brand-modal-thumb">
            {addedImage ? <img src={addedImage} alt="" /> : null}
          </div>
          <p className="brand-modal-copy brand-modal-item-copy">{addedLabel}</p>
        </div>
        <div className="brand-modal-actions">
          <Link className="primary-btn" href="/request" onClick={() => setAddedOpen(false)}>
            Go to cart
          </Link>
          <button className="ghost-btn" type="button" onClick={() => setAddedOpen(false)}>
            Keep shopping
          </button>
        </div>
      </BrandModal>
    </main>
  );
}
