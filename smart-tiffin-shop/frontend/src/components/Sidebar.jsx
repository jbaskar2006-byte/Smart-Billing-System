import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  CreditCard, 
  Receipt, 
  Lock, 
  LayoutDashboard, 
  Utensils, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ adminUser, onLogout, currentOrder }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  const isPaymentSuccess = currentOrder && (currentOrder.payment_status === 'SUCCESS' || currentOrder.payment_status === 'Completed');

  const customerLinks = [
    { to: '/', label: 'POS Billing Counter', icon: ShoppingCart },
    ...(isPaymentSuccess ? [{ to: '/bill', label: 'View / Print Bill', icon: Receipt }] : []),
    { to: '/admin/login', label: 'Admin Login Portal', icon: Lock },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Prices', icon: Utensils },
    { to: '/admin/reports?tab=daily', label: 'Daily Sales Report', icon: Calendar },
    { to: '/admin/reports?tab=monthly', label: 'Monthly Sales Report', icon: BarChart3 },
    { to: '/admin/reports?tab=yearly', label: 'Yearly Sales Report', icon: TrendingUp },
    { to: '/', label: 'POS Billing Counter', icon: ShoppingCart },
  ];

  return (
    <aside className="sidebar">
      {adminUser ? (
        <>
          <div className="sidebar-header-label" style={{ padding: '0 1.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>🔒 Admin Panel</span>
          </div>

          {adminLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <button
            onClick={handleLogoutClick}
            className="sidebar-link logout-link"
            style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', marginTop: '1.5rem', cursor: 'pointer', textAlign: 'left', fontWeight: 700 }}
          >
            <LogOut size={18} />
            <span>Logout ({adminUser.username || 'Admin'})</span>
          </button>
        </>
      ) : (
        <>
          <div className="sidebar-header-label" style={{ padding: '0 1.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customer Counter
          </div>

          {customerLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </>
      )}
    </aside>
  );
}
