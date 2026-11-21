import type { Product } from "../domain/product.js";
import type { ProductCatalogue } from "../ports/product-catalogue.js";

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate?: number; count?: number };
}

/**
 * Reads the public Fake Store API and keeps a short in-memory copy
 * so a slow upstream does not make every page wait.
 */
export class FakeStoreCatalogue implements ProductCatalogue {
  private cached: { at: number; products: Product[] } | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly cacheMs: number,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async listProducts(): Promise<Product[]> {
    if (this.cached && Date.now() - this.cached.at < this.cacheMs) {
      return this.cached.products;
    }

    const response = await this.fetchImpl(`${this.baseUrl}/products`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`Fake Store responded with ${response.status}`);
    }

    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error("Fake Store returned an unexpected payload");

    const products = body.map(toProduct);
    this.cached = { at: Date.now(), products };
    return products;
  }

  async getProduct(id: number): Promise<Product | null> {
    const products = await this.listProducts();
    return products.find((product) => product.id === id) ?? null;
  }
}

function toProduct(value: unknown): Product {
  const raw = value as FakeStoreProduct;
  if (
    typeof raw?.id !== "number" ||
    typeof raw.title !== "string" ||
    typeof raw.price !== "number" ||
    typeof raw.description !== "string" ||
    typeof raw.category !== "string" ||
    typeof raw.image !== "string"
  ) {
    throw new Error("Fake Store returned a product missing required fields");
  }

  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    description: raw.description,
    category: raw.category,
    image: raw.image,
    rating: {
      rate: typeof raw.rating?.rate === "number" ? raw.rating.rate : 0,
      count: typeof raw.rating?.count === "number" ? raw.rating.count : 0,
    },
  };
}
