import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n/index.js';
import App from './App';
import './index.css';

// ← zid hedha
document.documentElement.dir = localStorage.getItem('lang') === 'ar' ? 'rtl' : 'ltr';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);