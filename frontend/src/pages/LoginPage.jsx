// ============================================================
//  LoginPage — صفحة تسجيل الدخول
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      // نحفظوا الـ Token والمستخدم في localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>تسجيل الدخول</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email" name="email" placeholder="الإيميل"
            value={form.email} onChange={handleChange} required
          />
          <input
            style={styles.input}
            type="password" name="password" placeholder="كلمة المرور"
            value={form.password} onChange={handleChange} required
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          ما عندكش حساب؟{' '}
          <Link to="/register" style={{ color: '#e94560' }}>سجّل الآن</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:  { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: '#f5f5f5' },
  card:  { background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
  input: { display: 'block', width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  btn:   { width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { background: '#fff0f0', color: '#e94560', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' },
};