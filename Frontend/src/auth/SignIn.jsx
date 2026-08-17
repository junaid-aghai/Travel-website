import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const SignIn = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/signin', {
        email: formData.email,
        password: formData.password,
      }, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user || { email: formData.email }));
        if (onLoginSuccess) await onLoginSuccess();
        navigate('/');
      } else {
        setError(response.data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Unable to sign in. Please check your credentials or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container fade-up">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Link to="/">Travel<span>Kro</span></Link>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your travel bookings & wishlist</p>
        </div>

        {error && <div className="auth-error-alert"><i className="ri-error-warning-line"></i> {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="ri-mail-line"></i>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email!'); }} className="forgot-link">
                Forgot password?
              </a>
            </div>
            <div className="input-with-icon">
              <i className="ri-lock-line"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'} <i className="ri-arrow-right-line"></i>
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup" className="highlight-link">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
