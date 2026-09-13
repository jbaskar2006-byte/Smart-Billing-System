import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDailySalesReport, getMonthlySalesReport, getYearlySalesReport } from '../services/api';
import { BarChart3, Calendar, ShoppingBag, TrendingUp, Award, Layers, DollarSign, RefreshCw, ChevronLeft, ChevronRight, PieChart, Star, Activity } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SalesReportsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'daily';

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [activeTab, setActiveTab] = useState(initialTab); // 'daily' | 'monthly' | 'yearly'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['daily', 'monthly', 'yearly'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Daily report state
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dailyReport, setDailyReport] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Monthly report state
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Yearly report state
  const [yearlySelectedYear, setYearlySelectedYear] = useState(today.getFullYear());
  const [yearlyReport, setYearlyReport] = useState(null);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  // Fetch Daily Report
  const fetchDaily = async (date) => {
    setDailyLoading(true);
    const data = await getDailySalesReport(date);
    setDailyReport(data);
    setDailyLoading(false);
  };

  // Fetch Monthly Report
  const fetchMonthly = async (month, year) => {
    setMonthlyLoading(true);
    const data = await getMonthlySalesReport(month, year);
    setMonthlyReport(data);
    setMonthlyLoading(false);
  };

  // Fetch Yearly Report
  const fetchYearly = async (year) => {
    setYearlyLoading(true);
    const data = await getYearlySalesReport(year);
    setYearlyReport(data);
    setYearlyLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDaily(selectedDate);
    } else if (activeTab === 'monthly') {
      fetchMonthly(selectedMonth, selectedYear);
    } else if (activeTab === 'yearly') {
      fetchYearly(yearlySelectedYear);
    }
  }, [activeTab, selectedDate, selectedMonth, selectedYear, yearlySelectedYear]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Zero-based real data default (No fake mock numbers)
  const dData = dailyReport || {
    date: selectedDate,
    date_formatted: new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    total_orders: 0,
    total_sales: 0.00,
    total_items_sold: 0,
    avg_order_value: 0.00,
    top_selling_product: 'None',
    top_product_sold: 0,
    product_sales: [],
  };

  const mData = monthlyReport || {
    month: selectedMonth,
    year: selectedYear,
    month_formatted: `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
    total_orders: 0,
    total_sales: 0.00,
    total_items_sold: 0,
    avg_order_value: 0.00,
    best_selling_product: 'None',
    best_product_sold: 0,
    top_5_products: [],
    product_revenue_table: [],
    daily_sales_chart: [],
  };

  const yData = yearlyReport || {
    year: yearlySelectedYear,
    total_annual_sales: 0.00,
    total_orders: 0,
    total_items_sold: 0,
    best_selling_product: 'None',
    best_product_sold: 0,
    avg_monthly_sales: 0.00,
    month_wise_sales: MONTH_NAMES.map((name, idx) => ({ month: idx + 1, month_name: name, sales: 0, orders_count: 0 })),
    top_products: [],
    product_wise_sales: [],
  };

  const dailyProductSales = dData.product_sales || [];
  const dailyMaxQty = dailyProductSales.length > 0 ? Math.max(...dailyProductSales.map((p) => p.quantity_sold)) : 100;

  const monthlyProductSales = mData.product_revenue_table || [];
  const monthlyMaxQty = monthlyProductSales.length > 0 ? Math.max(...monthlyProductSales.map((p) => p.quantity_sold)) : 100;

  const dailyTimeline = mData.daily_sales_chart || [];
  const maxDailySales = dailyTimeline.length > 0 ? Math.max(...dailyTimeline.map((d) => d.sales)) : 5000;

  // Yearly data calculations
  const yearlyMonthlySales = yData.month_wise_sales || [];
  const maxYearlyMonthSales = yearlyMonthlySales.length > 0 ? Math.max(...yearlyMonthlySales.map((m) => m.sales)) : 60000;
  const maxYearlyMonthOrders = yearlyMonthlySales.length > 0 ? Math.max(...yearlyMonthlySales.map((m) => m.orders_count)) : 800;

  const yearlyProductSales = yData.product_wise_sales || [];
  const yearlyMaxProductQty = yearlyProductSales.length > 0 ? Math.max(...yearlyProductSales.map((p) => p.quantity_sold)) : 5000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* REPORT TYPE TAB SWITCHER & HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'daily' ? '#ea580c' : 'transparent',
              color: activeTab === 'daily' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'daily' ? '0 2px 4px rgba(234,88,12,0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Calendar size={16} /> Daily Sales
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'monthly' ? '#ea580c' : 'transparent',
              color: activeTab === 'monthly' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'monthly' ? '0 2px 4px rgba(234,88,12,0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BarChart3 size={16} /> Monthly Sales
          </button>

          <button
            onClick={() => setActiveTab('yearly')}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === 'yearly' ? '#ea580c' : 'transparent',
              color: activeTab === 'yearly' ? '#ffffff' : '#64748b',
              boxShadow: activeTab === 'yearly' ? '0 2px 4px rgba(234,88,12,0.3)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <TrendingUp size={16} /> Yearly Sales Report
          </button>
        </div>

        {/* CONTROLS (Date Picker for Daily / Month & Year for Monthly / Year for Yearly) */}
        {activeTab === 'daily' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '8px' }}>
              <Calendar size={18} color="#f97316" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Select Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              />
            </div>
            <button
              onClick={() => fetchDaily(selectedDate)}
              style={{ padding: '0.55rem 0.85rem', background: '#f1f5f9', color: '#334155', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
            >
              <RefreshCw size={14} className={dailyLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{ padding: '0.5rem 0.65rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={18} color="#0f172a" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              title="Next Month"
              style={{ padding: '0.5rem 0.65rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={18} color="#0f172a" />
            </button>

            <button
              onClick={() => fetchMonthly(selectedMonth, selectedYear)}
              style={{ padding: '0.55rem 0.85rem', background: '#ea580c', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', marginLeft: '0.25rem' }}
            >
              <RefreshCw size={14} className={monthlyLoading ? 'animate-spin' : ''} /> Update
            </button>
          </div>
        )}

        {activeTab === 'yearly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.45rem 0.85rem', borderRadius: '8px' }}>
              <Calendar size={18} color="#ea580c" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Select Year:</span>
              <select
                value={yearlySelectedYear}
                onChange={(e) => setYearlySelectedYear(Number(e.target.value))}
                style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: '0.95rem', outline: 'none', color: '#0f172a', cursor: 'pointer' }}
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchYearly(yearlySelectedYear)}
              style={{ padding: '0.55rem 0.85rem', background: '#ea580c', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
            >
              <RefreshCw size={14} className={yearlyLoading ? 'animate-spin' : ''} /> Refresh Year
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DAILY SALES REPORT                                                */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <>
          {/* Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DAILY SALES REPORT</span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{dData.date_formatted || dData.date}</h1>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
              Verified Success Payments Only
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Orders</span>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.35rem', borderRadius: '6px' }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{dData.total_orders}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Completed bills</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Sales</span>
                <div style={{ background: '#ffedd5', color: '#ea580c', padding: '0.35rem', borderRadius: '6px' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ea580c' }}>
                ₹{dData.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>PAID SUCCESSFULLY</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Items Sold</span>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.35rem', borderRadius: '6px' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{dData.total_items_sold}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tiffin plates & items</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Order Value</span>
                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.35rem', borderRadius: '6px' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4338ca' }}>
                ₹{dData.avg_order_value.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Per customer bill</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Top Selling Product</span>
                <div style={{ background: '#d1fae5', color: '#059669', padding: '0.35rem', borderRadius: '6px' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span>{dData.top_selling_product}</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>({dData.top_product_sold} Sold)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Most popular item of the day</span>
            </div>
          </div>

          {/* Table & Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                Product Breakdown Table
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.65rem' }}>Product Name</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Quantity Sold</th>
                    <th style={{ padding: '0.65rem', textAlign: 'right' }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyProductSales.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem', fontWeight: 700, color: '#0f172a' }}>{item.product_name}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                        {item.quantity_sold}
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>
                        ₹{item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BarChart3 size={18} color="#f97316" /> Daily Sales Distribution Chart
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dailyProductSales.map((item, idx) => {
                  const percentage = Math.round((item.quantity_sold / dailyMaxQty) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.product_name}</span>
                        <span style={{ fontWeight: 700, color: '#ea580c' }}>{item.quantity_sold} Sold (₹{item.revenue})</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #f97316, #ea580c)',
                            borderRadius: '6px',
                            transition: 'width 0.5s ease',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: MONTHLY SALES REPORT                                             */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MONTHLY SALES REPORT</span>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>{mData.month_formatted || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}</h1>
            </div>
            <div style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(234, 88, 12, 0.3)' }}>
              Full Month Summary
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Sales</span>
                <div style={{ background: '#ffedd5', color: '#ea580c', padding: '0.35rem', borderRadius: '6px' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ea580c' }}>
                ₹{mData.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>SUCCESS Payments Only</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Orders</span>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.35rem', borderRadius: '6px' }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{mData.total_orders}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified monthly bills</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Items Sold</span>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.35rem', borderRadius: '6px' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{mData.total_items_sold}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tiffin plates & beverages</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Order Value</span>
                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.35rem', borderRadius: '6px' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4338ca' }}>
                ₹{mData.avg_order_value.toFixed(2)}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg spend per order</span>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Best Selling Product</span>
                <div style={{ background: '#d1fae5', color: '#059669', padding: '0.35rem', borderRadius: '6px' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span>{mData.best_selling_product}</span>
                <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700 }}>({mData.best_product_sold} Sold)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Top item of the entire month</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} color="#f97316" /> 1. Daily Sales Timeline Chart ({mData.month_formatted})
            </h3>

            <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '180px', minWidth: '650px', padding: '1rem 0.5rem 0 0.5rem' }}>
                {dailyTimeline.map((item, idx) => {
                  const heightPercent = maxDailySales > 0 ? Math.max(10, Math.round((item.sales / maxDailySales) * 100)) : 10;
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        title={`Day ${item.day} (${item.date_str}): ₹${item.sales.toFixed(2)} (${item.orders_count} orders)`}
                        style={{
                          width: '100%',
                          maxWidth: '22px',
                          height: `${heightPercent}%`,
                          background: item.sales > 0 ? 'linear-gradient(180deg, #f97316, #ea580c)' : '#e2e8f0',
                          borderRadius: '4px 4px 0 0',
                          cursor: 'pointer',
                        }}
                      ></div>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', marginTop: '0.2rem' }}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={18} color="#eab308" /> Top 5 Selling Products
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(mData.top_5_products || []).map((prod, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: idx === 0 ? '#fff7ed' : '#f8fafc', borderRadius: '10px', border: idx === 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#ea580c' : idx === 1 ? '#475569' : idx === 2 ? '#d97706' : '#94a3b8', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{prod.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.quantity_sold} Units Sold</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#ea580c', fontSize: '0.95rem' }}>₹{prod.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PieChart size={18} color="#f97316" /> Product-Wise Sales Chart
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {monthlyProductSales.map((item, idx) => {
                  const percentage = Math.round((item.quantity_sold / monthlyMaxQty) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.product_name}</span>
                        <span style={{ fontWeight: 700, color: '#ea580c' }}>{item.quantity_sold} Sold (₹{item.revenue.toFixed(2)})</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #ea580c, #f97316)',
                            borderRadius: '6px',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              Product Revenue Table
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product Name</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Quantity Sold</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyProductSales.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{item.product_name}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                        {item.quantity_sold}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>
                        ₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: YEARLY SALES REPORT (Prompt 10 Requirements)                      */}
      {/* ========================================================================= */}
      {activeTab === 'yearly' && (
        <>
          {/* Annual Banner */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ANNUAL PERFORMANCE</span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>YEARLY SALES REPORT — {yData.year}</h1>
            </div>
            <div style={{ background: 'rgba(234, 88, 12, 0.25)', color: '#fb923c', padding: '0.65rem 1.25rem', borderRadius: '24px', fontSize: '0.9rem', fontWeight: 800, border: '1px solid rgba(234, 88, 12, 0.4)' }}>
              12 Months Consolidated Data
            </div>
          </div>

          {/* 5 KPI METRICS GRID (Prompt 10 Requirements) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            {/* 1. Total Annual Sales */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Annual Sales</span>
                <div style={{ background: '#ffedd5', color: '#ea580c', padding: '0.35rem', borderRadius: '6px' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c' }}>
                ₹{yData.total_annual_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>SUCCESS Payments Only</span>
            </div>

            {/* 2. Total Orders */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Orders</span>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '0.35rem', borderRadius: '6px' }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{yData.total_orders.toLocaleString()}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified bills created</span>
            </div>

            {/* 3. Total Items Sold */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Items Sold</span>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.35rem', borderRadius: '6px' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{yData.total_items_sold.toLocaleString()}</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Annual tiffin plates sold</span>
            </div>

            {/* 4. Average Monthly Sales */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Monthly Sales</span>
                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.35rem', borderRadius: '6px' }}>
                  <Activity size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4338ca' }}>
                ₹{yData.avg_monthly_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Per month revenue</span>
            </div>

            {/* 5. Best Selling Product */}
            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Best Selling Product</span>
                <div style={{ background: '#d1fae5', color: '#059669', padding: '0.35rem', borderRadius: '6px' }}>
                  <Award size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span>{yData.best_selling_product}</span>
                <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 700 }}>({yData.best_product_sold.toLocaleString()} Sold)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Top item for full year {yData.year}</span>
            </div>

          </div>

          {/* TWO COLUMN SECTION FOR MONTHLY CHARTS (1. Month-Wise Sales Chart & 2. Month-Wise Orders Chart) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            
            {/* 1. MONTH-WISE SALES CHART (January to December) */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarChart3 size={18} color="#ea580c" /> 1. Month-Wise Sales Chart
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c' }}>Revenue (₹)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {yearlyMonthlySales.map((m, idx) => {
                  const pct = maxYearlyMonthSales > 0 ? Math.round((m.sales / maxYearlyMonthSales) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{m.month_name}</span>
                        <span style={{ fontWeight: 800, color: '#ea580c' }}>₹{m.sales.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                      </div>
                      <div style={{ height: '9px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #f97316, #ea580c)',
                            borderRadius: '6px',
                            transition: 'width 0.4s ease',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. MONTH-WISE ORDERS CHART */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={18} color="#2563eb" /> 2. Month-Wise Orders Chart
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>Order Count</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {yearlyMonthlySales.map((m, idx) => {
                  const pct = maxYearlyMonthOrders > 0 ? Math.round((m.orders_count / maxYearlyMonthOrders) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{m.month_name}</span>
                        <span style={{ fontWeight: 800, color: '#2563eb' }}>{m.orders_count} Orders</span>
                      </div>
                      <div style={{ height: '9px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                            borderRadius: '6px',
                            transition: 'width 0.4s ease',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* TWO COLUMN GRID: 3. Top Selling Products Leaderboard & 4. Product-Wise Yearly Sales Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            
            {/* 4. TOP SELLING PRODUCTS LEADERBOARD */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={18} color="#eab308" /> 4. Top Selling Products ({yData.year})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(yData.top_products || []).map((prod, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: idx === 0 ? '#fff7ed' : '#f8fafc', borderRadius: '10px', border: idx === 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? '#ea580c' : idx === 1 ? '#475569' : idx === 2 ? '#d97706' : '#94a3b8', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{prod.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.quantity_sold.toLocaleString()} Units Sold</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#ea580c', fontSize: '0.95rem' }}>₹{prod.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PRODUCT-WISE YEARLY SALES CHART */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PieChart size={18} color="#f97316" /> 3. Product-Wise Yearly Sales
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {yearlyProductSales.map((item, idx) => {
                  const percentage = Math.round((item.quantity_sold / yearlyMaxProductQty) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.product_name}</span>
                        <span style={{ fontWeight: 700, color: '#ea580c' }}>{item.quantity_sold.toLocaleString()} Sold (₹{item.revenue.toLocaleString('en-IN')})</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #059669, #10b981)',
                            borderRadius: '6px',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 5. TOTAL YEARLY REVENUE BREAKDOWN TABLE (January - December) */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                5. Total Yearly Revenue Breakdown Table ({yData.year})
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>
                Annual Total: ₹{yData.total_annual_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Month</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Total Verified Orders</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyMonthlySales.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{m.month_name}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                        {m.orders_count}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>
                        ₹{m.sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
