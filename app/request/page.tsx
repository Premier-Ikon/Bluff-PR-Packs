"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ShippingFields, {
  emptyShippingAddress,
  type ShippingAddress,
} from "../components/AddressAutocomplete";
import { BrandModal } from "../components/BrandModal";
import { useBag } from "../lib/BagProvider";
import { api } from "../lib/api";

export default function RequestPage() {
  const router = useRouter();
  const { items, setQty, remove, clear } = useBag();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShippingAddress);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [thanksOpen, setThanksOpen] = useState(false);

  const pieceCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!items.length) {
      setError("Add at least one available item first.");
      return;
    }
    if (!addressConfirmed || !shipping.placeId) {
      setError("Select a confirmed shipping address from the suggestions.");
      return;
    }
    if (!shipping.address.trim() || !shipping.city.trim()) {
      setError("Enter address and city.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const line1 = shipping.address.trim();
      const line2 = shipping.address2.trim();
      const formatted =
        shipping.formatted ||
        [line1, line2, shipping.city, shipping.region, shipping.postal, shipping.country]
          .filter(Boolean)
          .join(", ");
      await api<{ message?: string }>({
        action: "submitRequest",
        name,
        email,
        phone,
        address: line2 ? `${line1}, ${line2}` : line1,
        address2: line2,
        city: shipping.city,
        region: shipping.region,
        postal: shipping.postal,
        country: shipping.country || "United States",
        formattedAddress: formatted,
        placeId: shipping.placeId,
        items,
      });
      clear();
      setName("");
      setEmail("");
      setPhone("");
      setShipping(emptyShippingAddress);
      setAddressConfirmed(false);
      setThanksOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit that request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page request-page content-fade">
      <section className="request-hero">
        <h1>Request</h1>
        <p>Complimentary PR pack · available sizes only</p>
      </section>

      {!items.length ? (
        <section className="request-empty">
          <p>Your bag is empty.</p>
          <Link className="text-link" href="/">
            Continue shopping
          </Link>
        </section>
      ) : (
        <section className="request-bag">
          <div className="request-bag-head">
            <h2>
              Bag · {pieceCount} {pieceCount === 1 ? "piece" : "pieces"}
            </h2>
            <Link className="text-link" href="/">
              Add more
            </Link>
          </div>
          <ul className="bag-list">
            {items.map((item) => (
              <li className="bag-row" key={item.variantId}>
                <div className="bag-thumb">
                  {item.image ? <img src={item.image} alt={item.title} /> : null}
                </div>
                <div className="bag-meta">
                  <h3>{item.title}</h3>
                  <p>
                    {item.size}
                    {item.color ? ` · ${item.color}` : ""}
                  </p>
                  <button className="text-link bag-remove" type="button" onClick={() => remove(item.variantId)}>
                    Remove
                  </button>
                </div>
                <div className="qty-stepper bag-qty">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.title}`}
                    disabled={item.qty <= 1}
                    onClick={() => setQty(item.variantId, Math.max(1, item.qty - 1))}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.title}`}
                    disabled={item.qty >= 6}
                    onClick={() => setQty(item.variantId, Math.min(6, item.qty + 1))}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="request-form" onSubmit={onSubmit}>
        <div className="request-form-head">
          <h2>Ship to</h2>
          <p>Name, email, phone, and shipping address</p>
        </div>

        <div className="form-stack">
          <div className="form-grid shipping-grid">
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>
          </div>
          <label>
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              autoComplete="tel"
              placeholder="In case we need to reach you about the shipment"
            />
          </label>
          <ShippingFields
            value={shipping}
            confirmed={addressConfirmed}
            onChange={setShipping}
            onConfirmedChange={setAddressConfirmed}
          />
        </div>

        {error ? <p className="error">{error}</p> : null}

        <button
          className="primary-btn request-submit"
          type="submit"
          disabled={busy || !items.length || !addressConfirmed}
        >
          {busy ? "Sending…" : "Submit request"}
        </button>
      </form>

      <BrandModal
        open={thanksOpen}
        title="Thank you"
        dismissAnywhere
        onClose={() => {
          setThanksOpen(false);
          router.push("/");
        }}
      >
        <p className="brand-modal-copy">
          Your request is in. We’ll review it and follow up by email.
        </p>
        <div className="brand-modal-actions">
          <Link className="primary-btn" href="/">
            Back to shop
          </Link>
          <button className="ghost-btn" type="button">
            Close
          </button>
        </div>
      </BrandModal>
    </main>
  );
}
