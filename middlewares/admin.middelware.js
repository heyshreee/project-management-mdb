require('dotenv').config();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const {ADMIN_SECRET_KEY} = require('../config/config')

// optional: rate limit admin requests
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts per minute
  message: { message: 'Too many requests, try again later.' },
});

const verifyAdmin = async (req, res, next) => {
  try {
    const adminKey = req.headers['x-admin'];
    if (!adminKey)
      return res.status(401).json({ message: 'Admin key missing' });

    // compare header key to hashed env key
    const match = await bcrypt.compare(adminKey, ADMIN_SECRET_KEY);
    if (!match)
      return res.status(403).json({ message: 'Access denied: Invalid admin key' });

    next(); // proceed
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyAdmin, adminLimiter };
