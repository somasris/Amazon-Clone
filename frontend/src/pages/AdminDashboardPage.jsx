import React from "react";
import { Link } from "react-router-dom";

export default function AdminDashboardPage() {
  return (
    <div className="page">
      <h2>Admin Dashboard</h2>
      <p className="result-meta">Use the admin tools below to manage catalog and order lifecycle.</p>
      <div className="admin-dashboard-grid">
        <div className="admin-tile">
          <h3>Catalog Management</h3>
          <p>Add, edit, and remove products for the storefront.</p>
          <Link to="/admin/products">Go to Manage Products</Link>
        </div>
        <div className="admin-tile">
          <h3>Order Operations</h3>
          <p>Approve, reject, ship, delay, and update ETA for user orders.</p>
          <Link to="/admin/orders">Go to Manage Orders</Link>
        </div>
      </div>
    </div>
  );
}
