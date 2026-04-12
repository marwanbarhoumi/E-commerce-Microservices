// ============================================================
//  ProductsPage — صفحة عرض المنتجات
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [cart,     setCart]     = useState([]); // سلة المشتريات

  // جلب المنتجات
  const fetchProducts = async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products${searchTerm ? `?search=${searchTerm}` : ''}`);
      setProducts(data.products);
    } catch (err) {
      setError('خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // إضافة للسلة
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === product._id);
      if (exists) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  // إنشاء طلبية
  const placeOrder = async () => {
    if (cart.length === 0) return alert('السلة فارغة!');
    try {
      await api.post('/orders', { items: cart });
      alert('✅ تم إنشاء الطلبية بنجاح!');
      setCart([]);
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في إنشاء الطلبية');
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={styles.page}>
      {/* البحث */}
      <div style={styles.searchBar}>
        <input
          style={styles.searchInput}
          placeholder="🔍 ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts(search)}
        />
        <button style={styles.searchBtn} onClick={() => fetchProducts(search)}>بحث</button>
      </div>

      <div style={styles.layout}>
        {/* قائمة المنتجات */}
        <div style={styles.productsSection}>
          <h2 style={styles.sectionTitle}>المنتجات</h2>
          {loading && <p>جاري التحميل...</p>}
          {error   && <p style={{ color: 'red' }}>{error}</p>}
          <div style={styles.grid}>
            {products.map((p) => (
              <div key={p._id} style={styles.card}>
                <h3 style={styles.productName}>{p.name}</h3>
                <p style={styles.productDesc}>{p.description}</p>
                <p style={styles.productPrice}>{p.price} د.ت</p>
                <p style={{ fontSize: '13px', color: '#888' }}>المخزون: {p.stock}</p>
                <button
                  style={styles.addBtn}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                >
                  {p.stock === 0 ? 'نفد المخزون' : '🛒 أضف للسلة'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* السلة */}
        <div style={styles.cart}>
          <h2 style={styles.sectionTitle}>🛒 السلة</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#999' }}>السلة فارغة</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.productId} style={styles.cartItem}>
                  <span>{item.name}</span>
                  <span>×{item.quantity}</span>
                  <span>{item.price * item.quantity} د.ت</span>
                </div>
              ))}
              <div style={styles.cartTotal}>الإجمالي: {total} د.ت</div>
              <button style={styles.orderBtn} onClick={placeOrder}>
                ✅ اطلب الآن
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  searchBar:     { display: 'flex', gap: '8px', marginBottom: '24px' },
  searchInput:   { flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' },
  searchBtn:     { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  layout:        { display: 'flex', gap: '24px' },
  productsSection: { flex: 1 },
  sectionTitle:  { marginBottom: '16px', color: '#1a1a2e' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card:          { background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  productName:   { margin: '0 0 8px', color: '#1a1a2e' },
  productDesc:   { fontSize: '13px', color: '#666', margin: '0 0 8px' },
  productPrice:  { fontSize: '18px', fontWeight: 'bold', color: '#e94560', margin: '0 0 8px' },
  addBtn:        { width: '100%', padding: '8px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cart:          { width: '280px', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', height: 'fit-content' },
  cartItem:      { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  cartTotal:     { fontWeight: 'bold', padding: '12px 0', fontSize: '16px' },
  orderBtn:      { width: '100%', padding: '12px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' },
};