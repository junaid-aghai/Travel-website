import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const DestinationDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [persons, setPersons] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/destination/${id}`);
        if (response.data.success) {
          setDestination(response.data.destination);
        }
      } catch (err) {
        console.error('Error fetching destination:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  const totalPrice = destination ? destination.price * persons : 0;

  const handleBooking = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!travelDate) {
      setBookingMessage({ type: 'error', text: 'Please select a travel date.' });
      return;
    }

    setBookingLoading(true);
    setBookingMessage({ type: '', text: '' });

    try {
      const response = await axios.post('http://localhost:8080/book', {
        destinationId: destination._id,
        destinationName: destination.location,
        userName: user.name,
        userEmail: user.email,
        persons,
        pricePerPerson: destination.price,
        totalPrice,
        travelDate
      }, { withCredentials: true });

      if (response.data.success) {
        setBookingMessage({ type: 'success', text: 'Booking confirmed! Check your email for details.' });
        setTravelDate('');
        setPersons(1);
      } else {
        setBookingMessage({ type: 'error', text: response.data.message || 'Booking failed.' });
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-loading-spinner"></div>
        <p>Loading destination...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="detail-not-found">
        <i className="ri-compass-3-line"></i>
        <h2>Destination Not Found</h2>
        <p>This destination doesn't exist or has been removed.</p>
        <Link to="/destinations" className="btn-primary">Browse All Destinations</Link>
      </div>
    );
  }

  const itinerary = destination.itinerary || [];

  return (
    <div className="detail-page fade-up">
      {/* Hero Section */}
      <div className="detail-hero">
        <img src={destination.image} alt={destination.location} className="detail-hero-img" />
        <div className="detail-hero-overlay"></div>
        <div className="detail-hero-content">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>
            <i className="ri-arrow-left-line"></i> Back
          </button>
          <div className="detail-hero-info">
            <h1>{destination.location}</h1>
            <div className="detail-hero-meta">
              <span className="detail-rating">
                <i className="ri-star-fill"></i> {destination.rating}
              </span>
              <span className="detail-reviews">({destination.reviews} reviews)</span>
              <span className="detail-duration">
                <i className="ri-calendar-line"></i> {itinerary.length} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="detail-content-wrapper">
        {/* Left: Itinerary */}
        <div className="detail-left">
          <div className="detail-description-card">
            <h2><i className="ri-information-line"></i> About this Destination</h2>
            <p>{destination.desc}</p>
          </div>

          {itinerary.length > 0 && (
            <div className="detail-itinerary-section">
              <h2><i className="ri-route-line"></i> Day-by-Day Itinerary</h2>
              <div className="itinerary-timeline">
                {itinerary.map((item, idx) => (
                  <div className="itinerary-item" key={idx}>
                    <div className="itinerary-day-badge">
                      <span>Day {item.day}</span>
                    </div>
                    <div className="itinerary-card">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="itinerary-highlights">
                          {item.highlights.map((hl, hIdx) => (
                            <span className="highlight-tag" key={hIdx}>
                              <i className="ri-checkbox-circle-fill"></i> {hl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div className="detail-right">
          <div className="booking-card">
            <div className="booking-card-header">
              <h3>Book this Trip</h3>
              <div className="booking-price-display">
                <span className="booking-price">${destination.price}</span>
                <span className="booking-price-label">/ person</span>
              </div>
            </div>

            <div className="booking-card-body">
              <div className="booking-field">
                <label><i className="ri-calendar-event-line"></i> Travel Date</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="booking-field">
                <label><i className="ri-group-line"></i> Number of Persons</label>
                <div className="persons-selector">
                  <button
                    className="persons-btn"
                    onClick={() => setPersons(Math.max(1, persons - 1))}
                    disabled={persons <= 1}
                  >
                    <i className="ri-subtract-line"></i>
                  </button>
                  <span className="persons-count">{persons}</span>
                  <button
                    className="persons-btn"
                    onClick={() => setPersons(Math.min(10, persons + 1))}
                    disabled={persons >= 10}
                  >
                    <i className="ri-add-line"></i>
                  </button>
                </div>
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>${destination.price} × {persons} person{persons > 1 ? 's' : ''}</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span className="total-amount">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {bookingMessage.text && (
                <div className={`booking-alert ${bookingMessage.type === 'error' ? 'booking-alert-error' : 'booking-alert-success'}`}>
                  <i className={bookingMessage.type === 'error' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}></i>
                  {bookingMessage.text}
                </div>
              )}

              <button
                className="btn-primary booking-confirm-btn"
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing...' : (user ? 'Confirm Booking' : 'Sign In to Book')}
                <i className={bookingLoading ? 'ri-loader-4-line spin' : 'ri-arrow-right-line'}></i>
              </button>
            </div>

            <div className="booking-card-footer">
              <p><i className="ri-shield-check-line"></i> Free cancellation up to 48 hours before</p>
              <p><i className="ri-bank-card-line"></i> Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
