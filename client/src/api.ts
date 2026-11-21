import type { CategoryPage, EnquiryDraft, FieldError, Product } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: FieldError[] = [],
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    details?: FieldError[];
  } & T;

  if (!response.ok) {
    throw new ApiError(body.error || "Something went wrong.", response.status, body.details ?? []);
  }
  return body;
}

export const api = {
  categories: () => request<{ categories: string[] }>("/api/categories"),
  featured: () => request<{ products: Product[] }>("/api/products/featured"),
  category: (name: string) =>
    request<CategoryPage>(`/api/categories/${encodeURIComponent(name)}/products`),
  search: (q: string) =>
    request<{ products: Product[] }>(`/api/products/search?q=${encodeURIComponent(q)}`),
  product: (id: string) => request<{ product: Product }>(`/api/products/${id}`),
  enquire: (draft: EnquiryDraft) =>
    request<{ ok: boolean }>("/api/enquiries", { method: "POST", body: JSON.stringify(draft) }),
};
