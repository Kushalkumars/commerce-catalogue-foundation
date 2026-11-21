export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

export function compareByRating(a: Product, b: Product): number {
  if (b.rating.rate !== a.rating.rate) return b.rating.rate - a.rating.rate;
  if (b.rating.count !== a.rating.count) return b.rating.count - a.rating.count;
  return a.id - b.id;
}
