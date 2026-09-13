import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BillingPage from './pages/BillingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import BillPage from './pages/BillPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagementPage from './pages/ProductManagementPage';
import SalesReportsPage from './pages/SalesReportsPage';
import './App.css';

// Protected Route Wrapper Component
const ProtectedRoute = ({ adminUser, children }) => {
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default function App() {
  const [cart, setCartState] = useState(() => {
    const saved = localStorage.getItem('tiffin_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const setCart = (action) => {
    if (typeof action === 'function') {
      setCartState((prev) => {
        const next = action(prev);
        localStorage.setItem('tiffin_cart', JSON.stringify(next));
        return next;
      });
    } else {
      setCartState(action);
      localStorage.setItem('tiffin_cart', JSON.stringify(action));
    }
  };

  const [orderDetails, setOrderDetails] = useState(null);

  const [currentOrder, setCurrentOrderState] = useState(() => {
    const saved = localStorage.getItem('tiffin_currentOrder');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const setCurrentOrder = (action) => {
    if (typeof action === 'function') {
      setCurrentOrderState((prev) => {
        const next = action(prev);
        if (next) localStorage.setItem('tiffin_currentOrder', JSON.stringify(next));
        else localStorage.removeItem('tiffin_currentOrder');
        return next;
      });
    } else {
      setCurrentOrderState(action);
      if (action) localStorage.setItem('tiffin_currentOrder', JSON.stringify(action));
      else localStorage.removeItem('tiffin_currentOrder');
    }
  };
  
  // Persistent admin user session from localStorage
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleSetAdminUser = (user) => {
    setAdminUser(user);
    if (user) {
      localStorage.setItem('adminUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('adminUser');
    }
  };


  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar adminUser={adminUser} onLogout={handleLogout} />
        <div className="main-content">
          <Sidebar adminUser={adminUser} onLogout={handleLogout} currentOrder={currentOrder} />
          <main className="page-container">
            <Routes>
              {/* PUBLIC CUSTOMER ROUTES (NO LOGIN REQUIRED) */}
              <Route
                path="/"
                element={<BillingPage cart={cart} setCart={setCart} setOrderDetails={setOrderDetails} setCurrentOrder={setCurrentOrder} />}
              />
              <Route
                path="/payment"
                element={<PaymentPage orderDetails={orderDetails} currentOrder={currentOrder} setCurrentOrder={setCurrentOrder} setCart={setCart} />}
              />
              <Route
                path="/payment-success"
                element={<PaymentSuccessPage currentOrder={currentOrder} setCurrentOrder={setCurrentOrder} setCart={setCart} />}
              />
              <Route
                path="/bill"
                element={<BillPage currentOrder={currentOrder} setCurrentOrder={setCurrentOrder} setCart={setCart} />}
              />
              <Route
                path="/admin/login"
                element={<AdminLoginPage setAdminUser={handleSetAdminUser} />}
              />

              {/* PROTECTED ADMIN ROUTES (LOGIN REQUIRED) */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminUser={adminUser}>
                    <AdminDashboard adminUser={adminUser} setCurrentOrder={setCurrentOrder} onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminUser={adminUser}>
                    <ProductManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute adminUser={adminUser}>
                    <SalesReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* FALLBACK REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
