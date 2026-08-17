import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import homeImage from '../assets/hero-travel.jpg';
import '../App.css';

const Home = () => {
  const [topdestnation, setTopdestnation] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const navigate = useNavigate();

  const fetchInfo = async () => {
    try {
      const response = await axios.get("http://localhost:8080/topdest");
      setTopdestnation(response.data.destination || []);
    } catch (error) {
      console.error("Failed to fetch top destinations:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchLocation) queryParams.set('q', searchLocation);
    if (searchBudget) queryParams.set('maxPrice', searchBudget);
    navigate(`/destinations?${queryParams.toString()}`);
  };

  const testimonials = [
    {
      id: 1,
      name: 'Sophia Martinez',
      role: 'Adventure Enthusiast',
      comment: 'TravelKro made our Bali vacation completely effortless! The curated temples and beach resorts were top-tier.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Solo Explorer',
      comment: 'Booking Kyoto through TravelKro was the best decision. Flawless support and incredible prices!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      name: 'Emma & Liam Wilson',
      role: 'Honeymooners',
      comment: 'Santorini was an absolute dream! The sunset recommendations and hotel arrangements exceeded all expectations.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const [currentReview, setCurrentReview] = useState(0);
  const [reviewAnimating, setReviewAnimating] = useState(false);

  useEffect(() => {
    let animTimeout;
    const interval = setInterval(() => {
      setReviewAnimating(true);
      animTimeout = setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % testimonials.length);
        setReviewAnimating(false);
      }, 500);
    }, 4500);
    return () => {
      clearInterval(interval);
      if (animTimeout) clearTimeout(animTimeout);
    };
  }, [testimonials.length]);

  const activeTestimonial = testimonials[currentReview];

  return (
    <>
      <section id='home' className='home'>
        <div className='home-content'>
          <img src={homeImage} alt="TravelKro Hero" className='home-image' />
          <div className='home-text'>
            <span className='home-discover'>
              <i className="ri-compass-3-line"></i> Discover Your Next Adventure
            </span>
            <h1>Explore the World's Most <br /><span className='highlight'>Breathtaking</span> Destinations</h1>
            <p className='home-description'>Curated travel experiences designed to create unforgettable memories. Let us guide you to paradise.</p>
            <form className='home-form' onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder='Where To?'
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <input
                type="date"
                placeholder='When?'
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
              <input
                type="number"
                placeholder='Budget ($)'
                value={searchBudget}
                onChange={(e) => setSearchBudget(e.target.value)}
              />
              <button type="submit" className='btn-primary'>
                Search <i className="ri-search-line"></i>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section id='destinations'>
        <div className='destinations-content'>
          <h1>Trending Places to Explore</h1>
          <p>Handpicked destinations that offer the perfect blend of adventure, culture, and relaxation.</p>
        </div>
        <div className='destinations-grid'>
          {topdestnation.length > 0 ? (
            topdestnation.slice(0, 3).map((dest) => (
              <div className='destination-box' key={dest._id || dest.location}>
                <div className="card-img-wrapper">
                  <img src={dest.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'} alt={dest.location} />
                  <div className="card-img-overlay"></div>
                </div>
                <div className="card-body">
                  <p className='location'><i className="ri-map-pin-line"></i> {dest.location}</p>
                  <p className='description'>{dest.desc}</p>
                  <div className="rating-review-row">
                    <span className="rating-badge">
                      <i className="ri-star-fill"></i> {dest.rating}
                    </span>
                    <span className='reviews-count'>({dest.reviews} Reviews)</span>
                  </div>
                  <div className="price-booking-row">
                    <h2>${dest.price} <span>/ person</span></h2>
                    <Link to={`/destination/${dest._id}`} className='btn-primary'>
                      Book <i className="ri-arrow-right-line"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="loading-text">Loading top destinations...</p>
          )}
        </div>
        <div className='destinations-btn'>
          <Link to="/destinations" className='btn-secondary'>
            View All Destinations <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>

      <section id='about'>
        <div className="about-wrapper">
          <div className='about-content'>
            <h1>Why Thousands of Travelers Choose <span className="highlight">TravelKro</span></h1>
            <p className='para'>At TravelKro, we understand that every traveler has unique needs and preferences. We offer bespoke travel planning, verified luxury resorts, and 24/7 global support.</p>
            <div className='about-stats-grid'>
              <div className="stat-box">
                <h2>12K+</h2>
                <p>Happy Travelers</p>
              </div>
              <div className="stat-box">
                <h2>10Yrs</h2>
                <p>Experience</p>
              </div>
              <div className="stat-box">
                <h2>100+</h2>
                <p>Destinations</p>
              </div>
            </div>
          </div>
          <div className='about-facilities'>
            <div className="facility-card">
              <div className="facility-icon">
                <i className="ri-customer-service-2-line"></i>
              </div>
              <div className="facility-text">
                <h2>24/7 Customer Support</h2>
                <p>Our dedicated support team is available around the clock to assist you with any inquiries.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon">
                <i className="ri-shield-check-line"></i>
              </div>
              <div className="facility-text">
                <h2>Flexible Booking Options</h2>
                <p>Enjoy flexible booking and free cancellation options for complete peace of mind.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-icon">
                <i className="ri-money-dollar-circle-line"></i>
              </div>
              <div className="facility-text">
                <h2>Best Price Guarantee</h2>
                <p>Exclusive discounts and competitive pricing across luxury hotels and tours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='testimonial-section'>
        <div className='testimonial-header'>
          <h1>What Our Travelers Say</h1>
          <p>Real stories from real adventurers who trusted us with their dream vacations.</p>
        </div>
        <div className='home-review-carousel'>
          <div className={`home-review-card ${reviewAnimating ? 'fade-out' : 'fade-in'}`}>
            <div className="home-review-quote">
              <i className="ri-double-quotes-l"></i>
            </div>
            <p className="home-review-text">"{activeTestimonial.comment}"</p>
            <div className="home-review-stars">
              {[...Array(activeTestimonial.rating)].map((_, i) => (
                <i className="ri-star-fill" key={i}></i>
              ))}
            </div>
            <div className="home-review-author">
              <img src={activeTestimonial.avatar} alt={activeTestimonial.name} />
              <div>
                <h4>{activeTestimonial.name}</h4>
                <span>{activeTestimonial.role}</span>
              </div>
            </div>
          </div>
          <div className="home-review-dots">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`home-review-dot ${i === currentReview ? 'active' : ''}`}
                onClick={() => {
                  setReviewAnimating(true);
                  setTimeout(() => {
                    setCurrentReview(i);
                    setReviewAnimating(false);
                  }, 300);
                }}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section className="home-connect-section">
        <h2>Connect With <span className="highlight">Us</span></h2>
        <p>Follow us for travel inspiration, exclusive deals, and behind-the-scenes adventure stories.</p>
        <div className="home-connect-socials">
          <a href="https://wa.me/" target="_blank" rel="noreferrer" className="home-social-link">
            <i className="ri-whatsapp-line"></i>
            <span>WhatsApp</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="home-social-link">
            <i className="ri-instagram-line"></i>
            <span>Instagram</span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="home-social-link">
            <i className="ri-facebook-circle-line"></i>
            <span>Facebook</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="home-social-link">
            <i className="ri-twitter-x-line"></i>
            <span>Twitter</span>
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;