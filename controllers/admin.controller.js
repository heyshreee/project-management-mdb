require('dotenv').config();
const bcrypt = require('bcryptjs');
const { ADMIN_SECRET_KEY } = require('../config/config'); // hashed key

// Plain key submitted by admin → compare with hashed
const verifyAdminLogin = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: 'Admin key required' });

    const match = await bcrypt.compare(key, ADMIN_SECRET_KEY);
    if (!match) return res.status(403).json({ message: 'Invalid admin key' });

    res.status(200).json({ message: 'Verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { verifyAdminLogin };
