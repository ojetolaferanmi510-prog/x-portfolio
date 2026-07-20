function notFound(req, res, next) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({ error: messages.join(', ') || 'Validation failed' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key' });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
