import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const path = location.pathname;

  // Don't render inside admin pages
  if (path.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      key: 'home',
      label: isHi ? 'होम' : 'Home',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      path: '/',
      isActive: path === '/'
    },
    {
      key: 'about',
      label: isHi ? 'परिचय' : 'About',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      path: '/category/about',
      isActive: path.startsWith('/category/about') || path === '/about' || path === '/parichay'
    },
    {
      key: 'poems',
      label: isHi ? 'कविता' : 'Poems',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      path: '/category/poems',
      isActive: path.startsWith('/category/poems') || path.startsWith('/poem/') || path === '/kavya-sangrah'
    },
    {
      key: 'publications',
      label: isHi ? 'पुस्तकें' : 'Books',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      path: '/category/publications',
      isActive: path.startsWith('/category/publications') || path.startsWith('/publication/') || path === '/prakashan'
    },
    {
      key: 'contact',
      label: isHi ? 'संपर्क' : 'Contact',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      path: '/contact',
      isActive: path === '/contact' || path === '/sampark'
    }
  ];

  return (
    <nav className="phoenix-bottom-nav" aria-label="Mobile Navigation">
      <div className="phoenix-bottom-nav-container">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`phoenix-bottom-nav-item ${item.isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <span className="phoenix-bottom-nav-icon">{item.icon}</span>
            <span className="phoenix-bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
