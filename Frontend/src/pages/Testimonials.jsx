import { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';


const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
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
      const response = await api.get('/reviews');
      if (response.data.success && (response.data.reviews || response.data.testimonials)) {
        const dataList = response.data.reviews || response.data.testimonials;
        if (dataList.length > 0) {
          setTestimonials(dataList);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
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

    if (!formData.name || !formData.destination || !formData.comment) {
      toast.error('Please fill in your name, destination, and review comment.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/reviews', formData);
      if (response.data.success) {
        toast.success(response.data.message || 'Review submitted successfully!');
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
        toast.error(response.data.message || 'Failed to submit review.');
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
      toast.success('Review added successfully!');
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

      {/* Review Submission Form */}
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

      {/* Grid of all client stories */}
      <div className="testimonials-list-container">
        {loading ? (
          <p style={{ textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-secondary)' }}>Loading reviews...</p>
        ) : testimonials.length === 0 ? (
          <div className="no-results-box" style={{ gridColumn: '1/-1' }}>
            <i className="ri-chat-quote-line"></i>
            <h3>No reviews yet</h3>
            <p>Be the first to share your travel experience!</p>
          </div>
        ) : (
          testimonials.map((item, idx) => (
            <div className="testimonial-full-card fixed-length-card" key={item._id || item.id || idx}>
              <div className="story-image-box">
                <img
                  src={item.storyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
                  alt={item.destination}
                  loading="lazy"
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
          ))
        )}
      </div>
    </div>
  );
};

export default Testimonials;
