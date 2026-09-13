import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage({ setAdminUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminLogin(username, password);
      setAdminUser(res.user);
      setLoading(false);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '56px', height: '56px', background: '#ffedd5', color: '#f97316', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>5. Admin Portal Login</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Access shop dashboard, products & sales reports</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (admin)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (admin123)"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem',
              background: '#f97316',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            }}
          >
            {loading ? 'Authenticating...' : 'Login to Admin Dashboard'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
          <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#10b981' }} />
          Default Login: <strong>admin</strong> | Password: <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}
