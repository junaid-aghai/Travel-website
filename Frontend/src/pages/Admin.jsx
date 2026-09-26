import { useState, useEffect } from 'react';
import api from '../api/axios';


const Admin = ({ destinationList, refreshDestinations }) => {
  const [activeTab, setActiveTab] = useState('destinations');
  const [formData, setFormData] = useState({
    location: '',
    desc: '',
    price: '',
    rating: '4.8',
    reviews: '120',
    image: '',
  });
  const [itineraryDays, setItineraryDays] = useState([
    { day: 1, title: '', description: '', highlights: '' }
  ]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    let intervalId;
    if (activeTab === 'bookings') {
      fetchBookings();
      // Auto-refresh bookings every 5 seconds
      intervalId = setInterval(() => {
        fetchBookings(true);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  const fetchBookings = async (isBackground = false) => {
    if (!isBackground) setBookingsLoading(true);
    try {
      const response = await api.get('/bookings');
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      if (!isBackground) setBookingsLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    setConfirmLoading(bookingId);
    setMessage({ type: '', text: '' });
    try {
      const response = await api.post(`/booking/confirm/${bookingId}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message || 'Booking confirmed & user notified via email!' });
        fetchBookings(true);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to confirm booking.' });
      }
    } catch (err) {
      console.error('Confirm error:', err);
      setMessage({ type: 'error', text: 'Failed to confirm booking.' });
    } finally {
      setConfirmLoading(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItineraryChange = (idx, field, value) => {
    setItineraryDays((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addItineraryDay = () => {
    setItineraryDays((prev) => [
      ...prev,
      { day: prev.length + 1, title: '', description: '', highlights: '' }
    ]);
  };

  const removeItineraryDay = (idx) => {
    setItineraryDays((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.map((item, i) => ({ ...item, day: i + 1 }));
    });
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.location || !formData.desc || !formData.price || !formData.image) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);

    const itinerary = itineraryDays
      .filter(d => d.title && d.description)
      .map(d => ({
        day: d.day,
        title: d.title,
        description: d.description,
        highlights: d.highlights ? d.highlights.split(',').map(h => h.trim()).filter(Boolean) : []
      }));

    const payload = {
      location: formData.location,
      desc: formData.desc,
      price: Number(formData.price),
      rating: Number(formData.rating) || 4.8,
      reviews: Number(formData.reviews) || 100,
      image: formData.image,
      itinerary
    };

    try {
      const response = await api.post('/submit', payload);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Destination created successfully!' });
        setFormData({ location: '', desc: '', price: '', rating: '4.8', reviews: '120', image: '' });
        setItineraryDays([{ day: 1, title: '', description: '', highlights: '' }]);
        if (refreshDestinations) refreshDestinations();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to create destination.' });
      }
    } catch (err) {
      console.error('Error creating destination:', err);
      setMessage({ type: 'error', text: 'Server error. Could not save destination.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDestination = async (dest) => {
    const identifier = dest._id || encodeURIComponent(dest.location);
    if (!window.confirm(`Are you sure you want to delete "${dest.location}"?`)) return;

    setDeleteLoading(identifier);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.delete(`/destination/${identifier}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: `Deleted "${dest.location}" successfully!` });
        if (refreshDestinations) refreshDestinations();
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to delete.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to server to delete destination.' });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredDestinations = destinationList.filter((d) =>
    d.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.desc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter((b) =>
    b.userName?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
    b.destinationName?.toLowerCase().includes(bookingSearchTerm.toLowerCase())
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalPersons = bookings.reduce((sum, b) => sum + (b.persons || 0), 0);

  return (
    <div className="admin-dashboard fade-up">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2><i className="ri-dashboard-3-line"></i> Admin</h2>
        </div>
        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeTab === 'destinations' ? 'active' : ''}`}
            onClick={() => setActiveTab('destinations')}
          >
            <i className="ri-map-pin-line"></i>
            <span>Destinations</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'create-destination' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-destination')}
          >
            <i className="ri-add-circle-line"></i>
            <span>Create Destination</span>
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="ri-ticket-line"></i>
            <span>Bookings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {message.text && (
          <div className={`admin-toast ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <i className={message.type === 'error' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}></i>
            <span>{message.text}</span>
            <button className="toast-close" onClick={() => setMessage({ type: '', text: '' })}>
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* DESTINATIONS TAB */}
        {activeTab === 'destinations' && (
          <>
            <div className="admin-page-title">
              <h1>Manage Destinations</h1>
              <p>View and manage existing travel destinations.</p>
            </div>

            {/* Stats Row - Only Total Destinations */}
            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <div className="stat-icon stat-blue"><i className="ri-map-pin-line"></i></div>
                <div className="stat-info">
                  <h3>{destinationList.length}</h3>
                  <p>Total Destinations</p>
                </div>
              </div>
            </div>

            {/* Existing Destinations Panel */}
            <div className="admin-panel admin-panel-full">
              <div className="panel-header panel-header-row">
                <h2><i className="ri-map-pin-line"></i> Destinations ({destinationList.length})</h2>
                <div className="admin-search-input">
                  <i className="ri-search-line"></i>
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="admin-dest-list">
                {filteredDestinations.length === 0 ? (
                  <p className="no-data"><i className="ri-inbox-line"></i> No destinations found.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Itinerary</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDestinations.map((item, idx) => {
                        const itemId = item._id || item.location;
                        return (
                          <tr key={itemId || idx}>
                            <td className="dest-info-td">
                              <img src={item.image} alt={item.location} className="table-thumb" />
                              <div>
                                <strong className="dest-title">{item.location}</strong>
                                <p className="dest-desc-trunc">{item.desc}</p>
                              </div>
                            </td>
                            <td><strong>${item.price}</strong></td>
                            <td>
                              <span className="rating-badge-sm">
                                <i className="ri-star-fill"></i> {item.rating || '4.8'}
                              </span>
                            </td>
                            <td>
                              <span className="itinerary-badge">
                                {item.itinerary?.length || 0} days
                              </span>
                            </td>
                            <td>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteDestination(item)}
                                disabled={deleteLoading === itemId}
                                title="Delete Destination"
                              >
                                {deleteLoading === itemId ? (
                                  <i className="ri-loader-4-line spin"></i>
                                ) : (
                                  <i className="ri-delete-bin-line"></i>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* CREATE DESTINATION TAB */}
        {activeTab === 'create-destination' && (
          <>
            <div className="admin-page-title">
              <h1>Create Destination</h1>
              <p>Add new destinations with detailed daily itineraries.</p>
            </div>

            <div className="admin-panel admin-panel-full">
              <div className="panel-header">
                <h2><i className="ri-add-circle-line"></i> Add New Destination</h2>
              </div>
              <form onSubmit={handleAddDestination} className="admin-form">
                <div className="form-group">
                  <label>Location / Name *</label>
                  <input type="text" name="location" placeholder="e.g. Goa, India" value={formData.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea name="desc" rows="3" placeholder="Brief captivating description..." value={formData.desc} onChange={handleChange} required></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input type="number" name="price" placeholder="e.g. 899" value={formData.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Rating (1-5)</label>
                    <input type="number" step="0.1" min="1" max="5" name="rating" placeholder="4.8" value={formData.rating} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL *</label>
                  <input type="url" name="image" placeholder="https://images.unsplash.com/..." value={formData.image} onChange={handleChange} required />
                </div>
                {formData.image && (
                  <div className="image-preview">
                    <span>Preview:</span>
                    <img src={formData.image} alt="Preview" onError={(e) => (e.target.style.display = 'none')} />
                  </div>
                )}

                {/* Itinerary Builder Grid (2 side by side) */}
                <div className="itinerary-builder">
                  <div className="itinerary-builder-header">
                    <h3><i className="ri-route-line"></i> Itinerary Builder</h3>
                    <button type="button" className="add-day-btn" onClick={addItineraryDay}>
                      <i className="ri-add-line"></i> Add Day
                    </button>
                  </div>
                  <div className="itinerary-days-grid">
                    {itineraryDays.map((day, idx) => (
                      <div className="itinerary-day-form" key={idx}>
                        <div className="day-form-header">
                          <span className="day-label">Day {day.day}</span>
                          {itineraryDays.length > 1 && (
                            <button type="button" className="remove-day-btn" onClick={() => removeItineraryDay(idx)}>
                              <i className="ri-close-line"></i>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Day title (e.g. Arrival & City Tour)"
                          value={day.title}
                          onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)}
                        />
                        <textarea
                          rows="2"
                          placeholder="Description of this day's activities..."
                          value={day.description}
                          onChange={(e) => handleItineraryChange(idx, 'description', e.target.value)}
                        ></textarea>
                        <input
                          type="text"
                          placeholder="Highlights (comma separated)"
                          value={day.highlights}
                          onChange={(e) => handleItineraryChange(idx, 'highlights', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary admin-submit-btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Publish Destination'} <i className="ri-send-plane-line"></i>
                </button>
              </form>
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <>
            <div className="admin-page-title">
              <h1>Booking Management</h1>
              <p>View and track all customer bookings and reservations.</p>
            </div>

            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <div className="stat-icon stat-blue"><i className="ri-ticket-line"></i></div>
                <div className="stat-info">
                  <h3>{bookings.length}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon stat-amber"><i className="ri-group-line"></i></div>
                <div className="stat-info">
                  <h3>{totalPersons}</h3>
                  <p>Total Travelers</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-icon stat-green"><i className="ri-money-dollar-circle-line"></i></div>
                <div className="stat-info">
                  <h3>${totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="admin-panel admin-panel-full">
              <div className="panel-header panel-header-row">
                <h2><i className="ri-file-list-3-line"></i> All Bookings ({bookings.length})</h2>
                <div className="admin-search-input">
                  <i className="ri-search-line"></i>
                  <input
                    type="text"
                    placeholder="Search customer, email or trip..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {bookingsLoading ? (
                <div className="bookings-loading">
                  <div className="detail-loading-spinner"></div>
                  <p>Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="no-data-box">
                  <i className="ri-inbox-line"></i>
                  <h3>{bookingSearchTerm ? 'No matching bookings found' : 'No bookings yet'}</h3>
                  <p>{bookingSearchTerm ? 'Try searching with a different name, email, or destination.' : 'Bookings will appear here once customers start reserving trips.'}</p>
                </div>
              ) : (
                <div className="admin-dest-list">
                  <table className="admin-table bookings-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Destination</th>
                        <th>Persons</th>
                        <th>Total</th>
                        <th>Travel Date</th>
                        <th>Booked On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking, idx) => {
                        const bId = booking._id || idx;
                        return (
                          <tr key={bId}>
                            <td>
                              <div className="booking-customer">
                                <div className="booking-avatar">
                                  {(booking.userName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{booking.userName || 'Unknown'}</strong>
                                  <p className="booking-email">{booking.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td><strong>{booking.destinationName}</strong></td>
                            <td>
                              <span className="persons-badge">
                                <i className="ri-group-line"></i> {booking.persons}
                              </span>
                            </td>
                            <td><strong className="revenue-text">${(booking.totalPrice || 0).toLocaleString()}</strong></td>
                            <td>{booking.travelDate || '—'}</td>
                            <td className="date-cell">
                              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td>
                              <button
                                className="btn-confirm-booking"
                                onClick={() => handleConfirmBooking(bId)}
                                disabled={confirmLoading === bId}
                                title="Confirm booking and notify customer via email"
                              >
                                {confirmLoading === bId ? (
                                  <><i className="ri-loader-4-line spin"></i> Sending...</>
                                ) : (
                                  <><i className="ri-mail-send-line"></i> Confirm</>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
