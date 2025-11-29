import React, { useState, useEffect } from 'react';
import { login } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import "../Stylesheets/Login_Register.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      onLogin && onLogin(res.user);

      // ✅ Navigate to dashboard (not landing page)
      nav('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  // 👇 Auto-hide error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>

        {/* 👇 Error Message */}
        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}
        
        <form onSubmit={submit}>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="btn">Login</button>
        </form>

        {/* 👇 Register option */}
        <p className="auth-switch">
          Don’t have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
