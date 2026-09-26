import { Link } from 'react-router-dom';

/**
 * Reusable destination card component used on Home and Destinations pages.
 * Eliminates code duplication of card JSX and styling.
 */
const DestinationCard = ({ destination }) => {
  const dest = destination;

  return (
    <div className="destination-box" key={dest._id || dest.location}>
      <div className="card-img-wrapper">
        <img
          src={dest.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'}
          alt={dest.location}
          loading="lazy"
        />
        <div className="card-img-overlay"></div>
      </div>
      <div className="card-body">
        <p className="location">
          <i className="ri-map-pin-line"></i> {dest.location}
        </p>
        <p className="description">{dest.desc}</p>
        <div className="rating-review-row">
          <span className="rating-badge">
            <i className="ri-star-fill"></i> {dest.rating}
          </span>
          <span className="reviews-count">({dest.reviews} Reviews)</span>
        </div>
        <div className="price-booking-row">
          <h2>${dest.price} <span>/ person</span></h2>
          <Link to={`/destination/${dest._id}`} className="btn-primary">
            Book <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
