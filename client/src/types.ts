export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export interface CategoryPage {
  category: string;
  topRated: Product[];
  additional: Product[];
}

export interface EnquiryDraft {
  productId: number;
  name: string;
  email: string;
  message: string;
}

export interface FieldError {
  field: string;
  message: string;
}
