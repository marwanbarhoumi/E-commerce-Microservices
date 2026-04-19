import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

export default function LoginPage() {
  const { t } = useTranslation();
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));

      // redirect selon role
      if (data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {t('login.title')}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm text-center rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            type="email" name="email"
            placeholder={t('login.email')}
            value={form.email} onChange={handleChange} required
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            type="password" name="password"
            placeholder={t('login.password')}
            value={form.password} onChange={handleChange} required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-red-500 hover:underline">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}