import { useState } from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h2>Travel<span>Kro</span></h2>
          <p>Your ultimate companion for discovering breathtaking destinations, booking luxurious getaways, and creating memories that last a lifetime.</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="ri-facebook-line"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="ri-instagram-line"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <i className="ri-twitter-x-line"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <i className="ri-youtube-line"></i>
            </a>
          </div>
        </div>

        <div className="footer-col links-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/destinations">All Destinations</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/testimonials">Traveler Reviews</Link></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h3>Contact Us</h3>
          <ul>
            <li><i className="ri-map-pin-line"></i> 123 Paradise Way, Suite 400</li>
            <li><i className="ri-phone-line"></i> +1 (800) 555-TRAVEL</li>
            <li><i className="ri-mail-line"></i> support@travelkro.com</li>
            <li><i className="ri-time-line"></i> Mon - Sun: 24/7 Support</li>
          </ul>
        </div>

        <div className="footer-col newsletter-col">
          <h3>Join Our Newsletter</h3>
          <p>Subscribe to receive exclusive travel discounts, secret destination guides & deals!</p>
          {subscribed ? (
            <div className="newsletter-success">🎉 Thank you for subscribing!</div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TravelKro. All Rights Reserved. Designed for memorable adventures.</p>
      </div>
    </footer>
  );
};

export default Footer;