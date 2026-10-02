export type CatalogProduct = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  image: string;
  availableSizes: string[];
  available: boolean;
};

export type ProductVariant = {
  id: string;
  title: string;
  size: string;
  color: string;
  available: boolean;
  image: string;
};

export type ProductDetail = CatalogProduct & {
  description: string;
  images: { url: string; alt: string }[];
  variants: ProductVariant[];
};

export type BagItem = {
  productId: string;
  handle: string;
  title: string;
  variantId: string;
  size: string;
  color?: string;
  qty: number;
  image: string;
};
