import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const SignUp = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }


    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/signup', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      }, { withCredentials: true });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user || { name: formData.fullName, email: formData.email }));
        if (onLoginSuccess) await onLoginSuccess();
        navigate('/');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Unable to sign up right now. Please try again later.');
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
          <h2>Create Your Account</h2>
          <p>Join TravelKro to unlock exclusive deals and trip planning</p>
        </div>

        {error && <div className="auth-error-alert"><i className="ri-error-warning-line"></i> {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-with-icon">
              <i className="ri-user-line"></i>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="ri-lock-line"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <i className="ri-lock-check-line"></i>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'} <i className="ri-user-add-line"></i>
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/signin" className="highlight-link">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
