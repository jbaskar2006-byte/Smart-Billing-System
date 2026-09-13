import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { getFoodImage, getRawFallbackImage } from '../utils/productImages';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search, AlertCircle, Save } from 'lucide-react';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Tiffin Specialties',
    available: true,
  });

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setErrorMsg('');
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'Tiffin Specialties',
      available: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product) => {
    setErrorMsg('');
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || 'Tiffin Specialties',
      available: product.available !== undefined ? product.available : true,
    });
    setShowModal(true);
  };

  // Validation & Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMsg('Price must be a valid number greater than ₹0.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: numericPrice,
      category: formData.category || 'Tiffin Specialties',
      available: formData.available,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccessMsg(`Successfully updated ${payload.name}!`);
      } else {
        await createProduct(payload);
        setSuccessMsg(`Successfully added ${payload.name} (₹${numericPrice.toFixed(2)})!`);
      }
      setShowModal(false);
      loadProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product.');
    }
  };

  // Toggle Availability (Mark Available <-> Mark Unavailable)
  const handleToggleAvailability = async (product) => {
    const newStatus = !product.available;
    try {
      await updateProduct(product.id, {
        name: product.name,
        price: product.price,
        category: product.category,
        available: newStatus,
      });
      loadProducts();
      setSuccessMsg(`${product.name} is now marked as ${newStatus ? 'AVAILABLE' : 'UNAVAILABLE (Out of Stock)'}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  // Delete product
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the food menu?`)) {
      try {
        await deleteProduct(id);
        loadProducts();
        setSuccessMsg(`Product "${name}" deleted successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>Admin Product Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Add new items, edit prices, toggle stock availability & sync with Billing POS</p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            padding: '0.7rem 1.25rem',
            background: '#f97316',
            color: 'white',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
          }}
        >
          <Plus size={18} /> + ADD PRODUCT
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Quick Add Product Card */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.75rem' }}>Quick Add Food Item</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) 120px 140px', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Product Name</label>
            <input
              type="text"
              placeholder="e.g. Dosai"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Price (₹)</label>
            <input
              type="number"
              step="0.50"
              placeholder="50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Category</label>
            <input
              type="text"
              placeholder="Tiffin Specialties"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Availability</label>
            <select
              value={formData.available ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: '0.6rem 1rem',
              background: '#f97316',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              height: '40px',
            }}
          >
            [ ADD PRODUCT ]
          </button>
        </form>
      </div>

      {/* Search Filter */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Filter food products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
        />
      </div>

      {/* Products List Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '0.85rem' }}>ID</th>
              <th style={{ padding: '0.85rem' }}>Food Item Name</th>
              <th style={{ padding: '0.85rem' }}>Category</th>
              <th style={{ padding: '0.85rem' }}>Price (₹)</th>
              <th style={{ padding: '0.85rem' }}>Availability Status</th>
              <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.85rem', fontWeight: 600, color: '#64748b' }}>#{item.id}</td>
                <td style={{ padding: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {getFoodImage(item.name) && (
                    <img
                      src={getFoodImage(item.name)}
                      alt={item.name}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                      onError={(e) => {
                        const fallback = getRawFallbackImage(item.name);
                        if (fallback && e.target.src !== fallback) {
                          e.target.src = fallback;
                        }
                      }}
                    />
                  )}
                  <span>{item.name}</span>
                </td>
                <td style={{ padding: '0.85rem', color: '#64748b' }}>{item.category || 'Tiffin Specialties'}</td>
                <td style={{ padding: '0.85rem', fontWeight: 800, color: '#f97316', fontSize: '1rem' }}>₹{Number(item.price).toFixed(2)}</td>
                <td style={{ padding: '0.85rem' }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: item.available ? '#d1fae5' : '#fee2e2',
                      color: item.available ? '#065f46' : '#991b1b',
                      border: `1px solid ${item.available ? '#a7f3d0' : '#fca5a5'}`,
                    }}
                  >
                    {item.available ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {item.available ? 'AVAILABLE' : 'UNAVAILABLE (Out of Stock)'}
                  </button>
                </td>
                <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    style={{ background: '#f1f5f9', color: '#3b82f6', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '6px', marginRight: '0.5rem', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <Edit2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Edit Price
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} style={{ verticalAlign: 'middle' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '420px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800, marginBottom: '1rem' }}>
              {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Food Product'}
            </h3>

            {errorMsg && (
              <div style={{ padding: '0.65rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Price (₹)</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="avail-chk-modal"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="avail-chk-modal" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                  Available for Customer Ordering
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.7rem', background: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '0.7rem', background: '#f97316', color: 'white', borderRadius: '8px', fontWeight: 800 }}>
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
