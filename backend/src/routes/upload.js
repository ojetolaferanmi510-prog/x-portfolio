const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadBuffer, isConfigured } = require('../utils/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    return cb(null, true);
  },
});

/**
 * POST /api/upload  (admin)
 * multipart field name: image
 * optional body: folder
 */
router.post('/', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      err.status = err instanceof multer.MulterError ? 400 : 400;
      return next(err);
    }

    try {
      if (!isConfigured()) {
        return res.status(503).json({ error: 'Cloudinary is not configured' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'image file is required (field name: image)' });
      }

      const result = await uploadBuffer(req.file.buffer, {
        folder: req.body.folder || undefined,
      });

      return res.status(201).json({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    } catch (e) {
      return next(e);
    }
  });
});

module.exports = router;
