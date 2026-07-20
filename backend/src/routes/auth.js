const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

/**
 * POST /api/auth/login
 * body: { username, password }
 */
router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: admin.username },
      process.env.JWT_SECRET,
      {
        subject: String(admin._id),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );

    return res.json({
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
