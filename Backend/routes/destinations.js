const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// GET /national — All destinations
router.get('/national', async (req, res) => {
  try {
    const destination = await req.db.collection('destinations').find().toArray();
    res.json({ destination });
  } catch (err) {
    console.error('Fetch destinations error:', err);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// GET /topdest — Top 3 destinations (homepage)
router.get('/topdest', async (req, res) => {
  try {
    const destination = await req.db.collection('destinations').find().limit(3).toArray();
    res.json({ destination });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top destinations' });
  }
});

// POST /submit — Create new destination
router.post('/submit', async (req, res) => {
  try {
    const collection = req.db.collection('destinations');
    const newDestination = req.body;

    if (newDestination.price !== undefined) newDestination.price = Number(newDestination.price) || 0;
    if (newDestination.rating !== undefined) newDestination.rating = Number(newDestination.rating) || 4.8;
    if (newDestination.reviews !== undefined) newDestination.reviews = Number(newDestination.reviews) || 100;

    const result = await collection.insertOne(newDestination);
    res.status(201).json({
      success: true,
      message: 'Destination added successfully!',
      id: result.insertedId,
      destination: { ...newDestination, _id: result.insertedId }
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to add destination' });
  }
});

// GET /destination/:id — Single destination by ID or location
router.get('/destination/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = req.db.collection('destinations');
    let destination = null;

    if (ObjectId.isValid(id)) {
      try {
        destination = await collection.findOne({ _id: new ObjectId(id) });
      } catch (e) { /* invalid ObjectId representation */ }
    }
    if (!destination) {
      destination = await collection.findOne({ _id: id });
    }
    if (!destination) {
      destination = await collection.findOne({ location: decodeURIComponent(id) });
    }
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    res.json({ success: true, destination });
  } catch (err) {
    console.error('Get destination error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch destination' });
  }
});

// DELETE /destination/:id — Remove destination
router.delete('/destination/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = req.db.collection('destinations');

    let result = { deletedCount: 0 };
    if (ObjectId.isValid(id)) {
      try {
        result = await collection.deleteOne({ _id: new ObjectId(id) });
      } catch (e) { /* invalid ObjectId */ }
    }
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ _id: id });
    }
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ location: decodeURIComponent(id) });
    }
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (err) {
    console.error('Delete destination error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete destination' });
  }
});

module.exports = router;
