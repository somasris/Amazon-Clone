import React, { useEffect, useState } from "react";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import { getCategories, getProducts } from "../services/productService";
import { addCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);

  const load = async () => {
    try {
      setError("");
      const params = {
        q: q || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        page,
        limit: 12
      };
      const res = await getProducts(params);
      setProducts(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 12 });
    } catch (err) {
      setProducts([]);
      setError(err.response?.data?.message || "Failed to load products");
    }
  };

  useEffect(() => {
    load();
  }, [page, sort]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.map((c) => c.name)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setPage(1);
    load();
  }, [category]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const onAdd = async (productId) => {
    if (!user || user.role !== "user") return;
    await addCart({ product_id: productId, quantity: 1 });
    setNotice("Added to cart");
    setTimeout(() => setNotice(""), 1500);
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Deals for your {user?.account_type || "free"} plan</h1>
        <p>Amazon-style storefront with role-based pricing visibility and live delivery updates.</p>
      </section>
      <form className="filters" onSubmit={onSearch}>
        <input placeholder="Search by product name" value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A-Z</option>
        </select>
        <button type="submit">Search</button>
      </form>

      <CategoryBar categories={categories} selected={category} onSelect={setCategory} />
      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="success-note">{notice}</p> : null}
      <p className="result-meta">{pagination.total} results</p>

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={user?.role === "user" ? onAdd : null} />
        ))}
      </div>
      <div className="pager">
        <button disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
        </span>
        <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
