import { FormEvent, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";

export function Layout({
  categories,
  children,
}: {
  categories: string[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (q.length < 2) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="site-header">
        <div className="header-row">
          <Link to="/" className="brand">
            Northline
          </Link>
          <form className="search" onSubmit={onSearch} role="search">
            <label htmlFor="search" className="visually-hidden">
              Search products
            </label>
            <input
              id="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search the catalogue"
            />
            <button type="submit">Search</button>
          </form>
        </div>
        <nav className="categories" aria-label="Categories">
          {categories.map((category) => (
            <Link key={category} to={`/category/${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
