import { Link } from "react-router-dom";
import type { Product } from "../types";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "USD" }).format(price);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="card" to={`/products/${product.id}`}>
      <img src={product.image} alt="" />
      <div className="card-body">
        <p className="eyebrow">{product.category}</p>
        <h3>{product.title}</h3>
        <p className="meta">
          <span>{formatPrice(product.price)}</span>
          <span>
            {product.rating.rate.toFixed(1)} · {product.rating.count} reviews
          </span>
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return <p className="empty">Nothing to show here yet.</p>;
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
