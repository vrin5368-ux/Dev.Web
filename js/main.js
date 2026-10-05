(function () {
  'use strict';

  // ---------- Nav bar enhancement: chevrons, inner wrap ----------
  document.querySelectorAll('.nav-item').forEach((item) => {
    const mega = item.querySelector('.mega');
    const link = item.querySelector('a');
    if (!mega) {
      return;
    }

    // chevron
    if (link && !link.querySelector('.nav-chevron')) {
      link.insertAdjacentHTML(
        'beforeend',
        '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
      );
    }

    // wrap groups in .mega-inner
    if (!mega.querySelector('.mega-inner')) {
      const inner = document.createElement('div');
      inner.className = 'mega-inner';
      [...mega.children].forEach((child) => inner.appendChild(child));
      mega.appendChild(inner);
    }
    let closeTimer;
    const open = () => {
      clearTimeout(closeTimer);
      item.classList.add('open');
      // Keep the panel fully inside the visible viewport (with a side margin)
      const EDGE = 24;
      const viewW = document.documentElement.clientWidth; // excludes scrollbar
      mega.classList.remove('mega--right');
      mega.style.marginLeft = '';
      let rect = mega.getBoundingClientRect();
      if (rect.right > viewW - EDGE) {
        // right-align the panel to the nav item instead
        mega.classList.add('mega--right');
        rect = mega.getBoundingClientRect();
      }
      // final safety clamp for very narrow desktop widths
      if (rect.left < EDGE) {
        mega.style.marginLeft = EDGE - rect.left + 'px';
      } else if (rect.right > viewW - EDGE) {
        mega.style.marginLeft = viewW - EDGE - rect.right + 'px';
      }
    };
    const close = () => {
      closeTimer = setTimeout(() => item.classList.remove('open'), 150);
    };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    link.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        document.querySelectorAll('.nav-item.open').forEach((o) => {
          if (o !== item) o.classList.remove('open');
        });
        item.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach((o) => o.classList.remove('open'));
    }
  });

  // Header gets a shadow + shrinks once the page scrolls
  const mainHeader = document.querySelector('header.main-header');
  function updateHeaderScroll() {
    if (!mainHeader) return;
    mainHeader.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  // Mobile nav drawer
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileClose = document.getElementById('mobileClose');

  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.classList.add('nav-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }
  menuToggle.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // Mobile accordion
  document.querySelectorAll('.mobile-acc-head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.closest('.mobile-acc-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.mobile-acc-item.open').forEach((i) => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Close drawer on resize back to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMobileNav();
  });

  // ---------- Global scroll-reveal animation for every section ----------
  (function () {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Section headings + intros fade up (hero content is handled separately below)
    document.querySelectorAll('.section-head').forEach((el) => {
      el.classList.add('reveal');
    });

    // Staggered card grids
    const groups = [
      '.quick-grid > .quick-card',
      '.stats-grid > .stat-cell',
      '.help-grid > .help-card',
      '.pathway-scroll > .pathway-card',
      '.commons-grid > .commons-card',
      '.news-grid > .news-card',
      '.footer-grid > .footer-col',
    ];
    groups.forEach((sel) => {
      const items = document.querySelectorAll(sel);
      items.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--rd', Math.min(i * 0.08, 0.5) + 's');
      });
    });

    // Split sections: alternate slide-in-left / slide-in-right for direct children
    document.querySelectorAll('.split-grid').forEach((grid) => {
      const kids = [...grid.children];
      kids.forEach((el, i) => {
        el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );

    document
      .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => io.observe(el));

    // Hero content: staggered load-in animation (runs once on page load, not scroll-based)
    document.querySelectorAll('.hero-inner > *').forEach((el, i) => {
      el.classList.add('hero-anim');
      el.style.setProperty('--hd', i * 0.12 + 's');
    });
  })();
})();