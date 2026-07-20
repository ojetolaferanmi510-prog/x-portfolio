/**
 * Admin auth helpers (JWT in localStorage).
 */
(function () {
  const KEY = 'portfolio_admin_token';
  const USER_KEY = 'portfolio_admin_user';

  function getToken() {
    return localStorage.getItem(KEY) || '';
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function setSession(token, admin) {
    localStorage.setItem(KEY, token);
    if (admin) localStorage.setItem(USER_KEY, JSON.stringify(admin));
  }

  function clearSession() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  }

  function requireAuth() {
    const token = getToken();
    if (!token) {
      location.href = 'index.html';
      return null;
    }
    return token;
  }

  function logout() {
    clearSession();
    location.href = 'index.html';
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(iso);
    }
  }

  function statusBadge(status) {
    const s = String(status || 'new');
    return `<span class="badge ${ui.escapeHtml(s)}">${ui.escapeHtml(
      s.replace('_', ' ')
    )}</span>`;
  }

  window.adminAuth = {
    getToken,
    getUser,
    setSession,
    clearSession,
    requireAuth,
    logout,
    fmtDate,
    statusBadge,
  };
})();
