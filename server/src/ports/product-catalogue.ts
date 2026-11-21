import type { Product } from "../domain/product.js";

/**
 * The only way the rest of the app reads products.
 * Replace the adapter when the Fake Store API is retired.
 */
export interface ProductCatalogue {
  listProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
}
