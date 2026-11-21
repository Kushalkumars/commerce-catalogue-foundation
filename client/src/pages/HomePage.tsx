import { useEffect, useState } from "react";
import { ApiError, api } from "../api";
import { ProductGrid } from "../components/ProductCard";
import type { Product } from "../types";

export function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .featured()
      .then((body) => {
        if (active) setProducts(body.products);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load products.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <p className="kicker">Featured</p>
      <h1>Five pieces to start with</h1>
      <p className="lede">
        Chosen for the home page. The rest of the catalogue is one category away.
      </p>
      {error && <p className="form-error">{error}</p>}
      {products && <ProductGrid products={products} />}
    </section>
  );
}
