const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

// POST /signup — Register a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const collection = req.db.collection('users');
    const existingUser = await collection.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role || 'user';

    const newUser = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId, name: cleanName, email: cleanEmail, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: result.insertedId, name: cleanName, email: cleanEmail, role: userRole }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /signin — Authenticate existing user
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const collection = req.db.collection('users');
    const user = await collection.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userRole = user.role || 'user';

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Sign in successful',
      user: { id: user._id, name: user.name, email: user.email, role: userRole }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ success: false, message: 'Server error during signin' });
  }
});

// POST /logout — Clear auth cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /me — Get current authenticated user from JWT cookie
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
