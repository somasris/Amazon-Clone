import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import { myNotifications } from "../services/notificationService";
import { getCart } from "../services/cartService";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    myNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {});
    if (user.role === "user") {
      getCart()
        .then((res) => setCartCount(res.data.reduce((sum, i) => sum + Number(i.quantity || 0), 0)))
        .catch(() => setCartCount(0));
    }
  }, [user]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nav-wrap">
      <nav className="top-nav">
        <Link className="brand" to={user?.role === "admin" ? "/admin" : "/"}>
          Amazon
        </Link>
        <div className="nav-links">
          {user?.role !== "admin" ? <Link to="/">Home</Link> : null}
          {user?.role === "user" && <Link to="/cart">Cart ({cartCount})</Link>}
          {user?.role === "user" && <Link to="/orders">Orders</Link>}
          {user?.role === "admin" && <Link to="/admin">Dashboard</Link>}
          {user?.role === "admin" && <Link to="/admin/products">Products</Link>}
          {user?.role === "admin" && <Link to="/admin/orders">Orders</Link>}
          {!user ? <Link to="/login">Login</Link> : null}
          {!user ? <Link to="/admin/login">Admin</Link> : null}
          {!user ? <Link to="/signup">Signup</Link> : null}
          {user ? <button onClick={onLogout}>Logout</button> : null}
          {user ? <NotificationDropdown unread={unread} /> : null}
        </div>
      </nav>
      {user ? (
        <div className="sub-nav">
          <span>{user.name}</span>
          <span>Role: {user.role}</span>
          <span>Plan: {user.account_type}</span>
          <span>Location: {user.location || "N/A"}</span>
        </div>
      ) : null}
    </header>
  );
}
