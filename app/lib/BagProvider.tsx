"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BagItem } from "../types";

const KEY = "bluff-pr-bag-v2";
const TTL_MS = 24 * 60 * 60 * 1000;

type StoredBag = {
  items: BagItem[];
  updatedAt: number;
};

type BagState = {
  items: BagItem[];
  count: number;
  ready: boolean;
  add: (item: BagItem) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagState | null>(null);

function isBagItem(value: unknown): value is BagItem {
  if (!value || typeof value !== "object") return false;
  const item = value as BagItem;
  return Boolean(item.variantId && item.title && Number(item.qty) > 0);
}

function readStoredBag(): StoredBag | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      // Migrate older bag key if present.
      const legacy = window.localStorage.getItem("bluff-pr-bag");
      if (!legacy) return null;
      const parsed = JSON.parse(legacy) as BagItem[] | StoredBag;
      const items = Array.isArray(parsed) ? parsed.filter(isBagItem) : (parsed.items || []).filter(isBagItem);
      if (!items.length) return null;
      return { items, updatedAt: Date.now() };
    }
    const parsed = JSON.parse(raw) as StoredBag;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(isBagItem) : [];
    const updatedAt = Number(parsed.updatedAt || 0);
    if (!items.length || !updatedAt) return null;
    if (Date.now() - updatedAt > TTL_MS) {
      window.localStorage.removeItem(KEY);
      window.localStorage.removeItem("bluff-pr-bag");
      return null;
    }
    return { items, updatedAt };
  } catch {
    return null;
  }
}

function writeStoredBag(items: BagItem[]) {
  if (typeof window === "undefined") return;
  if (!items.length) {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem("bluff-pr-bag");
    return;
  }
  const payload: StoredBag = { items, updatedAt: Date.now() };
  window.localStorage.setItem(KEY, JSON.stringify(payload));
  window.localStorage.removeItem("bluff-pr-bag");
}

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredBag();
    setItems(stored?.items || []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStoredBag(items);
  }, [items, ready]);

  const value = useMemo<BagState>(
    () => ({
      items,
      ready,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      add(item) {
        setItems((current) => {
          const existing = current.find((entry) => entry.variantId === item.variantId);
          if (existing) {
            return current.map((entry) =>
              entry.variantId === item.variantId
                ? { ...entry, qty: Math.min(6, entry.qty + item.qty) }
                : entry
            );
          }
          return [...current, item];
        });
      },
      setQty(variantId, qty) {
        setItems((current) =>
          current
            .map((entry) => (entry.variantId === variantId ? { ...entry, qty } : entry))
            .filter((entry) => entry.qty > 0)
        );
      },
      remove(variantId) {
        setItems((current) => current.filter((entry) => entry.variantId !== variantId));
      },
      clear() {
        setItems([]);
      },
    }),
    [items, ready]
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const value = useContext(BagContext);
  if (!value) throw new Error("useBag must be used inside BagProvider");
  return value;
}
