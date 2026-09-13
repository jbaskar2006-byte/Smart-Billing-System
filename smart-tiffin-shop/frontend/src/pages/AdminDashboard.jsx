import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, resetSystemData } from '../services/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  Award, 
  Clock, 
  BarChart3, 
  RefreshCw, 
  CheckCircle2, 
  PlusCircle, 
  Utensils, 
  ArrowRight,
  Sparkles,
  PieChart,
  Activity,
  RotateCcw
} from 'lucide-react';


export default function AdminDashboard({ adminUser, setCurrentOrder }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  };

  const handleViewBill = (order) => {
    const formattedOrder = {
      id: order.id || 101,
      order_number: order.order_number,
      total_amount: order.amount,
      payment_status: 'SUCCESS',
      order_status: 'Completed',
      created_at: new Date().toISOString(),
      items: [
        { product_name: order.items || 'Tiffin Specialties', price: order.amount, quantity: 1, subtotal: order.amount }
      ]
    };
    if (setCurrentOrder) setCurrentOrder(formattedOrder);
    navigate('/bill');
  };

  const handleResetDataToZero = async () => {
    if (window.confirm('Are you sure you want to reset all order history, bills, and sales metrics to 0?\n\n(Food menu items & prices will remain intact)')) {
      try {
        const res = await resetSystemData();
        localStorage.removeItem('tiffin_cart');
        localStorage.removeItem('tiffin_currentOrder');
        if (setCurrentOrder) setCurrentOrder(null);
        alert(res.message || 'All data reset to 0 successfully!');
        fetchStats();
      } catch (err) {
        alert('Failed to reset data');
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);


  // Zero-based default data (No fake mock numbers)
  const d = stats || {
    today_sales: 0.00,
    today_orders: 0,
    monthly_sales: 0.00,
    yearly_sales: 0.00,
    top_selling_item: 'None',
    recent_orders: [],
    hourly_sales: [],
    last_7_days_sales: [],
    monthly_sales_overview: [],
    top_food_items: [],
  };

  const maxHourlyVal = Math.max(...(d.hourly_sales || []).map((x) => x.value), 1);
  const max7DaysVal = Math.max(...(d.last_7_days_sales || []).map((x) => x.value), 1);
  const maxMonthlyVal = Math.max(...(d.monthly_sales_overview || []).map((x) => x.value), 1);
  const maxFoodCount = Math.max(...(d.top_food_items || []).map((x) => x.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* HEADER BANNER & SHOP OWNER GREETING */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} color="#f97316" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              SMART TIFFIN SHOP
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            ADMIN DASHBOARD
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Real-time business performance & verified QR billing summary
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '0.65rem 1.1rem', background: '#ea580c', color: '#ffffff', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(234,88,12,0.4)' }}
          >
            <PlusCircle size={16} /> Open Billing Counter
          </button>

          <button
            onClick={fetchStats}
            style={{ padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            onClick={handleResetDataToZero}
            title="Reset all orders, bills, and sales counters to 0 across the website"
            style={{ padding: '0.65rem 1rem', background: '#dc2626', color: '#ffffff', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(220,38,38,0.4)' }}
          >
            <RotateCcw size={15} /> RESET DATA TO 0
          </button>
        </div>
      </div>


      {/* QUICK NAVIGATION SHORTCUT BAR */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { label: 'Billing Counter', path: '/', icon: PlusCircle, color: '#ea580c' },
          { label: 'Manage Products', path: '/admin/products', icon: Utensils, color: '#0f172a' },
          { label: 'Daily Sales Report', path: '/admin/reports?tab=daily', icon: Calendar, color: '#2563eb' },
          { label: 'Monthly Sales Report', path: '/admin/reports?tab=monthly', icon: BarChart3, color: '#d97706' },
          { label: 'Yearly Sales Report', path: '/admin/reports?tab=yearly', icon: TrendingUp, color: '#059669' },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                padding: '0.55rem 0.95rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.825rem',
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComp size={15} color={item.color} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5 MAIN DASHBOARD CARDS (Prompt 11 Requirements) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: TODAY'S SALES */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TODAY'S SALES
            </span>
            <div style={{ background: '#ffedd5', color: '#ea580c', padding: '0.4rem', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ea580c' }}>
            ₹{d.today_sales.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <CheckCircle2 size={13} /> Real MySQL verified revenue
          </div>
        </div>

        {/* Card 2: TODAY'S ORDERS */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TODAY'S ORDERS
            </span>
            <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.4rem', borderRadius: '8px' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a' }}>
            {d.today_orders}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.35rem' }}>
            Completed customer bills
          </div>
        </div>

        {/* Card 3: MONTHLY SALES */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              MONTHLY SALES
            </span>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.4rem', borderRadius: '8px' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#d97706' }}>
            ₹{d.monthly_sales.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.35rem' }}>
            Current month revenue
          </div>
        </div>

        {/* Card 4: YEARLY SALES */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              YEARLY SALES
            </span>
            <div style={{ background: '#d1fae5', color: '#059669', padding: '0.4rem', borderRadius: '8px' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#059669' }}>
            ₹{d.yearly_sales.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '0.35rem' }}>
            Annual cumulative total
          </div>
        </div>

        {/* Card 5: TOP SELLING ITEM */}
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TOP SELLING ITEM
            </span>
            <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.4rem', borderRadius: '8px' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4338ca', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span>{d.top_selling_item}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>(Most Popular)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '0.35rem' }}>
            Customer favorite tiffin item
          </div>
        </div>

      </div>

      {/* 4 DASHBOARD CHARTS GRID (Prompt 11 Requirements) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* CHART 1: TODAY HOURLY SALES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={17} color="#ea580c" /> 1. Today Hourly Sales
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c' }}>Hourly Distribution</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', height: '140px', padding: '0.5rem 0' }}>
            {(d.hourly_sales || []).map((h, idx) => {
              const heightPct = Math.max(12, Math.round((h.value / maxHourlyVal) * 100));
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${h.label}: ₹${h.value} (${h.count} orders)`}
                    style={{
                      width: '100%',
                      maxWidth: '30px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #f97316, #ea580c)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  ></div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: LAST 7 DAYS SALES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={17} color="#2563eb" /> 2. Last 7 Days Sales
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>7-Day Trend</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '140px', padding: '0.5rem 0' }}>
            {(d.last_7_days_sales || []).map((day, idx) => {
              const heightPct = Math.max(12, Math.round((day.value / max7DaysVal) * 100));
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`${day.label}: ₹${day.value} (${day.count} orders)`}
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  ></div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 3: MONTHLY SALES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 size={17} color="#d97706" /> 3. Monthly Sales
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>Annual Overview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '140px', padding: '0.5rem 0', overflowX: 'auto' }}>
            {(d.monthly_sales_overview || []).map((m, idx) => {
              const heightPct = Math.max(12, Math.round((m.value / maxMonthlyVal) * 100));
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end', minWidth: '22px' }}>
                  <div
                    title={`${m.label}: ₹${m.value.toLocaleString()}`}
                    style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  ></div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: TOP FOOD ITEMS */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PieChart size={17} color="#059669" /> 4. Top Food Items
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>Quantity Sold</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {(d.top_food_items || []).map((item, idx) => {
              const pct = Math.round((item.count / maxFoodCount) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>{item.count} Sold (₹{item.value})</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        borderRadius: '4px',
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RECENT ORDERS TABLE (Prompt 11 Requirements) */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              RECENT ORDERS
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest transactions & verified payments</p>
          </div>
          <button
            onClick={() => navigate('/admin/reports?tab=daily')}
            style={{ padding: '0.45rem 0.85rem', background: '#f8fafc', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            View All Reports <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Order Number</th>
                <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Payment Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Time</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {d.recent_orders && d.recent_orders.length > 0 ? (
                d.recent_orders.map((order, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                      {order.order_number}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#334155', fontWeight: 600 }}>
                      {order.items}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, color: '#ea580c' }}>
                      ₹{order.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> {order.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                      {order.time}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewBill(order)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: '#0f172a',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: 600 }}>
                    No customer orders placed yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
