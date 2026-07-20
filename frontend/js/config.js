/**
 * API base URL.
 * - Local static server (Live Server :5500): points at Express on :5000
 * - Override anytime: window.__API_BASE__ = 'https://your-api.onrender.com'
 * - Or set <meta name="api-base" content="https://..."> in HTML
 */
(function () {
  const meta = document.querySelector('meta[name="api-base"]');
  const fromMeta = meta && meta.content ? meta.content.trim() : '';
  const fromWindow =
    typeof window.__API_BASE__ === 'string' ? window.__API_BASE__.trim() : '';

  const host = location.hostname;
  const isLocal =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    location.protocol === 'file:';

  // Prefer explicit overrides; local dev falls back to Express on :5000
  let base = fromWindow || fromMeta || (isLocal ? 'http://localhost:5000' : '');

  // Strip trailing slash so paths like /api/... join cleanly
  base = String(base || '').replace(/\/+$/, '');

  window.API_BASE = base;
})();
