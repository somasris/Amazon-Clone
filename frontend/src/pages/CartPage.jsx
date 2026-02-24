import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, removeCart, updateCart } from "../services/cartService";
import { getSafeProductImage, setFallbackImage } from "../utils/imageFallback";
import { formatINR } from "../utils/currency";

export default function CartPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await getCart();
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [items]
  );

  const onQty = async (id, quantity) => {
    if (quantity < 1) return;
    const res = await updateCart(id, { quantity });
    setItems(res.data);
  };

  const onRemove = async (id) => {
    const res = await removeCart(id);
    setItems(res.data);
  };

  return (
    <div className="page cart-page">
      <section className="cart-main">
        <h2>Shopping Cart</h2>
        {!items.length ? <p>Your Amazon Cart is empty.</p> : null}
        {items.map((item) => (
          <div className="cart-row" key={item.id}>
            <img
              src={getSafeProductImage(item.image_url, item.name)}
              alt={item.name}
              className="cart-item-img"
              onError={(event) => setFallbackImage(event, item.name)}
            />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p className="cart-stock">{item.availability ? "In stock" : "Unavailable"}</p>
              <div className="cart-controls">
                <button onClick={() => onQty(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onQty(item.id, item.quantity + 1)}>+</button>
                <button className="link-btn" onClick={() => onRemove(item.id)}>
                  Delete
                </button>
              </div>
            </div>
            <div className="cart-item-price">
              <span>{formatINR(item.price)}</span>
              <small>Qty {item.quantity} subtotal: {formatINR(Number(item.price) * Number(item.quantity))}</small>
            </div>
          </div>
        ))}
      </section>
      <aside className="cart-summary">
        <p>
          Subtotal ({items.reduce((sum, item) => sum + Number(item.quantity), 0)} items):{" "}
          <strong>{formatINR(total)}</strong>
        </p>
        <Link className="amazon-btn proceed-btn" to="/checkout">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
