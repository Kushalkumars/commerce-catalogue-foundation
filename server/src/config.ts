import dotenv from "dotenv";
import { existsSync } from "node:fs";

for (const path of [".env", "../.env"]) {
  if (existsSync(path)) dotenv.config({ path });
}

function intList(value: string | undefined, fallback: number[]): number[] {
  if (!value?.trim()) return fallback;
  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length > 0 ? ids : fallback;
}

function intValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export interface AppConfig {
  port: number;
  clientOrigin: string;
  fakeStoreBaseUrl: string;
  cacheSeconds: number;
  featuredProductIds: number[];
  topRatedPerCategory: number;
  salesInbox: string;
  enableDevInbox: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: intValue(env.PORT, 3001),
    clientOrigin: env.CLIENT_ORIGIN?.trim() || "http://localhost:5173",
    fakeStoreBaseUrl: (env.FAKE_STORE_BASE_URL?.trim() || "https://fakestoreapi.com").replace(/\/$/, ""),
    cacheSeconds: intValue(env.CATALOGUE_CACHE_SECONDS, 60),
    featuredProductIds: intList(env.FEATURED_PRODUCT_IDS, [1, 2, 3, 4, 5]),
    topRatedPerCategory: intValue(env.TOP_RATED_PER_CATEGORY, 3),
    salesInbox: env.SALES_INBOX?.trim() || "sales@example.com",
    enableDevInbox: env.ENABLE_DEV_INBOX !== "false",
  };
}
