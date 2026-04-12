// ============================================================
//  إعداد Axios — كل الطلبات تمر من هنا
//  يضيف الـ Token تلقائياً مع كل طلب
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // يروح للـ Gateway عبر الـ Vite proxy
});

// قبل كل طلب — نضيفوا الـ Token تلقائياً
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// لو الرد 401 — نطردوا المستخدم للـ Login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;