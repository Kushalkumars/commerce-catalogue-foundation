import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { ProductGrid } from "../components/ProductCard";
import type { Product } from "../types";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setProducts(null);
    setError("");
    if (q.length < 2) {
      setError("Enter at least 2 characters, then press Search.");
      return;
    }
    api
      .search(q)
      .then((body) => {
        if (active) setProducts(body.products);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Search failed.");
      });
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <section>
      <p className="kicker">Search</p>
      <h1>{q ? `Results for “${q}”` : "Search"}</h1>
      {error && <p className="form-error">{error}</p>}
      {products && products.length === 0 && <p className="empty">No products match that search.</p>}
      {products && products.length > 0 && <ProductGrid products={products} />}
    </section>
  );
}
