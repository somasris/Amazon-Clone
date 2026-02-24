import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import { addCart } from "../services/cartService";
import { placeOrder } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { getSafeProductImage, setFallbackImage } from "../utils/imageFallback";
import { formatINR } from "../utils/currency";

const getHighlights = (product) => {
  const firstLine = product.description || "";
  return [
    firstLine,
    `${product.category_name || "General"} product with ${product.visibility_tier} tier availability.`,
    "Fast delivery and secure checkout supported in this demo store.",
    "Ideal for daily use with practical value-for-money positioning.",
  ];
};

const getSpecs = (product) => [
  { label: "Brand", value: "Amazon Basics" },
  { label: "Category", value: product.category_name || "General" },
  { label: "Tier", value: product.visibility_tier || "free" },
  { label: "Availability", value: product.availability ? "In stock" : "Out of stock" },
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProduct(id).then((res) => setProduct(res.data));
  }, [id]);

  const buyNow = async () => {
    await placeOrder({ product_id: Number(id), quantity: qty });
    navigate("/orders");
  };

  const addToCart = async () => {
    await addCart({ product_id: Number(id), quantity: qty });
    navigate("/cart");
  };

  if (!product) return <div className="page">Loading...</div>;

  const highlights = getHighlights(product);
  const specs = getSpecs(product);
  const price = Number(product.price || 0);
  const listPrice = Number((price * 1.22).toFixed(2));
  const discount = Math.max(1, Math.round(((listPrice - price) / listPrice) * 100));
  const rating = (3.9 + ((Number(product.id) || 1) % 10) * 0.1).toFixed(1);
  const ratingsCount = 100 + ((Number(product.id) || 1) * 37) % 1200;

  return (
    <div className="page">
      <section className="product-details">
        <div className="details-gallery">
          <img
            src={getSafeProductImage(product.image_url, product.name)}
            alt={product.name}
            className="details-img"
            onError={(event) => setFallbackImage(event, product.name)}
          />
        </div>

        <div className="details-main">
          <h1>{product.name}</h1>
          <p className="details-meta">Visit the {product.category_name || "Product"} store</p>
          <p className="details-rating">{rating} stars ({ratingsCount} ratings)</p>
          <p className="details-bought">1k+ bought in past month</p>
          <hr />

          <p className="details-price">
            <span className="discount">-{discount}%</span> {formatINR(price)}
          </p>
          <p className="details-list-price">M.R.P.: {formatINR(listPrice)}</p>
          <p className="details-tax">Inclusive of all taxes. EMI starts at {formatINR(19)}/month.</p>

          <section className="details-specs">
            {specs.map((spec) => (
              <div key={spec.label} className="spec-row">
                <strong>{spec.label}</strong>
                <span>{spec.value}</span>
              </div>
            ))}
          </section>

          <section className="details-about">
            <h3>About this item</h3>
            <ul>
              {highlights.map((item, index) => (
                <li key={`${product.id}-highlight-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="buy-box">
          <p className="buy-box-price">{formatINR(price)}</p>
          <p className="buy-box-delivery">FREE delivery by tomorrow, 10 PM</p>
          <p className="buy-box-stock">{product.availability ? "In stock" : "Currently unavailable"}</p>
          <label className="qty-label">
            Qty
            <select value={qty} onChange={(event) => setQty(Number(event.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>

          {user?.role === "user" ? (
            <div className="buy-box-actions">
              <button className="amazon-btn" onClick={addToCart} disabled={!product.availability}>
                Add to Cart
              </button>
              <button className="buy-now-btn" onClick={buyNow} disabled={!product.availability}>
                Buy Now
              </button>
            </div>
          ) : (
            <p className="buy-box-note">Login as a user account to purchase this item.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
