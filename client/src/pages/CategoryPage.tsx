import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { ProductGrid } from "../components/ProductCard";
import type { CategoryPage as CategoryView } from "../types";

export function CategoryPage() {
  const { category = "" } = useParams();
  const name = decodeURIComponent(category);
  const [page, setPage] = useState<CategoryView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setPage(null);
    setError("");
    api
      .category(name)
      .then((body) => {
        if (active) setPage(body);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load this category.");
      });
    return () => {
      active = false;
    };
  }, [name]);

  const empty = page && page.topRated.length === 0 && page.additional.length === 0;

  return (
    <section>
      <p className="kicker">Category</p>
      <h1>{name}</h1>
      {error && <p className="form-error">{error}</p>}
      {empty && <p className="empty">No products in this category.</p>}
      {page && page.topRated.length > 0 && (
        <>
          <h2>Top rated</h2>
          <ProductGrid products={page.topRated} />
        </>
      )}
      {page && page.additional.length > 0 && (
        <>
          <h2>More in this category</h2>
          <ProductGrid products={page.additional} />
        </>
      )}
    </section>
  );
}
