require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const checkDb = require('./middleware/checkDb');

// Route modules
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');

const app = express();
const port = process.env.PORT || 8080;

// --- CORS Configuration ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// --- Database readiness middleware (attaches req.db) ---
app.use(checkDb);

// --- Mount Routes ---
app.use(destinationRoutes);
app.use(bookingRoutes);
app.use(authRoutes);
app.use(reviewRoutes);

// --- Initialize DB & Start Server ---
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`TravelKro server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
