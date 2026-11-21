import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { api } from "./api";
import { Layout } from "./components/Layout";
import { CategoryPage } from "./pages/CategoryPage";
import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { SearchPage } from "./pages/SearchPage";

export function App() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    api
      .categories()
      .then((body) => setCategories(body.categories))
      .catch(() => setCategories([]));
  }, []);

  return (
    <Layout categories={categories}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>
    </Layout>
  );
}
