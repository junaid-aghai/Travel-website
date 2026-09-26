const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'travelkro_secret_key_123';

/**
 * Middleware to verify JWT token from httpOnly cookie.
 * Attaches decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { verifyToken, JWT_SECRET };
