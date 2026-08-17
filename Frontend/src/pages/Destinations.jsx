import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import '../App.css';

const Destinations = ({ destinationList }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    const budget = searchParams.get('maxPrice');
    if (q) setSearchTerm(q);
    if (budget) setMaxBudget(budget);
  }, [searchParams]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setMaxBudget('');
    setSearchParams({});
  };

  const filteredDestinations = destinationList.filter((item) => {
    const matchesQuery = !searchTerm ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBudget = !maxBudget || (item.price && Number(item.price) <= Number(maxBudget));

    return matchesQuery && matchesBudget;
  });

  return (
    <div className='destinations-national'>
      <div className="destinations-header">
        <h1>Explore All <span className="highlight">Destinations</span></h1>
        <p>Find your next dream destination from our curated world travel packages.</p>
        <div className="destinations-search-bar">
          <i className="ri-search-line search-icon" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search destination, country, or landmark..."
            value={searchTerm}
            aria-label="Search destinations"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(searchTerm || maxBudget) && (
            <button className="clear-search-btn" onClick={handleClearFilters} aria-label="Clear search">
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
        {maxBudget && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Filtered by max budget: <strong>${maxBudget}</strong>{' '}
            <button
              onClick={() => setMaxBudget('')}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '6px', fontSize: '13px', textDecoration: 'underline' }}
            >
              Remove budget filter
            </button>
          </div>
        )}
      </div>

      <div className='destinations-national-box'>
        {filteredDestinations.length > 0 ? (
          filteredDestinations.map((national) => (
            <div className='destination-box' key={national._id || national.location}>
              <div className="card-img-wrapper">
                <img
                  src={national.image || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'}
                  alt={national.location}
                />
                <div className="card-img-overlay"></div>
              </div>
              <div className="card-body">
                <p className='location'><i className="ri-map-pin-line"></i> {national.location}</p>
                <p className='description'>{national.desc}</p>
                <div className="rating-review-row">
                  <span className="rating-badge">
                    <i className="ri-star-fill"></i> {national.rating}
                  </span>
                  <span className='reviews-count'>({national.reviews} Reviews)</span>
                </div>
                <div className="price-booking-row">
                  <h2>${national.price} <span>/ person</span></h2>
                  <Link to={`/destination/${national._id}`} className='btn-primary'>
                    Book <i className="ri-arrow-right-line"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results-box">
            <i className="ri-compass-3-line"></i>
            <h3>No destinations found</h3>
            <p>Try searching for a different destination or location keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;