const { getDb } = require('../config/db');

/**
 * Middleware to ensure MongoDB is connected before processing requests.
 * Attaches the db instance to req.db for use in route handlers.
 */
const checkDb = (req, res, next) => {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connecting, please try again shortly.'
    });
  }
  req.db = db;
  next();
};

module.exports = checkDb;
