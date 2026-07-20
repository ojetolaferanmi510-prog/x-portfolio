const express = require('express');
const Project = require('../models/Project');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/stats
 */
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const [totalProjects, featuredProjects, totalMessages, newMessages, inReview] =
      await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ featured: true }),
        Message.countDocuments({ archived: false }),
        Message.countDocuments({ status: 'new', archived: false }),
        Message.countDocuments({ status: 'in_review', archived: false }),
      ]);

    return res.json({
      stats: {
        totalProjects,
        featuredProjects,
        totalMessages,
        newMessages,
        inReview,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
