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

  const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  const fallback = isLocal ? 'http://localhost:5000' : '';

  window.API_BASE = (fromWindow || fromMeta || fallback).replace(/\/$/, '');
})();
