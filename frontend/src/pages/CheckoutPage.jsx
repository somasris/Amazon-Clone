import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeCart } from "../services/cartService";
import { placeOrder } from "../services/orderService";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getCart().then((res) => setItems(res.data));
  }, []);

  const onPlace = async () => {
    for (const item of items) {
      await placeOrder({ product_id: item.product_id, quantity: item.quantity });
      await removeCart(item.id);
    }
    navigate("/orders");
  };

  return (
    <div className="page">
      <h2>Checkout</h2>
      <p>Items: {items.length}</p>
      <button onClick={onPlace} disabled={!items.length}>
        Place Order
      </button>
    </div>
  );
}
