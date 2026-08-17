import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Navbar = ({ user, setUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when route changes
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const getInitial = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className='logo'>
        <Link to="/">Travel<span>Kro</span></Link>
      </div>
      <div className='nav-links'>
        <ul>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
          </li>
          <li>
            <Link to="/destinations" className={location.pathname === '/destinations' ? 'active' : ''}>Destinations</Link>
          </li>
          <li>
            <Link to="/testimonials" className={location.pathname === '/testimonials' ? 'active' : ''}>Testimonials</Link>
          </li>
          {user && user.role === 'admin' && (
            <li>
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
            </li>
          )}
        </ul>
      </div>

      <div className="nav-auth-buttons">
        {user ? (
          <div className="user-profile-menu" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="user-profile-btn"
              aria-expanded={dropdownOpen}
              aria-label="User account menu"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '6px 14px 6px 6px',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                className="user-avatar-circle"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                }}
              >
                {getInitial()}
              </div>
              <span
                className="user-name-text"
                style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#0f172a'
                }}
              >
                {user.name || user.email?.split('@')[0]}
              </span>
              <i className={`ri-arrow-down-s-line ${dropdownOpen ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.2s ease' }}></i>
            </button>

            {dropdownOpen && (
              <div
                className="user-dropdown-card"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  padding: '8px 0',
                  minWidth: '180px',
                  zIndex: 100,
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{user.name || 'User'}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', wordBreak: 'break-all' }}>{user.email}</p>
                </div>
                <Link
                  to="/my-bookings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background 0.15s ease'
                  }}
                  className="dropdown-item-link"
                >
                  <i className="ri-ticket-2-line" style={{ color: '#0284c7', fontSize: '16px' }}></i> My Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="ri-logout-box-r-line"></i> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/signin" className="btn-secondary">Sign In</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;