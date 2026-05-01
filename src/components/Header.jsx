import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Андрей | AI-автоматизация
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Главная
          </Link>
          <Link 
            to="/cases" 
            className={`nav-link ${location.pathname === '/cases' ? 'active' : ''}`}
          >
            Кейсы
          </Link>
          <Link 
            to="/services" 
            className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            Услуги
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            Обо мне
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link nav-link-cta ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Контакты
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
