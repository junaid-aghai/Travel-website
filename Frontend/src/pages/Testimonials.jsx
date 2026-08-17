import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Testimonials = () => {
  const initialTestimonials = [
    {
      id: 1,
      name: 'Sophia Martinez',
      role: 'Adventure Enthusiast',
      destination: 'Bali, Indonesia',
      comment: 'TravelKro made our Bali vacation completely effortless! The curated temples and beach resorts were top-tier. Every detail was perfectly planned and executed smoothly.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Solo Explorer',
      destination: 'Kyoto, Japan',
      comment: 'Booking Kyoto through TravelKro was the best decision. Flawless support and incredible prices! Wandering through bamboo groves and ancient shrines was unforgettable.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Emma & Liam Wilson',
      role: 'Honeymooners',
      destination: 'Santorini, Greece',
      comment: 'Santorini was an absolute dream! The sunset recommendations and cliffside hotel arrangements exceeded all our expectations. Truly magical experience for our honeymoon.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      name: 'Arjun Patel',
      role: 'Family Traveler',
      destination: 'Swiss Alps, Switzerland',
      comment: 'We took our kids on a trip to Switzerland and TravelKro handled everything — scenic train rides, cozy chalets, and ski passes. The kids had the time of their lives!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Maria Gonzalez',
      role: 'Cultural Explorer',
      destination: 'Machu Picchu, Peru',
      comment: 'From the ancient ruins of Machu Picchu to the vibrant culinary scene in Lima, TravelKro curated the perfect cultural immersion trip for me.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 6,
      name: 'Lucas Rossi',
      role: 'Backpacker & Photographer',
      destination: 'Amalfi Coast, Italy',
      comment: 'The photography tour along the Amalfi coast was spectacular. TravelKro gave us local tips for secret viewpoints that tourists rarely find!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      storyImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    destination: '',
    rating: 5,
    comment: '',
    storyImage: ''
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:8080/reviews');
      if (response.data.success && (response.data.reviews || response.data.testimonials)) {
        const dataList = response.data.reviews || response.data.testimonials;
        if (dataList.length > 0) {
          setTestimonials(dataList);
        }
      }
    } catch (err) {
      console.log('Using initial reviews');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (ratingValue) => {
    setFormData((prev) => ({ ...prev, rating: ratingValue }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setToast({ type: '', text: '' });

    if (!formData.name || !formData.destination || !formData.comment) {
      setToast({ type: 'error', text: 'Please fill in your name, destination, and review comment.' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post('http://localhost:8080/reviews', formData);
      if (response.data.success) {
        setToast({ type: 'success', text: response.data.message || 'Review submitted successfully!' });
        const createdObj = response.data.review || response.data.testimonial;
        if (createdObj) {
          setTestimonials((prev) => [createdObj, ...prev]);
        }
        setFormData({
          name: '',
          role: '',
          destination: '',
          rating: 5,
          comment: '',
          storyImage: ''
        });
        setShowReviewForm(false);
      } else {
        setToast({ type: 'error', text: response.data.message || 'Failed to submit review.' });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      // Fallback local update if server endpoint offline
      const newReview = {
        id: Date.now(),
        ...formData,
        role: formData.role || 'Traveler',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        storyImage: formData.storyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'
      };
      setTestimonials((prev) => [newReview, ...prev]);
      setToast({ type: 'success', text: 'Review added successfully!' });
      setShowReviewForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="testimonials-page fade-up">
      {/* Banner Header */}
      <div className="testimonials-banner">
        <h1>Traveler Stories & <span className="highlight">Reviews</span></h1>
        <p>Discover real experiences, heartfelt stories, and honest feedback from our global community of adventurers.</p>
        
        <button 
          className="btn-primary write-review-toggle-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          <i className={showReviewForm ? 'ri-close-line' : 'ri-edit-line'}></i>
          {showReviewForm ? 'Close Review Form' : 'Write a Review'}
        </button>
      </div>

      {toast.text && (
        <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} style={{ maxWidth: '600px', margin: '20px auto' }}>
          <i className={toast.type === 'error' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}></i>
          <span>{toast.text}</span>
          <button className="toast-close" onClick={() => setToast({ type: '', text: '' })}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Review Submission Form Modal / Box */}
      {showReviewForm && (
        <div className="review-form-container fade-up">
          <div className="review-form-card">
            <h2><i className="ri-chat-smile-3-line"></i> Share Your Travel Experience</h2>
            <p>Tell the community about your latest adventure with TravelKro.</p>
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="review-form-grid">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Alex Johnson"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Traveler Role / Tag</label>
                  <input
                    type="text"
                    name="role"
                    placeholder="e.g. Solo Explorer, Family Trip"
                    value={formData.role}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="review-form-grid">
                <div className="form-group">
                  <label>Destination Visited *</label>
                  <input
                    type="text"
                    name="destination"
                    placeholder="e.g. Tokyo, Japan"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Photo URL (Optional)</label>
                  <input
                    type="url"
                    name="storyImage"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.storyImage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="form-group">
                <label>Your Rating *</label>
                <div className="star-rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={star <= formData.rating ? 'ri-star-fill active-star' : 'ri-star-line'}
                      onClick={() => handleRatingClick(star)}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    ></i>
                  ))}
                  <span className="rating-label-text">{formData.rating} of 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label>Your Review / Experience *</label>
                <textarea
                  name="comment"
                  rows="4"
                  placeholder="Share details of your trip, hotels, guides, or favorite memories..."
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary review-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Post My Review'} <i className="ri-send-plane-fill"></i>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid of all client stories (Fixed length cards) */}
      <div className="testimonials-list-container">
        {testimonials.map((item, idx) => (
          <div className="testimonial-full-card fixed-length-card" key={item._id || item.id || idx}>
            <div className="story-image-box">
              <img
                src={item.storyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
                alt={item.destination}
                onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80')}
              />
              <span className="story-destination-badge">
                <i className="ri-map-pin-line"></i> {item.destination}
              </span>
            </div>

            <div className="story-content-box">
              <div className="story-header">
                <img
                  src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={item.name}
                  className="story-avatar"
                  onError={(e) => (e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')}
                />
                <div>
                  <h3>{item.name}</h3>
                  <span className="story-role">{item.role || 'Traveler'}</span>
                </div>
              </div>

              <div className="story-rating">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <i className="ri-star-fill" key={i}></i>
                ))}
              </div>

              <p className="story-comment">"{item.comment}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
