import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-dark-border shadow-card py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-gold-gradient flex items-center justify-center shadow-gold">
            <span className="text-black font-bold text-sm">JB</span>
          </div>
          <span className="font-display font-semibold text-lg tracking-wide">
            <span className="text-white">JB </span>
            <span className="text-gold">Crownstone</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'text-gold' : ''}`}>
            Home
          </Link>
          <a href="#properties" className="nav-link">
            Properties
          </a>
          <a href="#about" className="nav-link">
            About
          </a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="btn-outline-gold text-xs py-2 px-5">
            Client Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          id="mobile-menu-btn"
          className="md:hidden text-gray-400 hover:text-gold transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-dark-border px-6 py-4 space-y-4">
          <Link to="/" className="block nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#properties" className="block nav-link" onClick={() => setMenuOpen(false)}>Properties</a>
          <Link to="/login" className="block nav-link text-gold" onClick={() => setMenuOpen(false)}>Client Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
