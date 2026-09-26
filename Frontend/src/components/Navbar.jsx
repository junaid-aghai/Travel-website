import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ui/ThemeToggle';


const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user && user.role === 'admin';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setMobileOpen(false);
    navigate('/');
  };

  const getInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="logo">
          <Link to="/">Travel<span>Kro</span></Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          <ul>
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/destinations">Destinations</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/testimonials">Testimonials</NavLink></li>
            {isAdmin && <li><NavLink to="/admin">Admin</NavLink></li>}
          </ul>
        </div>

        {/* Right side: theme toggle + auth + hamburger */}
        <div className="nav-auth-buttons">
          <ThemeToggle />

          {user ? (
            <div className="user-profile-menu" ref={dropdownRef}>
              <button
                type="button"
                className={`user-profile-btn ${showDropdown ? 'active' : ''}`}
                onClick={() => setShowDropdown(prev => !prev)}
                aria-expanded={showDropdown}
                aria-haspopup="true"
                id="user-profile-menu-button"
              >
                <span className="user-avatar-circle">{getInitial()}</span>
                <span className="user-name-text">{user.name || user.email?.split('@')[0]}</span>
                <i className={`ri-arrow-${showDropdown ? 'up' : 'down'}-s-line profile-chevron`}></i>
              </button>
              {showDropdown && (
                <div className="user-dropdown-card" role="menu" aria-orientation="vertical">
                  <div className="user-dropdown-header">
                    <span className="user-avatar-circle large">{getInitial()}</span>
                    <div className="user-dropdown-user-info">
                      <p className="user-dropdown-name">{user.name || 'User'}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <div className="user-dropdown-items">
                    <Link to="/my-bookings" className="dropdown-item-link" onClick={() => setShowDropdown(false)} role="menuitem">
                      <i className="ri-ticket-2-line"></i>
                      <span>My Bookings</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item-link" onClick={() => setShowDropdown(false)} role="menuitem">
                        <i className="ri-dashboard-line"></i>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button type="button" className="dropdown-item-link dropdown-logout-btn" onClick={handleLogout} role="menuitem">
                      <i className="ri-logout-box-r-line"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="btn-secondary">Sign In</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <i className="ri-menu-3-line"></i>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="mobile-drawer-header">
          <h3>Travel<span>Kro</span></h3>
          <button
            className="mobile-drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <nav className="mobile-drawer-nav" aria-label="Mobile navigation">
          <NavLink to="/" end><i className="ri-home-4-line"></i> Home</NavLink>
          <NavLink to="/destinations"><i className="ri-map-pin-line"></i> Destinations</NavLink>
          <NavLink to="/about"><i className="ri-information-line"></i> About</NavLink>
          <NavLink to="/testimonials"><i className="ri-chat-quote-line"></i> Testimonials</NavLink>
          {user && <NavLink to="/my-bookings"><i className="ri-ticket-2-line"></i> My Bookings</NavLink>}
          {isAdmin && <NavLink to="/admin"><i className="ri-dashboard-line"></i> Admin Dashboard</NavLink>}
        </nav>

        <div className="mobile-drawer-footer">
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="user-avatar-circle" style={{ width: '36px', height: '36px', fontSize: '15px' }}>{getInitial()}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{user.name || 'User'}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="ri-logout-box-r-line"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</Link>
              <Link to="/signup" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;