// ============================================================
//  RegisterPage — صفحة إنشاء حساب جديد
// ============================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>إنشاء حساب جديد</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text" name="name" placeholder="الاسم الكامل"
            value={form.name} onChange={handleChange} required
          />
          <input
            style={styles.input}
            type="email" name="email" placeholder="الإيميل"
            value={form.email} onChange={handleChange} required
          />
          <input
            style={styles.input}
            type="password" name="password" placeholder="كلمة المرور (6 أحرف على الأقل)"
            value={form.password} onChange={handleChange} required minLength={6}
          />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          عندك حساب؟{' '}
          <Link to="/login" style={{ color: '#e94560' }}>سجّل دخول</Link>
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