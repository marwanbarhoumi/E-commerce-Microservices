// ============================================================
//  OrdersPage — صفحة طلبياتي
// ============================================================

import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const statusColors = {
  pending:   { bg: '#fff8e1', color: '#f59e0b', label: '⏳ في الانتظار' },
  confirmed: { bg: '#e8f5e9', color: '#22c55e', label: '✅ مؤكدة' },
  shipped:   { bg: '#e3f2fd', color: '#3b82f6', label: '🚚 في الشحن' },
  delivered: { bg: '#f3e8ff', color: '#a855f7', label: '🎉 تم التوصيل' },
  cancelled: { bg: '#fef2f2', color: '#ef4444', label: '❌ ملغية' },
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch (err) {
        setError('خطأ في جلب الطلبيات');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // إلغاء طلبية
  const cancelOrder = async (id) => {
    if (!confirm('هل تريد إلغاء هذه الطلبية؟')) return;
    try {
      await api.patch(`/orders/${id}/cancel`);
      setOrders((prev) =>
        prev.map((o) => o._id === id ? { ...o, status: 'cancelled' } : o)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'لا يمكن إلغاء هذه الطلبية');
    }
  };

  if (loading) return <p style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</p>;
  if (error)   return <p style={{ padding: '40px', color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>طلبياتي ({orders.length})</h2>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <p>ما عندكش طلبيات بعد</p>
          <a href="/products" style={styles.shopLink}>🛍️ ابدأ التسوق</a>
        </div>
      ) : (
        orders.map((order) => {
          const s = statusColors[order.status] || statusColors.pending;
          return (
            <div key={order._id} style={styles.card}>
              {/* رأس الطلبية */}
              <div style={styles.cardHeader}>
                <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                  {s.label}
                </span>
                <span style={styles.date}>
                  {new Date(order.createdAt).toLocaleDateString('ar-TN')}
                </span>
              </div>

              {/* المنتجات */}
              <div style={styles.items}>
                {order.items.map((item, i) => (
                  <div key={i} style={styles.item}>
                    <span>{item.name}</span>
                    <span>×{item.quantity}</span>
                    <span>{item.price * item.quantity} د.ت</span>
                  </div>
                ))}
              </div>

              {/* الإجمالي */}
              <div style={styles.footer}>
                <span style={styles.total}>الإجمالي: {order.total} د.ت</span>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button style={styles.cancelBtn} onClick={() => cancelOrder(order._id)}>
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const styles = {
  page:      { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  title:     { marginBottom: '24px', color: '#1a1a2e' },
  empty:     { textAlign: 'center', padding: '60px', color: '#999' },
  shopLink:  { color: '#e94560', textDecoration: 'none', fontSize: '18px' },
  card:      { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  orderId:   { fontWeight: 'bold', color: '#1a1a2e', fontFamily: 'monospace' },
  badge:     { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  date:      { fontSize: '13px', color: '#999' },
  items:     { borderTop: '1px solid #f0f0f0', paddingTop: '12px' },
  item:      { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#444' },
  footer:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: '12px' },
  total:     { fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e' },
  cancelBtn: { padding: '6px 16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' },
};