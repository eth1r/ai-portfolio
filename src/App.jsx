import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import Audit from './pages/Audit'
import Lab from './pages/Lab'
import ChatWidget from './components/ChatWidget'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:slug" element={<CaseDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/audit" element={<Audit />} />
            {/* Redirect /lab to /cases for compatibility */}
            <Route path="/lab" element={<Navigate to="/cases" replace />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
    </BrowserRouter>
  )
}

export default App
