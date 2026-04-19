import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <span className="font-bold text-lg tracking-wide">🛒 E-Commerce</span>

      <div className="flex items-center gap-4 text-sm">
        {token && (
          <>
            <Link to="/products" className="hover:text-red-400 transition">
              {t('navbar.products')}
            </Link>
            <Link to="/orders" className="hover:text-red-400 transition">
              {t('navbar.orders')}
            </Link>
            {user.role === 'admin' && (
              <Link to="/dashboard" className="hover:text-red-400 transition">
                {t('navbar.dashboard')}
              </Link>
            )}
            <button onClick={logout} className="hover:text-red-400 transition">
              {t('navbar.logout')}
            </button>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}