import { describe, expect, it } from "vitest";
import type { Product } from "../src/domain/product.js";
import type { ProductCatalogue } from "../src/ports/product-catalogue.js";
import { CatalogueService } from "../src/services/catalogue-service.js";

function product(overrides: Partial<Product> & Pick<Product, "id" | "title" | "category">): Product {
  return {
    price: 10,
    description: `${overrides.title} description`,
    image: "https://example.test/image.jpg",
    rating: { rate: 3, count: 10 },
    ...overrides,
  };
}

class MemoryCatalogue implements ProductCatalogue {
  constructor(private readonly products: Product[]) {}
  async listProducts() {
    return this.products;
  }
  async getProduct(id: number) {
    return this.products.find((item) => item.id === id) ?? null;
  }
}

const sample = [
  product({ id: 1, title: "Backpack", category: "bags", rating: { rate: 4.2, count: 20 } }),
  product({ id: 2, title: "Gold ring", category: "jewelery", rating: { rate: 4.9, count: 8 } }),
  product({ id: 3, title: "Silver ring", category: "jewelery", rating: { rate: 4.9, count: 40 } }),
  product({ id: 4, title: "Cotton shirt", category: "clothing", rating: { rate: 3.1, count: 5 } }),
  product({ id: 5, title: "Wool coat", category: "clothing", rating: { rate: 4.6, count: 12 } }),
  product({ id: 6, title: "Linen shirt", category: "clothing", rating: { rate: 4.0, count: 9 } }),
];

function service() {
  return new CatalogueService(new MemoryCatalogue(sample), [5, 1, 99], 2);
}

describe("CatalogueService", () => {
  it("returns the chosen featured products in the configured order and skips missing ids", async () => {
    const featured = await service().featuredProducts();
    expect(featured.map((item) => item.id)).toEqual([5, 1]);
  });

  it("splits a category into top rated products and the rest", async () => {
    const page = await service().categoryPage("clothing");
    expect(page.topRated.map((item) => item.id)).toEqual([5, 6]);
    expect(page.additional.map((item) => item.id)).toEqual([4]);
  });

  it("breaks rating ties by number of reviews", async () => {
    const page = await service().categoryPage("jewelery");
    expect(page.topRated.map((item) => item.id)).toEqual([3, 2]);
  });

  it("matches search text in the title or description only", async () => {
    const hits = await service().search("shirt");
    expect(hits.map((item) => item.id).sort()).toEqual([4, 6]);
  });
});
