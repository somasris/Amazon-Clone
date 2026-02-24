import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      if (user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">amazon</div>
      <div className="auth-box">
        <h1>Sign in</h1>
        <form onSubmit={submit} className="auth-stack">
          <label>
            Email
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
            Sign in
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
        <p className="auth-note">By continuing, you agree to Amazon Clone Conditions of Use and Privacy Notice.</p>
      </div>
      <div className="auth-divider">New to Amazon?</div>
      <Link className="auth-secondary-btn" to="/signup">
        Create your Amazon account
      </Link>
    </div>
  );
}
