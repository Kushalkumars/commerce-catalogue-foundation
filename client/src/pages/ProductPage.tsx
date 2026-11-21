import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, api } from "../api";
import { EnquiryForm } from "../components/EnquiryForm";
import { formatPrice } from "../components/ProductCard";
import type { Product } from "../types";

export function ProductPage() {
  const { id = "" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setProduct(null);
    setError("");
    api
      .product(id)
      .then((body) => {
        if (active) setProduct(body.product);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof ApiError ? reason.message : "Could not load this product.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <section>
        <p className="form-error">{error}</p>
        <Link to="/">Back to the catalogue</Link>
      </section>
    );
  }

  if (!product) return <p className="empty">Loading product…</p>;

  return (
    <article className="product">
      <img src={product.image} alt={product.title} />
      <div>
        <p className="kicker">
          <Link to={`/category/${encodeURIComponent(product.category)}`}>{product.category}</Link>
        </p>
        <h1>{product.title}</h1>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="meta">
          Rated {product.rating.rate.toFixed(1)} from {product.rating.count} reviews
        </p>
        <p className="description">{product.description}</p>
        <EnquiryForm productId={product.id} />
      </div>
    </article>
  );
}
