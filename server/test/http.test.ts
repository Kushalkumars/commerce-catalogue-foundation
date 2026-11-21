import request from "supertest";
import { describe, expect, it } from "vitest";
import { MemoryEmailSender } from "../src/adapters/memory-email-sender.js";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import type { Product } from "../src/domain/product.js";
import type { ProductCatalogue } from "../src/ports/product-catalogue.js";
import { CatalogueService } from "../src/services/catalogue-service.js";
import { EnquiryService } from "../src/services/enquiry-service.js";

const products: Product[] = [
  {
    id: 1,
    title: "Backpack",
    price: 40,
    description: "A sturdy backpack for day trips",
    category: "bags",
    image: "https://example.test/bag.jpg",
    rating: { rate: 4.5, count: 10 },
  },
];

class MemoryCatalogue implements ProductCatalogue {
  async listProducts() {
    return products;
  }
  async getProduct(id: number) {
    return products.find((item) => item.id === id) ?? null;
  }
}

const config: AppConfig = {
  port: 0,
  clientOrigin: "http://localhost:5173",
  fakeStoreBaseUrl: "http://example.test",
  cacheSeconds: 60,
  featuredProductIds: [1],
  topRatedPerCategory: 3,
  salesInbox: "sales@example.com",
  enableDevInbox: true,
};

function app() {
  const inbox = new MemoryEmailSender();
  const catalogue = new CatalogueService(new MemoryCatalogue(), [1], 3);
  return {
    inbox,
    http: createApp({
      config,
      catalogue,
      enquiries: new EnquiryService(catalogue, inbox, config.salesInbox),
      inbox,
    }),
  };
}

describe("HTTP API", () => {
  it("serves the featured product through the API", async () => {
    const { http } = app();
    const response = await request(http).get("/api/products/featured");
    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].title).toBe("Backpack");
    expect(response.body.products[0].image).toBe("/api/media/1");
  });

  it("rejects a search that is too short", async () => {
    const { http } = app();
    const response = await request(http).get("/api/products/search").query({ q: "a" });
    expect(response.status).toBe(400);
  });

  it("sends an enquiry to the sales inbox and rejects a bad email", async () => {
    const { http, inbox } = app();

    const bad = await request(http).post("/api/enquiries").send({
      productId: 1,
      name: "Ada Lovelace",
      email: "not-an-email",
      message: "Please tell me when this is back in stock.",
    });
    expect(bad.status).toBe(400);
    expect(inbox.list()).toHaveLength(0);

    const good = await request(http).post("/api/enquiries").send({
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Please tell me when this is back in stock.",
    });
    expect(good.status).toBe(201);

    const messages = inbox.list();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.to).toBe("sales@example.com");
    expect(messages[0]?.replyTo).toBe("ada@example.com");
    expect(messages[0]?.subject).toContain("Backpack");

    const inboxResponse = await request(http).get("/api/dev/inbox");
    expect(inboxResponse.body.messages).toHaveLength(1);
  });

  it("does not accept an enquiry for an unknown product", async () => {
    const { http, inbox } = app();
    const response = await request(http).post("/api/enquiries").send({
      productId: 99,
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Is this still available this week?",
    });
    expect(response.status).toBe(404);
    expect(inbox.list()).toHaveLength(0);
  });
});
