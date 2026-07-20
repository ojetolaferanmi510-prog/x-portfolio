const express = require('express');
const rateLimit = require('express-rate-limit');
const Message = require('../models/Message');
const { STATUSES } = require('../models/Message');
const { requireAuth } = require('../middleware/auth');
const { sendContactNotification } = require('../utils/email');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Try again later.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/messages  (public contact form)
 * honeypot field: website (must be empty)
 */
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const body = req.body || {};

    // Honeypot — bots fill hidden fields; humans leave empty
    if (body.website) {
      return res.status(201).json({ ok: true });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const projectType = String(body.projectType || '').trim();
    const budget = String(body.budget || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !projectType || !message) {
      return res.status(400).json({
        error: 'name, email, projectType, and message are required',
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const doc = await Message.create({
      name,
      email,
      projectType,
      budget,
      message,
      status: 'new',
    });

    // Fire-and-forget email; do not fail the request if notify fails
    sendContactNotification(doc).catch((err) => {
      console.error('[messages] notify failed:', err.message || err);
    });

    return res.status(201).json({
      ok: true,
      message: {
        id: doc._id,
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/messages  (admin)
 * query: status, archived=true|false
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = String(req.query.status);
    }

    if (req.query.archived === 'true') {
      filter.archived = true;
    } else if (req.query.archived === 'false') {
      filter.archived = false;
    } else {
      // default: hide archived
      filter.archived = false;
    }

    const messages = await Message.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/messages/:id  (admin)
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id).lean();
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /api/messages/:id  (admin) — status / archive / note
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const updates = {};

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return res.status(400).json({
          error: `status must be one of: ${STATUSES.join(', ')}`,
        });
      }
      updates.status = body.status;
    }

    if (body.archived !== undefined) {
      updates.archived = Boolean(body.archived);
    }

    if (body.adminNote !== undefined) {
      updates.adminNote = String(body.adminNote);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const message = await Message.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /api/messages/:id  (admin)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json({ ok: true, id: message._id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
