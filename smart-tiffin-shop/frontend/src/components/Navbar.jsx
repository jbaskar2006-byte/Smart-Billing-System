import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConnectionBadge from './ConnectionBadge';
import { UtensilsCrossed, UserCheck, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar({ adminUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  return (
    <nav className="navbar">
      <div className="brand-section">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-logo">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <div className="brand-name">SRI LAKSHMI TIFFIN CENTER</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Billing & QR Payment System</div>
          </div>
        </Link>
        <span className="brand-tag">POS v1.0</span>
      </div>

      <div className="nav-actions">
        <ConnectionBadge />

        {adminUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> Admin: {adminUser.username || 'LoggedIn'}
            </div>

            <Link to="/admin/dashboard" className="cat-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', background: '#0f172a', color: '#ffffff' }}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>

            <button
              onClick={handleLogoutClick}
              style={{ padding: '0.45rem 0.8rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fca5a5', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/admin/login" className="cat-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
            <UserCheck size={16} />
            Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
}
