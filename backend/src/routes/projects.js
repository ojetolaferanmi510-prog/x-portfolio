const express = require('express');
const Project = require('../models/Project');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * GET /api/projects
 * query: tag, featured=true|false
 */
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.tag) {
      filter.tags = String(req.query.tag).trim();
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    } else if (req.query.featured === 'false') {
      filter.featured = false;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ projects });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ project });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /api/projects  (admin)
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const project = await Project.create({
      title: body.title,
      description: body.description,
      images: parseList(body.images),
      tags: parseList(body.tags),
      techStack: parseList(body.techStack),
      liveUrl: body.liveUrl || '',
      githubUrl: body.githubUrl || '',
      featured: Boolean(body.featured),
    });
    return res.status(201).json({ project });
  } catch (err) {
    return next(err);
  }
});

/**
 * PUT /api/projects/:id  (admin)
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const updates = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.images !== undefined) updates.images = parseList(body.images);
    if (body.tags !== undefined) updates.tags = parseList(body.tags);
    if (body.techStack !== undefined) updates.techStack = parseList(body.techStack);
    if (body.liveUrl !== undefined) updates.liveUrl = body.liveUrl || '';
    if (body.githubUrl !== undefined) updates.githubUrl = body.githubUrl || '';
    if (body.featured !== undefined) updates.featured = Boolean(body.featured);

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /api/projects/:id  (admin)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ ok: true, id: project._id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
