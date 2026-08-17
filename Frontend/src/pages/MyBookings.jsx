import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const MyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const response = await axios.get(`http://localhost:8080/my-bookings${emailQuery}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setToast({ type: 'error', text: 'Could not load your bookings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelLoading(true);
    setToast({ type: '', text: '' });

    try {
      const bId = cancelModalBooking._id;
      const response = await axios.patch(
        `http://localhost:8080/booking/cancel/${bId}`,
        { reason: cancelReason },
        { withCredentials: true }
      );

      if (response.data.success) {
        setToast({ type: 'success', text: response.data.message || 'Booking cancelled successfully.' });
        setCancelModalBooking(null);
        setCancelReason('');
        fetchMyBookings();
      } else {
        setToast({ type: 'error', text: response.data.message || 'Failed to cancel reservation.' });
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      setToast({ type: 'error', text: 'Server error while cancelling reservation.' });
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'all') return true;
    if (filterTab === 'confirmed') return b.status === 'confirmed';
    if (filterTab === 'pending') return b.status === 'pending';
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="my-bookings-page fade-up">
      {/* Hero Header */}
      <div className="my-bookings-header">
        <div className="my-bookings-header-content">
          <span className="my-bookings-badge">
            <i className="ri-user-smile-line"></i> Traveler Hub
          </span>
          <h1>My Bookings & <span className="highlight">Trips</span></h1>
          <p>Track your reservations, view travel boarding vouchers, and manage your upcoming journeys.</p>
        </div>

        {/* Quick Stats Banner */}
        <div className="my-bookings-stats-grid">
          <div className="user-stat-card">
            <div className="stat-icon-wrap blue"><i className="ri-suitcase-line"></i></div>
            <div>
              <h3>{bookings.length}</h3>
              <p>Total Reservations</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-wrap green"><i className="ri-checkbox-circle-line"></i></div>
            <div>
              <h3>{confirmedCount}</h3>
              <p>Confirmed Trips</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-wrap amber"><i className="ri-time-line"></i></div>
            <div>
              <h3>{pendingCount}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="user-stat-card">
            <div className="stat-icon-wrap purple"><i className="ri-wallet-3-line"></i></div>
            <div>
              <h3>${totalSpent.toLocaleString()}</h3>
              <p>Total Travel Value</p>
            </div>
          </div>
        </div>
      </div>

      {toast.text && (
        <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} style={{ maxWidth: '700px', margin: '20px auto' }}>
          <i className={toast.type === 'error' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}></i>
          <span>{toast.text}</span>
          <button className="toast-close" onClick={() => setToast({ type: '', text: '' })}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="my-bookings-container">
        {/* Navigation Tabs */}
        <div className="my-bookings-tabs">
          <button
            className={`booking-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Bookings <span className="tab-pill">{bookings.length}</span>
          </button>
          <button
            className={`booking-tab-btn ${filterTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilterTab('confirmed')}
          >
            Confirmed <span className="tab-pill green">{confirmedCount}</span>
          </button>
          <button
            className={`booking-tab-btn ${filterTab === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            Pending <span className="tab-pill amber">{pendingCount}</span>
          </button>
          <button
            className={`booking-tab-btn ${filterTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilterTab('cancelled')}
          >
            Cancelled <span className="tab-pill red">{bookings.filter(b => b.status === 'cancelled').length}</span>
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="detail-loading" style={{ margin: '60px auto' }}>
            <div className="detail-loading-spinner"></div>
            <p>Loading your reservations...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings-card">
            <div className="no-bookings-icon">
              <i className="ri-flight-takeoff-line"></i>
            </div>
            <h2>No {filterTab !== 'all' ? filterTab : ''} bookings found</h2>
            <p>Ready to plan your next breathtaking adventure? Explore handpicked luxury destinations.</p>
            <Link to="/destinations" className="btn-primary">
              Explore Destinations <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
        ) : (
          <div className="my-bookings-grid">
            {filteredBookings.map((b) => {
              const bId = b._id;
              const isConfirmed = b.status === 'confirmed';
              const isCancelled = b.status === 'cancelled';

              return (
                <div className={`user-booking-card ${isCancelled ? 'booking-cancelled-card' : ''}`} key={bId}>
                  <div className="booking-card-top">
                    <div className="booking-destination-info">
                      <span className="booking-ref">REF #{String(bId).slice(-6).toUpperCase()}</span>
                      <h3><i className="ri-map-pin-2-fill"></i> {b.destinationName}</h3>
                      <p className="booking-date-booked">
                        Reserved on {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </p>
                    </div>

                    <div className="booking-status-tag">
                      {isConfirmed && (
                        <span className="status-badge-confirmed">
                          <i className="ri-checkbox-circle-fill"></i> Confirmed
                        </span>
                      )}
                      {!isConfirmed && !isCancelled && (
                        <span className="status-badge-pending">
                          <i className="ri-time-line"></i> Pending Review
                        </span>
                      )}
                      {isCancelled && (
                        <span className="status-badge-cancelled">
                          <i className="ri-close-circle-line"></i> Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="booking-card-details">
                    <div className="booking-detail-item">
                      <span className="detail-label"><i className="ri-calendar-event-line"></i> Travel Date</span>
                      <strong className="detail-val">{b.travelDate || 'Flexible / Open'}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label"><i className="ri-group-line"></i> Travelers</span>
                      <strong className="detail-val">{b.persons} Person{b.persons > 1 ? 's' : ''}</strong>
                    </div>
                    <div className="booking-detail-item">
                      <span className="detail-label"><i className="ri-price-tag-3-line"></i> Total Paid / Due</span>
                      <strong className="detail-val price-val">${(b.totalPrice || 0).toLocaleString()}</strong>
                    </div>
                  </div>

                  {b.cancellationReason && (
                    <div className="booking-cancel-note">
                      <i className="ri-information-line"></i> Reason: {b.cancellationReason}
                    </div>
                  )}

                  <div className="booking-card-actions">
                    <button
                      className="btn-view-voucher"
                      onClick={() => setSelectedVoucher(b)}
                    >
                      <i className="ri-ticket-2-line"></i> View Travel Voucher
                    </button>

                    {!isCancelled && (
                      <button
                        className="btn-cancel-trip"
                        onClick={() => setCancelModalBooking(b)}
                      >
                        <i className="ri-close-circle-line"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRAVEL VOUCHER MODAL */}
      {selectedVoucher && (
        <div className="voucher-modal-overlay" onClick={() => setSelectedVoucher(null)}>
          <div className="voucher-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="voucher-modal-header no-print">
              <h2><i className="ri-ticket-line"></i> Official Travel Voucher</h2>
              <button className="voucher-close-btn" onClick={() => setSelectedVoucher(null)}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="printable-voucher-body" id="printable-voucher">
              {/* Voucher Ticket UI */}
              <div className="ticket-container">
                <div className="ticket-header">
                  <div className="ticket-brand">
                    <h2>Travel<span>Kro</span></h2>
                    <p>Official Trip Confirmation Pass</p>
                  </div>
                  <div className="ticket-status-pill">
                    {selectedVoucher.status === 'confirmed' ? (
                      <span className="ticket-pill-green">✓ CONFIRMED</span>
                    ) : selectedVoucher.status === 'cancelled' ? (
                      <span className="ticket-pill-red">✕ CANCELLED</span>
                    ) : (
                      <span className="ticket-pill-amber">⧗ PENDING APPROVAL</span>
                    )}
                  </div>
                </div>

                <div className="ticket-main-grid">
                  <div className="ticket-col">
                    <label>DESTINATION</label>
                    <h3>{selectedVoucher.destinationName}</h3>
                  </div>
                  <div className="ticket-col">
                    <label>PASSENGER / LEAD TRAVELER</label>
                    <h3>{selectedVoucher.userName}</h3>
                    <p className="ticket-subtext">{selectedVoucher.userEmail}</p>
                  </div>
                  <div className="ticket-col">
                    <label>TRAVEL DATE</label>
                    <h3>{selectedVoucher.travelDate || 'Open / Unscheduled'}</h3>
                  </div>
                  <div className="ticket-col">
                    <label>TOTAL TRAVELERS</label>
                    <h3>{selectedVoucher.persons} Person{selectedVoucher.persons > 1 ? 's' : ''}</h3>
                  </div>
                  <div className="ticket-col">
                    <label>BOOKING REF ID</label>
                    <h3 className="ticket-ref-code">TK-{String(selectedVoucher._id).slice(-8).toUpperCase()}</h3>
                  </div>
                  <div className="ticket-col">
                    <label>TOTAL PACKAGE FARE</label>
                    <h3 className="ticket-fare">${(selectedVoucher.totalPrice || 0).toLocaleString()}</h3>
                  </div>
                </div>

                {/* Perforation Divider */}
                <div className="ticket-perforation">
                  <span className="notch-left"></span>
                  <span className="dash-line"></span>
                  <span className="notch-right"></span>
                </div>

                <div className="ticket-footer-row">
                  <div className="ticket-instructions">
                    <h4>Important Traveler Notice:</h4>
                    <p>• Present this voucher along with government-issued photo ID at your hotel and tour check-ins.</p>
                    <p>• 24/7 Concierge Support: <strong>+1 (800) 555-TRAVEL</strong> | support@travelkro.com</p>
                  </div>
                  <div className="ticket-qr-mock">
                    <i className="ri-qr-code-line"></i>
                    <span>VERIFIED PASS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="voucher-modal-footer no-print">
              <button
                className="btn-primary print-btn"
                onClick={() => window.print()}
              >
                <i className="ri-printer-line"></i> Print / Save PDF
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedVoucher(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancelModalBooking && (
        <div className="voucher-modal-overlay" onClick={() => setCancelModalBooking(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <i className="ri-error-warning-fill cancel-warn-icon"></i>
              <h2>Cancel Reservation?</h2>
            </div>
            <p className="cancel-modal-desc">
              Are you sure you want to cancel your trip to <strong>{cancelModalBooking.destinationName}</strong>? Free cancellation applies according to policy.
            </p>

            <div className="form-group" style={{ textAlign: 'left', marginTop: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Reason for cancellation (optional):
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Schedule change, personal reasons..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  marginTop: '6px',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="cancel-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
              <button
                className="btn-danger-confirm"
                onClick={handleCancelBooking}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
