import React, { useEffect, useState } from "react";
import { myOrders, orderStatuses } from "../services/orderService";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    const res = await myOrders({ status: status || undefined });
    setOrders(res.data);
  };

  useEffect(() => {
    load();
  }, [status]);

  useEffect(() => {
    orderStatuses()
      .then((res) => setStatuses(res.data || []))
      .catch(() => setStatuses([]));
  }, []);

  return (
    <div className="page">
      <h2>Order History</h2>
      <div className="inline-actions">
        <button onClick={() => setStatus("")}>All</button>
        {statuses.map((item) => (
          <button key={item.code} onClick={() => setStatus(item.code)}>
            {item.label}
          </button>
        ))}
      </div>

      {orders.map((order) => (
        <div className="list-item" key={order.id}>
          <span>#{order.id}</span>
          <span>{order.product_name}</span>
          <span>Qty: {order.quantity}</span>
          <span>Status: {order.status_label || order.status}</span>
          <span>ETA: {order.eta_days ? `${order.eta_days} day(s)` : "N/A"}</span>
          <span>{order.delay_reason || ""}</span>
        </div>
      ))}
    </div>
  );
}
