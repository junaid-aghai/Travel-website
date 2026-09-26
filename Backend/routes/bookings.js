const express = require('express');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { sendBookingConfirmation } = require('../utils/email');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

// POST /book — Create a new booking
router.post('/book', async (req, res) => {
  try {
    const collection = req.db.collection('bookings');
    const { destinationId, destinationName, userName, userEmail, persons, pricePerPerson, totalPrice, travelDate } = req.body;

    if (!destinationName || !userName || !userEmail || !persons || !pricePerPerson) {
      return res.status(400).json({ success: false, message: 'All booking fields are required' });
    }

    const numPersons = Number(persons) || 1;
    const numPricePerPerson = Number(pricePerPerson) || 0;
    const numTotalPrice = Number(totalPrice) || (numPricePerPerson * numPersons);

    const bookingData = {
      destinationId,
      destinationName,
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      persons: numPersons,
      pricePerPerson: numPricePerPerson,
      totalPrice: numTotalPrice,
      travelDate: travelDate || null,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await collection.insertOne(bookingData);
    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully!',
      id: result.insertedId,
      booking: { ...bookingData, _id: result.insertedId }
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit booking' });
  }
});

// POST /booking/confirm/:id — Admin confirms a booking and sends email notification
router.post('/booking/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = req.db.collection('bookings');
    let query = null;
    let booking = null;

    if (ObjectId.isValid(id)) {
      try {
        query = { _id: new ObjectId(id) };
        booking = await collection.findOne(query);
      } catch (e) { /* invalid ObjectId */ }
    }
    if (!booking) {
      query = { _id: id };
      booking = await collection.findOne(query);
    }
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await collection.updateOne(query, { $set: { status: 'confirmed', confirmedAt: new Date() } });

    // Send notification email
    await sendBookingConfirmation(booking);

    res.json({
      success: true,
      message: `Booking for ${booking.destinationName} confirmed! Notification email sent to ${booking.userEmail}.`
    });
  } catch (err) {
    console.error('Confirm booking error:', err);
    res.status(500).json({ success: false, message: 'Server error while confirming booking.' });
  }
});

// GET /bookings — Admin: all bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await req.db.collection('bookings').find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// GET /my-bookings — User's own bookings (JWT cookie or email query param)
router.get('/my-bookings', async (req, res) => {
  try {
    let userEmail = null;
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userEmail = decoded.email;
      } catch (e) { /* token expired or invalid */ }
    }

    if (!userEmail && req.query.email) {
      userEmail = String(req.query.email).trim().toLowerCase();
    }

    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Authentication required to view your bookings' });
    }

    const bookings = await req.db.collection('bookings')
      .find({ userEmail: userEmail.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Fetch user bookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user bookings' });
  }
});

// PATCH /booking/cancel/:id or /booking/:id/cancel — Cancel a booking
router.patch(['/booking/cancel/:id', '/booking/:id/cancel'], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const collection = req.db.collection('bookings');

    let query = null;
    let booking = null;

    if (ObjectId.isValid(id)) {
      try {
        query = { _id: new ObjectId(id) };
        booking = await collection.findOne(query);
      } catch (e) { /* invalid ObjectId */ }
    }
    if (!booking) {
      query = { _id: id };
      booking = await collection.findOne(query);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    await collection.updateOne(query, {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Customer requested cancellation'
      }
    });

    res.json({
      success: true,
      message: `Reservation for ${booking.destinationName} has been cancelled successfully.`
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

module.exports = router;
