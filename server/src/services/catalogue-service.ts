import { compareByRating, type Product } from "../domain/product.js";
import type { ProductCatalogue } from "../ports/product-catalogue.js";

export interface CategoryPage {
  category: string;
  topRated: Product[];
  additional: Product[];
}

export class CatalogueService {
  constructor(
    private readonly catalogue: ProductCatalogue,
    private readonly featuredIds: number[],
    private readonly topRatedPerCategory: number,
  ) {}

  async featuredProducts(): Promise<Product[]> {
    const byId = new Map((await this.catalogue.listProducts()).map((product) => [product.id, product]));
    return this.featuredIds.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    });
  }

  async categories(): Promise<string[]> {
    const names = new Set((await this.catalogue.listProducts()).map((product) => product.category));
    return [...names].sort((a, b) => a.localeCompare(b));
  }

  async categoryPage(category: string): Promise<CategoryPage> {
    const needle = category.trim().toLowerCase();
    const matches = (await this.catalogue.listProducts()).filter(
      (product) => product.category.toLowerCase() === needle,
    );
    const ranked = [...matches].sort(compareByRating);
    const limit = this.topRatedPerCategory;
    return {
      category,
      topRated: ranked.slice(0, limit),
      additional: ranked.slice(limit),
    };
  }

  async search(term: string): Promise<Product[]> {
    const needle = term.trim().toLowerCase();
    return (await this.catalogue.listProducts()).filter((product) => {
      const haystack = `${product.title} ${product.description}`.toLowerCase();
      return haystack.includes(needle);
    });
  }

  getProduct(id: number): Promise<Product | null> {
    return this.catalogue.getProduct(id);
  }
}
