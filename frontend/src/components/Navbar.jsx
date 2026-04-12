// ============================================================
//  Navbar — شريط التنقل العلوي
// ============================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem('user') || 'null');
  const isLogged  = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const styles = {
    nav: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', background: '#1a1a2e', color: '#fff',
    },
    logo: { fontSize: '20px', fontWeight: 'bold', color: '#e94560', textDecoration: 'none' },
    links: { display: 'flex', gap: '16px', alignItems: 'center' },
    link:  { color: '#fff', textDecoration: 'none', fontSize: '15px' },
    btn:   {
      background: '#e94560', color: '#fff', border: 'none',
      padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
    },
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🛍️ متجري</Link>
      <div style={styles.links}>
        {isLogged ? (
          <>
            <Link to="/products" style={styles.link}>المنتجات</Link>
            <Link to="/orders"   style={styles.link}>طلبياتي</Link>
            <span style={{ fontSize: '14px', opacity: 0.7 }}>
              أهلاً {user?.name}
            </span>
            <button onClick={logout} style={styles.btn}>خروج</button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>دخول</Link>
            <Link to="/register" style={styles.link}>تسجيل</Link>
          </>
        )}
      </div>
    </nav>
  );
}