import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form);
      if (user.role !== "admin") {
        setError("This account is not an admin account.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">amazon admin</div>
      <div className="auth-box">
        <h1>Admin Sign in</h1>
        <form onSubmit={submit} className="auth-stack">
          <label>
            Admin email
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </label>
          <button className="amazon-btn" type="submit">
            Sign in as Admin
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
        <p className="auth-note">
          Admin can manage products, approve/reject orders, and update delivery status with notifications.
        </p>
      </div>
      <div className="auth-divider">Not an admin?</div>
      <Link className="auth-secondary-btn" to="/login">
        Go to user sign in
      </Link>
    </div>
  );
}
