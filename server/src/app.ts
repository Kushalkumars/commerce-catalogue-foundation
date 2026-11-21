import cors from "cors";
import express, { type ErrorRequestHandler, type Express } from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import type { AppConfig } from "./config.js";
import type { MemoryEmailSender } from "./adapters/memory-email-sender.js";
import { EnquiryError, EnquiryService, enquirySchema } from "./services/enquiry-service.js";
import type { Product } from "./domain/product.js";
import type { CatalogueService } from "./services/catalogue-service.js";

function forClient(product: Product): Product {
  return { ...product, image: `/api/media/${product.id}` };
}

export interface AppDeps {
  config: AppConfig;
  catalogue: CatalogueService;
  enquiries: EnquiryService;
  inbox: MemoryEmailSender;
}

export function createApp({ config, catalogue, enquiries, inbox }: AppDeps): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/categories", async (_req, res, next) => {
    try {
      res.json({ categories: await catalogue.categories() });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/featured", async (_req, res, next) => {
    try {
      res.json({ products: (await catalogue.featuredProducts()).map(forClient) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/search", async (req, res, next) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (q.length < 2) {
        res.status(400).json({ error: "Enter at least 2 characters to search." });
        return;
      }
      res.json({ products: (await catalogue.search(q)).map(forClient) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "Unknown product." });
        return;
      }
      const product = await catalogue.getProduct(id);
      if (!product) {
        res.status(404).json({ error: "Product not found." });
        return;
      }
      res.json({ product: forClient(product) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:category/products", async (req, res, next) => {
    try {
      const category = decodeURIComponent(req.params.category);
      const page = await catalogue.categoryPage(category);
      res.json({
        category: page.category,
        topRated: page.topRated.map(forClient),
        additional: page.additional.map(forClient),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/media/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const product = Number.isInteger(id) ? await catalogue.getProduct(id) : null;
      if (!product) {
        res.status(404).json({ error: "Product not found." });
        return;
      }
      const upstream = await fetch(product.image, { signal: AbortSignal.timeout(8000) });
      if (!upstream.ok || !upstream.body) {
        res.status(502).json({ error: "The product image is unavailable." });
        return;
      }
      res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=3600");
      const bytes = Buffer.from(await upstream.arrayBuffer());
      res.send(bytes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/enquiries", async (req, res, next) => {
    try {
      const input = enquirySchema.parse(req.body);
      await enquiries.submit(input);
      res.status(201).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  if (config.enableDevInbox) {
    app.get("/api/dev/inbox", (_req, res) => {
      res.json({ messages: inbox.list() });
    });
  }

  const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Check the form and try again.",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    if (error instanceof EnquiryError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(502).json({ error: "The product catalogue is unavailable right now." });
  };

  app.use(handleError);
  return app;
}
