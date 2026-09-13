import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createOrder } from '../services/api';
import { getFoodImage } from '../utils/productImages';
import { Plus, Minus, Trash2, ArrowRight, ShoppingCart, RefreshCw, XCircle } from 'lucide-react';

const DEFAULT_ITEMS_WITH_EMOJIS = [
  { id: 1, name: 'Idli', emoji: '🍚', price: 30.00, available: true },
  { id: 2, name: 'Vadai', emoji: '🥙', price: 20.00, available: true },
  { id: 3, name: 'Poori', emoji: '🫓', price: 50.00, available: true },
  { id: 4, name: 'Chapati', emoji: '🫓', price: 40.00, available: true },
  { id: 5, name: 'Pongal', emoji: '🍛', price: 45.00, available: true },
  { id: 6, name: 'Omelette', emoji: '🍳', price: 25.00, available: true },
  { id: 7, name: 'Half Boil', emoji: '🥚', price: 20.00, available: true },
];

export default function BillingPage({ cart, setCart, setOrderDetails, setCurrentOrder }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState(DEFAULT_ITEMS_WITH_EMOJIS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const fetched = await getProducts();
      if (fetched && fetched.length > 0) {
        const mapped = fetched.map((p) => {
          let emoji = '🍛';
          const nameLower = p.name.toLowerCase();
          if (nameLower.includes('idli')) emoji = '🍚';
          else if (nameLower.includes('vadai') || nameLower.includes('vada')) emoji = '🥙';
          else if (nameLower.includes('poori') || nameLower.includes('puri')) emoji = '🫓';
          else if (nameLower.includes('chapati') || nameLower.includes('parotta') || nameLower.includes('dosa') || nameLower.includes('dosai')) emoji = '🫓';
          else if (nameLower.includes('pongal')) emoji = '🍛';
          else if (nameLower.includes('omelette')) emoji = '🍳';
          else if (nameLower.includes('boil') || nameLower.includes('egg')) emoji = '🥚';

          return {
            id: p.id,
            name: p.name,
            emoji: emoji,
            price: Number(p.price),
            available: p.available !== undefined ? p.available : true,
            category: p.category || 'Tiffin Specialties',
          };
        });
        setProducts(mapped);
      }
    } catch (e) {
      console.warn('Using fallback menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Add item to cart (only if available)
  const addToCart = (product) => {
    if (!product.available) return;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Increase & Decrease quantity
  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearOrder = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToPayment = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    const payload = {
      payment_method: 'UPI/QR',
      items: cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const orderRes = await createOrder(payload);
      const createdData = orderRes.data || orderRes;
      if (setCurrentOrder) setCurrentOrder(createdData);
      if (setOrderDetails) setOrderDetails({ items: cart, totalAmount: totalAmount });
      setSubmitting(false);
      navigate('/payment');
    } catch (err) {
      console.error('Error creating order:', err);
      setSubmitting(false);
      navigate('/payment');
    }
  };

  return (
    <div className="pos-container">
      {/* LEFT: Dynamic Food Cards Grid */}
      <div className="menu-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800 }}>Smart Billing Menu</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live food items from database. Unavailable items are disabled.</p>
          </div>
          <button
            onClick={loadMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}
          >
            <RefreshCw size={14} /> Refresh Menu
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading food products from database...</div>
        ) : (
          <div className="products-grid">
            {products.map((item) => {
              const isAvailable = item.available;
              const cartItem = cart.find((c) => c.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={item.id}
                  className={`large-food-card ${!isAvailable ? 'unavailable-card' : ''} ${qty > 0 ? 'selected-card' : ''}`}
                  style={{
                    opacity: isAvailable ? 1 : 0.6,
                    borderColor: qty > 0 ? '#ea580c' : isAvailable ? '#e2e8f0' : '#fca5a5',
                    background: qty > 0 ? '#fff7ed' : isAvailable ? '#ffffff' : '#fef2f2',
                    position: 'relative',
                  }}
                >
                  {/* Quantity Badge on Top Corner */}
                  {qty > 0 && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#ea580c', color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>
                      {qty} IN CART
                    </div>
                  )}

                  {getFoodImage(item.name) ? (
                    <div style={{ width: '100%', height: '115px', overflow: 'hidden', borderRadius: '10px', marginBottom: '0.5rem', background: '#f8fafc' }}>
                      <img
                        src={getFoodImage(item.name)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="food-emoji">{item.emoji}</div>
                  )}
                  <div className="food-details">
                    <div className="food-name">{item.name}</div>
                    <div className="food-price" style={{ color: isAvailable ? '#f97316' : '#94a3b8' }}>
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>

                  {isAvailable ? (
                    qty > 0 ? (
                      /* DIRECT + AND - QUANTITY CONTROLLER ON FOOD CARD */
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          marginTop: '0.4rem',
                          background: '#ffffff',
                          border: '2px solid #ea580c',
                          borderRadius: '10px',
                          padding: '0.2rem',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove one"
                        >
                          -
                        </button>

                        <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
                          {qty}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Add one more"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      /* ADD TO BILL BUTTON WHEN 0 IN CART */
                      <button
                        className="large-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        + ADD TO BILL
                      </button>
                    )
                  ) : (
                    <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                      <XCircle size={14} /> OUT OF STOCK
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: ORDER SUMMARY PANEL */}
      <div className="cart-panel">
        <div className="cart-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} color="#f97316" /> CURRENT ORDER
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{cart.length} item(s)</span>
          </div>

          {cart.length > 0 && (
            <button onClick={clearOrder} className="clear-order-btn">
              Clear Order
            </button>
          )}
        </div>

        {/* ORDER ITEMS LIST */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛒</div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#475569' }}>Order is Empty</p>
              <span style={{ fontSize: '0.85rem' }}>Select food items from the menu to build the bill</span>
            </div>
          ) : (
            cart.map((item) => {
              const subtotal = item.price * item.quantity;
              return (
                <div key={item.id} className="order-summary-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{item.emoji}</span> <span>{item.name}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Price: ₹{item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="qty-controls">
                    <button className="large-qty-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                    <span className="qty-number">{item.quantity}</span>
                    <button className="large-qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Subtotal</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      ₹{subtotal.toFixed(2)}
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="remove-item-btn" title="Remove item">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ORDER SUMMARY TOTAL */}
        <div className="cart-footer">
          <div className="total-breakdown">
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>TOTAL PAYABLE</span>
            <span className="grand-total-price">₹{totalAmount.toFixed(2)}</span>
          </div>

          <button
            className="large-proceed-btn"
            disabled={cart.length === 0 || submitting}
            onClick={handleProceedToPayment}
          >
            {submitting ? 'Creating Order...' : 'PROCEED TO PAYMENT'} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
