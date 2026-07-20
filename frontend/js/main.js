/**
 * Shared public-site UI: nav, reveal, typewriter, project cards.
 */
(function () {
  /* ---- Mobile nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Active nav link ---- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a[data-nav]').forEach((a) => {
    const key = a.getAttribute('data-nav');
    if (
      (key === 'home' && (path === '' || path === 'index.html')) ||
      (key === 'about' && path === 'about.html') ||
      (key === 'work' && (path === 'work.html' || path === 'work-single.html')) ||
      (key === 'contact' && path === 'contact.html')
    ) {
      a.classList.add('active');
    }
  });

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---- Typewriter ---- */
  const typeEl = document.querySelector('[data-typewriter]');
  if (typeEl) {
    let phrases = [];
    try {
      phrases = JSON.parse(typeEl.getAttribute('data-typewriter') || '[]');
    } catch {
      phrases = [];
    }
    if (!phrases.length) {
      phrases = ['Full-stack developer', 'Web3 builder', 'Fintech engineer'];
    }

    const textNode = typeEl.querySelector('.tw-text') || typeEl;
    let pi = 0;
    let ci = 0;
    let deleting = false;

    function tick() {
      const current = phrases[pi % phrases.length];
      if (!deleting) {
        ci += 1;
        textNode.textContent = current.slice(0, ci);
        if (ci >= current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
        setTimeout(tick, 55 + Math.random() * 40);
      } else {
        ci -= 1;
        textNode.textContent = current.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          pi += 1;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, 32);
      }
    }
    tick();
  }

  /* ---- Helpers exposed ---- */
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(str, n = 140) {
    const s = String(str || '');
    if (s.length <= n) return s;
    return s.slice(0, n).trimEnd() + '…';
  }

  function projectCardHtml(p) {
    const id = p._id || p.id;
    const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : '';
    const tags = (p.tags || []).slice(0, 4);
    const media = img
      ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy" />`
      : `<div class="placeholder">// project</div>`;

    return `
      <a class="project-card reveal" href="work-single.html?id=${encodeURIComponent(id)}">
        <div class="project-card-media">${media}</div>
        <div class="project-card-body">
          <div class="tag-row">
            ${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(truncate(p.description, 150))}</p>
        </div>
      </a>
    `;
  }

  function showStatus(el, type, message) {
    if (!el) return;
    el.className = `form-status show ${type}`;
    el.textContent = message;
  }

  window.ui = {
    escapeHtml,
    truncate,
    projectCardHtml,
    showStatus,
  };
})();
