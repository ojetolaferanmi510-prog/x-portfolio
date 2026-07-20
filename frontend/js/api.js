/**
 * Thin fetch wrapper around the portfolio API.
 */
(function () {
  function base() {
    return window.API_BASE || '';
  }

  async function request(path, options = {}) {
    const url = `${base()}${path}`;
    const headers = Object.assign({}, options.headers || {});

    if (options.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.json);
      delete options.json;
    }

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
      delete options.token;
    }

    const res = await fetch(url, { ...options, headers });
    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || res.statusText || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  window.api = {
    getProjects(params = {}) {
      const q = new URLSearchParams();
      if (params.tag) q.set('tag', params.tag);
      if (params.featured === true) q.set('featured', 'true');
      if (params.featured === false) q.set('featured', 'false');
      const qs = q.toString();
      return request(`/api/projects${qs ? `?${qs}` : ''}`);
    },

    getProject(id) {
      return request(`/api/projects/${encodeURIComponent(id)}`);
    },

    createProject(body, token) {
      return request('/api/projects', { method: 'POST', json: body, token });
    },

    updateProject(id, body, token) {
      return request(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        json: body,
        token,
      });
    },

    deleteProject(id, token) {
      return request(`/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
      });
    },

    sendMessage(body) {
      return request('/api/messages', { method: 'POST', json: body });
    },

    getMessages(params = {}, token) {
      const q = new URLSearchParams();
      if (params.status) q.set('status', params.status);
      if (params.archived === true) q.set('archived', 'true');
      if (params.archived === false) q.set('archived', 'false');
      const qs = q.toString();
      return request(`/api/messages${qs ? `?${qs}` : ''}`, { token });
    },

    getMessage(id, token) {
      return request(`/api/messages/${encodeURIComponent(id)}`, { token });
    },

    patchMessage(id, body, token) {
      return request(`/api/messages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        json: body,
        token,
      });
    },

    deleteMessage(id, token) {
      return request(`/api/messages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token,
      });
    },

    login(username, password) {
      return request('/api/auth/login', {
        method: 'POST',
        json: { username, password },
      });
    },

    getStats(token) {
      return request('/api/admin/stats', { token });
    },

    async uploadImage(file, token, folder) {
      const fd = new FormData();
      fd.append('image', file);
      if (folder) fd.append('folder', folder);
      return request('/api/upload', {
        method: 'POST',
        body: fd,
        token,
      });
    },
  };
})();
