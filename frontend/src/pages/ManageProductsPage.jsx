import React, { useEffect, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/productService";
import { formatINR } from "../utils/currency";

const initial = {
  name: "",
  description: "",
  image_url: "",
  price: "",
  category_id: 1,
  availability: 1,
  visibility_tier: "free"
};

export default function ManageProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      setError("");
      const res = await getProducts();
      setItems(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setNotice("");
      if (editingId) {
        await updateProduct(editingId, form);
        setNotice("Product updated");
      } else {
        await createProduct(form);
        setNotice("Product created");
      }
      setForm(initial);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      image_url: product.image_url || "",
      price: product.price,
      category_id: product.category_id,
      availability: product.availability,
      visibility_tier: product.visibility_tier
    });
  };

  const remove = async (id) => {
    try {
      setError("");
      setNotice("");
      await deleteProduct(id);
      setNotice("Product deleted");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="page">
      <h2>Manage Products</h2>
      {error ? <p className="error">{error}</p> : null}
      {notice ? <p className="success-note">{notice}</p> : null}
      <form className="auth-form" onSubmit={submit}>
        <input value={form.name} placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input
          value={form.description}
          placeholder="Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          value={form.image_url}
          placeholder="Image URL"
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <input value={form.price} placeholder="Price" onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input
          value={form.category_id}
          placeholder="Category ID"
          onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
        />
        <select
          value={form.visibility_tier}
          onChange={(e) => setForm({ ...form, visibility_tier: e.target.value })}
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <img src={item.image_url} alt={item.name} className="admin-product-thumb" />
          <span>{item.name}</span>
          <span>{formatINR(item.price)}</span>
          <span>{item.visibility_tier}</span>
          <div className="inline-actions">
            <button onClick={() => edit(item)}>Edit</button>
            <button onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
