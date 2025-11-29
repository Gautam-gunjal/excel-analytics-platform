import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import "./Stylesheets/App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="app">
      {/* Topbar */}
      <header className="topbar">
        {/* Logo now links to landing page "/" */}
        <Link to="/" className="logo">ExcelAnalytics</Link>

        <nav className="nav">
          {/* Home: when logged in -> /dashboard, when not logged in -> /register */}
          {user ? (
            <Link to="/dashboard" className="nav-link">Home</Link>
          ) : (
            <Link to="/register" className="nav-link">Home</Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <>
              <span className="nav-user">Hi, {user.name || user.email}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              {/* 🔴 Logout moved to the end */}
              <button onClick={logout} className="nav-btn">Logout</button>
            </>
          )}
        </nav>
      </header>

      {/* Main Routes */}
      <main className="main">
        <Routes>
          {/* ✅ Landing page is the default "/" */}
          <Route path="/" element={<LandingPage />} /> 
          
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin"
            element={
              user?.role === 'admin'
                ? <AdminDashboard />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
