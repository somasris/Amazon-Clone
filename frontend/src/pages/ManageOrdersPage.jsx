import React, { useEffect, useState } from "react";
import { allOrders, transitionOrder } from "../services/orderService";

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [formState, setFormState] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    const ordersRes = await allOrders();
    setOrders(ordersRes.data.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const setOrderChange = (orderId, patch) => {
    setFormState((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), ...patch }
    }));
  };

  const applyTransition = async (orderId) => {
    const state = formState[orderId] || {};
    if (!state.to_status) return;
    const order = orders.find((o) => o.id === orderId);
    const transitions = order?.allowed_transitions || [];
    const selectedTransition = transitions.find((t) => t.to_status === state.to_status);
    if (!selectedTransition) {
      setError("Invalid status transition selected");
      return;
    }
    if (selectedTransition.requires_reason && !String(state.delay_reason || "").trim()) {
      setError("Delay reason is required for this transition");
      return;
    }
    try {
      setError("");
      await transitionOrder(orderId, {
        to_status: state.to_status,
        delay_reason: state.delay_reason || undefined,
        eta_days: state.eta_days ? Number(state.eta_days) : undefined
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order");
    }
  };

  return (
    <div className="page manage-orders-page">
      <h2>Manage Orders</h2>
      <p className="result-meta">Review requests, update status, and set ETA or delay reason as needed.</p>
      {error ? <p className="error">{error}</p> : null}
      {orders.map((order) => {
        const current = formState[order.id] || {};
        const transitions = order.allowed_transitions || [];
        const selectedTransition = transitions.find((t) => t.to_status === current.to_status);
        const requiresReason = Boolean(selectedTransition?.requires_reason);
        return (
          <article className="admin-order-card" key={order.id}>
            <div className="admin-order-meta">
              <p>
                <strong>Order #{order.id}</strong>
              </p>
              <p>User: {order.user_email}</p>
              <p>Product: {order.product_name}</p>
              <p>Status: {order.status_label || order.status}</p>
              <p>ETA: {order.eta_days ? `${order.eta_days} day(s)` : "N/A"}</p>
            </div>

            <div className="admin-order-form">
              <select
                value={current.to_status || ""}
                onChange={(e) => setOrderChange(order.id, { to_status: e.target.value })}
              >
                <option value="">Select next status</option>
                {transitions.map((s) => (
                  <option key={s.to_status} value={s.to_status}>
                    {s.to_status_label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="ETA days"
                value={current.eta_days || ""}
                onChange={(e) => setOrderChange(order.id, { eta_days: e.target.value })}
              />
              <input
                placeholder="Delay reason"
                value={current.delay_reason || ""}
                onChange={(e) => setOrderChange(order.id, { delay_reason: e.target.value })}
                disabled={!requiresReason}
              />
              <button onClick={() => applyTransition(order.id)}>Update Status</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
