const express = require('express');
const router = express.Router();

// GET /reviews or /testimonials — Fetch all reviews
router.get(['/reviews', '/testimonials'], async (req, res) => {
  try {
    const reviews = await req.db.collection('reviews').find().sort({ createdAt: -1 }).toArray();
    res.json({ success: true, reviews, testimonials: reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// POST /reviews, /review, or /testimonial — Submit a new review
router.post(['/reviews', '/review', '/testimonial'], async (req, res) => {
  try {
    const { name, role, destination, comment, rating, avatar, storyImage } = req.body;

    if (!name || !destination || !comment) {
      return res.status(400).json({ success: false, message: 'Name, destination, and comment are required.' });
    }

    const newReview = {
      name,
      role: role || 'Traveler',
      destination,
      comment,
      rating: Number(rating) || 5,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      storyImage: storyImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date()
    };

    const result = await req.db.collection('reviews').insertOne(newReview);
    const createdItem = { ...newReview, _id: result.insertedId };

    res.status(201).json({
      success: true,
      message: 'Thank you for your review!',
      review: createdItem,
      testimonial: createdItem
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

module.exports = router;
