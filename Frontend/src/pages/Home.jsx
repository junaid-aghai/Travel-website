import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DestinationCard from '../components/DestinationCard';
import { DestinationCardSkeleton } from '../components/ui/Skeleton';


const Home = () => {
  const [topDestinations, setTopDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(0);
  const [reviewAnimation, setReviewAnimation] = useState('fade-in');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTopDestinations = async () => {
      try {
        const res = await api.get('/topdest');
        setTopDestinations(res.data.destination || []);
      } catch (err) {
        console.error('Error fetching top destinations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDestinations();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews');
        if (res.data.reviews && res.data.reviews.length > 0) {
          setReviews(res.data.reviews.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Auto-rotate testimonial carousel
  useEffect(() => {
    if (reviews.length < 2) return;
    const timer = setInterval(() => {
      setReviewAnimation('fade-out');
      setTimeout(() => {
        setCurrentReview(prev => (prev + 1) % reviews.length);
        setReviewAnimation('fade-in');
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/destinations?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i key={i} className={i < rating ? 'ri-star-fill' : 'ri-star-line'}></i>
      );
    }
    return stars;
  };

  return (
    <div className="home fade-up">
      {/* Hero Section */}
      <div className="home-content">
        <img
          className="home-image"
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1800&q=80"
          alt="Tropical beach paradise with crystal clear water"
        />
        <div className="home-text">
          <p className="home-discover"><i className="ri-compass-3-line"></i> Discover Your Next Adventure</p>
          <h1>Explore the World's Most<br />Breathtaking Destinations</h1>
          <p className="home-description">Curated travel experiences designed to create unforgettable memories. From sun-kissed beaches to ancient temples, your perfect getaway awaits.</p>
          <form className="home-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search destinations"
            />
            <button type="submit" className="btn-primary">
              <i className="ri-search-line"></i> Explore
            </button>
          </form>
        </div>
      </div>

      {/* Top Destinations Section */}
      <section id="destinations">
        <div className="destinations-content">
          <h1>Top <span className="highlight">Destinations</span></h1>
          <p>Explore our most popular destinations handpicked for unforgettable experiences.</p>
        </div>
        <div className="destinations-grid">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <DestinationCardSkeleton key={i} />)
            : topDestinations.slice(0, 3).map(dest => (
                <DestinationCard key={dest._id || dest.location} destination={dest} />
              ))
          }
        </div>
        <div className="destinations-btn">
          <Link to="/destinations" className="btn-primary">
            Explore All Destinations <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <div className="about-wrapper">
          <div className="about-content">
            <h1>Your Trusted Travel Partner Since <span className="highlight">2020</span></h1>
            <p className="para">At TravelKro, we believe that travel transforms lives. Our expert team curates extraordinary journeys that combine adventure, culture, and relaxation for an experience you'll cherish forever.</p>
            <div className="about-stats-grid">
              <div className="stat-box">
                <h2>50+</h2>
                <p>Destinations</p>
              </div>
              <div className="stat-box">
                <h2>10K+</h2>
                <p>Happy Travelers</p>
              </div>
              <div className="stat-box">
                <h2>4.9</h2>
                <p>Average Rating</p>
              </div>
            </div>
          </div>
          <div className="about-facilities">
            <div className="facility-card">
              <div className="facility-icon"><i className="ri-shield-check-line"></i></div>
              <div className="facility-text">
                <h2>Secure Bookings</h2>
                <p>Your payments and personal data are protected with enterprise-grade encryption.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon"><i className="ri-headphone-line"></i></div>
              <div className="facility-text">
                <h2>24/7 Support</h2>
                <p>Dedicated travel consultants available around the clock for any assistance.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon"><i className="ri-wallet-3-line"></i></div>
              <div className="facility-text">
                <h2>Best Price Guarantee</h2>
                <p>We match and beat competitor prices for identical travel packages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      {reviews.length > 0 && (
        <section className="testimonial-section">
          <div className="testimonial-header">
            <h1>What Our Travelers <span className="highlight">Say</span></h1>
            <p>Real experiences from our community of happy explorers</p>
          </div>
          <div className="home-review-carousel">
            <div className={`home-review-card ${reviewAnimation}`}>
              <div className="home-review-quote"><i className="ri-double-quotes-l"></i></div>
              <p className="home-review-text">{reviews[currentReview]?.comment}</p>
              <div className="home-review-stars">
                {renderStars(reviews[currentReview]?.rating || 5)}
              </div>
              <div className="home-review-author">
                <img
                  src={reviews[currentReview]?.avatar}
                  alt={reviews[currentReview]?.name}
                />
                <div>
                  <h4>{reviews[currentReview]?.name}</h4>
                  <span>{reviews[currentReview]?.role}</span>
                </div>
              </div>
            </div>
            <div className="home-review-dots">
              {reviews.map((_, idx) => (
                <span
                  key={idx}
                  className={`home-review-dot ${idx === currentReview ? 'active' : ''}`}
                  onClick={() => {
                    setReviewAnimation('fade-out');
                    setTimeout(() => {
                      setCurrentReview(idx);
                      setReviewAnimation('fade-in');
                    }, 300);
                  }}
                  role="button"
                  aria-label={`Go to review ${idx + 1}`}
                ></span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Connect Section */}
      <section className="home-connect-section">
        <h2>Stay Connected With <span className="highlight">TravelKro</span></h2>
        <p>Follow us on social media for travel tips, deals, and inspiration.</p>
        <div className="home-connect-socials">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="home-social-link">
            <i className="ri-instagram-line"></i> Instagram
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="home-social-link">
            <i className="ri-twitter-x-fill"></i> Twitter
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="home-social-link">
            <i className="ri-facebook-fill"></i> Facebook
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="home-social-link">
            <i className="ri-youtube-fill"></i> YouTube
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;