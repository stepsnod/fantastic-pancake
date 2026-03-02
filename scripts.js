/* ═══════════════════════════════════════════════════════════════
   STUDIO SAN FRANCISCO — scripts.js
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';


  /* ═══════════════════════════════════════════════════════════════
     1. QUICK-START FLOW
     ═══════════════════════════════════════════════════════════════ */

  var currentFlow = '';

  // Calendly URLs per flow
  var CALENDLY_URLS = {
    walkthrough: 'https://calendly.com/thestudiosf/plan?text_color=004655&primary_color=00c6ff',
    launch: 'https://calendly.com/thestudiosf/2hr-intro-launch?text_color=004655&primary_color=00c6ff'
  };

  // DOM refs — steps
  var step1 = document.getElementById('quickStartStep1');
  var step2 = document.getElementById('quickStartStep2');
  var step3 = document.getElementById('quickStartStep3');

  // DOM refs — forms
  var walkthroughForm = document.getElementById('walkthroughForm');
  var launchForm = document.getElementById('launchForm');

  // DOM refs — Calendly & navigation
  var calendlyEmbed = document.getElementById('calendlyEmbed');
  var backToStartBtn = document.getElementById('backToStart');
  var quickStartSection = document.getElementById('quick-start');

  // All quick-start accordion cards
  var quickStartCards = document.querySelectorAll('.qs-accordion-card');


  // ── Accordion interaction ──────────────────────────────────────

  quickStartCards.forEach(function (card) {
    var header = card.querySelector('.qs-accordion-header');
    var body = card.querySelector('.qs-accordion-body');
    var nextBtn = card.querySelector('.card-next');

    // Click header → expand / collapse
    header.addEventListener('click', function (e) {
      // Ignore if clicking the Next button
      if (e.target.classList.contains('card-next') || e.target.closest('.card-next')) return;

      if (card.classList.contains('is-expanded')) {
        card.classList.remove('is-expanded');
        header.setAttribute('aria-expanded', 'false');
        body.setAttribute('aria-hidden', 'true');
      } else {
        // Collapse all others first, then expand this one
        quickStartCards.forEach(function (c) {
          c.classList.remove('is-expanded');
          var h = c.querySelector('.qs-accordion-header');
          var b = c.querySelector('.qs-accordion-body');
          if (h) h.setAttribute('aria-expanded', 'false');
          if (b) b.setAttribute('aria-hidden', 'true');
        });
        card.classList.add('is-expanded');
        header.setAttribute('aria-expanded', 'true');
        body.setAttribute('aria-hidden', 'false');
      }
    });

    // Keyboard: Enter / Space to toggle
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });

    // Next button → proceed to Step 2
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        var flow = card.getAttribute('data-flow');
        currentFlow = flow;

        if (flow === 'walkthrough') {
          showStep2('walkthrough');
        } else {
          showStep2('launch');
        }
      });
    }
  });

  // ESC → collapse all accordion cards
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      quickStartCards.forEach(function (c) {
        c.classList.remove('is-expanded');
        var h = c.querySelector('.qs-accordion-header');
        var b = c.querySelector('.qs-accordion-body');
        if (h) h.setAttribute('aria-expanded', 'false');
        if (b) b.setAttribute('aria-hidden', 'true');
      });
    }
  });


  // ── Step transitions ───────────────────────────────────────────

  function fadeOut(el, callback) {
    el.style.opacity = '0';
    setTimeout(function () {
      el.style.display = 'none';
      if (callback) callback();
    }, 400);
  }

  function fadeIn(el) {
    el.style.display = 'block';
    // Force reflow so the browser registers display:block before opacity transition
    void el.offsetWidth;
    setTimeout(function () {
      el.style.opacity = '1';
    }, 30);
  }

  function showStep2(flow) {
    // Configure which form to show
    if (flow === 'walkthrough') {
      walkthroughForm.style.display = 'block';
      launchForm.style.display = 'none';
    } else {
      walkthroughForm.style.display = 'none';
      launchForm.style.display = 'block';
    }

    // Fade out Step 1, fade in Step 2
    fadeOut(step1, function () {
      fadeIn(step2);
      step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function showStep3() {
    var url = CALENDLY_URLS[currentFlow] || CALENDLY_URLS.walkthrough;

    // Clear any previous embed
    calendlyEmbed.innerHTML = '';

    // Set container height BEFORE initializing so Calendly iframe fills it
    calendlyEmbed.style.minHeight = '700px';
    calendlyEmbed.style.height = '700px';

    // Use Calendly API if available (script already loaded in HTML)
    if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: calendlyEmbed,
        prefill: {},
        utm: {}
      });

      // Ensure the iframe Calendly creates fills the container
      setTimeout(function () {
        var iframe = calendlyEmbed.querySelector('iframe');
        if (iframe) {
          iframe.style.height = '100%';
          iframe.style.minHeight = '700px';
          iframe.style.width = '100%';
          iframe.style.border = 'none';
        }
      }, 100);
    } else {
      // Fallback: create widget div and load script
      calendlyEmbed.innerHTML = '<div class="calendly-inline-widget" data-url="' + url + '" style="min-width:320px;height:700px;"></div>';
      var script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Fade out Step 2, fade in Step 3
    fadeOut(step2, function () {
      fadeIn(step3);
      step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function resetToStep1() {
    // Hide steps 2 and 3
    step2.style.opacity = '0';
    step2.style.display = 'none';
    step3.style.opacity = '0';
    step3.style.display = 'none';

    // Clear Calendly embed
    calendlyEmbed.innerHTML = '';

    // Collapse all accordion cards
    quickStartCards.forEach(function (c) {
      c.classList.remove('is-expanded');
      var h = c.querySelector('.qs-accordion-header');
      var b = c.querySelector('.qs-accordion-body');
      if (h) h.setAttribute('aria-expanded', 'false');
      if (b) b.setAttribute('aria-hidden', 'true');
    });

    // Reset forms
    if (walkthroughForm) walkthroughForm.reset();
    if (launchForm) launchForm.reset();

    // Reset any submit button states + clear validation
    [walkthroughForm, launchForm].forEach(function (form) {
      if (!form) return;
      var btn = form.querySelector('.intake-submit-btn');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Submit and Schedule Now \u2192';
        btn.classList.remove('btn-error', 'btn-success');
      }
      form.querySelectorAll('.field-error').forEach(function (el) {
        el.classList.remove('field-error');
      });
    });

    // Show Step 1
    step1.style.display = 'block';
    void step1.offsetWidth;
    step1.style.opacity = '1';

    // Reset flow state
    currentFlow = '';

    // Scroll back to quick-start
    if (quickStartSection) {
      quickStartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }


  // ── Back buttons ───────────────────────────────────────────────

  document.querySelectorAll('.back-btn, .intake-back-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      fadeOut(step2, function () {
        // Reset the form that was visible
        if (walkthroughForm) walkthroughForm.reset();
        if (launchForm) launchForm.reset();

        // Show Step 1 again
        step1.style.display = 'block';
        void step1.offsetWidth;
        step1.style.opacity = '1';

        if (quickStartSection) {
          quickStartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  });

  // Start Over button (from Calendly step)
  if (backToStartBtn) {
    backToStartBtn.addEventListener('click', resetToStep1);
  }


  // ── Form submission (handled by section 13 — Form Validation) ──


  /* ═══════════════════════════════════════════════════════════════
     2. THEME TOGGLE
     ═══════════════════════════════════════════════════════════════ */

  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var themeToggleDesktop = document.getElementById('themeToggleDesktop');
  var themeFab = document.getElementById('themeFab');
  var THEME_KEY = 'empowerTheme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var isLight = theme === 'light';

    // Update all toggle buttons
    [themeToggle, themeToggleDesktop, themeFab].forEach(function (btn) {
      if (!btn) return;
      btn.setAttribute('aria-checked', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });

    // Update FAB icon
    if (themeFab) {
      var icon = themeFab.querySelector('.theme-fab-icon');
      if (icon) icon.textContent = isLight ? '\u2600\uFE0E' : '\u263E';
    }
  }

  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* no-op */ }
    applyTheme(next);
  }

  // Initialize theme from localStorage
  var storedTheme = null;
  try { storedTheme = localStorage.getItem(THEME_KEY); } catch (_) { /* no-op */ }
  applyTheme(storedTheme === 'light' ? 'light' : 'dark');

  // Bind toggle handlers
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeToggleDesktop) themeToggleDesktop.addEventListener('click', toggleTheme);
  if (themeFab) themeFab.addEventListener('click', toggleTheme);


  /* ═══════════════════════════════════════════════════════════════
     3. SIDEBAR
     ═══════════════════════════════════════════════════════════════ */

  var body = document.body;
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('backdrop');
  var menuFab = document.getElementById('menuFab');
  var closeSidebarBtn = document.getElementById('closeSidebar');
  var SIDEBAR_KEY = 'empowerSidebar';

  function isMobileNav() {
    return window.matchMedia('(max-width: 980px)').matches;
  }

  function setScrollLock(lock) {
    body.classList.toggle('noscroll', !!lock);
  }

  function openSidebar(opts) {
    opts = opts || {};
    var lockScroll = (typeof opts.lockScroll === 'boolean') ? opts.lockScroll : isMobileNav();
    body.classList.add('sidebar-open');
    setScrollLock(lockScroll);
    if (opts.persist !== false) {
      try { localStorage.setItem(SIDEBAR_KEY, 'open'); } catch (_) { /* no-op */ }
    }
    if (closeSidebarBtn) closeSidebarBtn.focus();
  }

  function closeSidebar(opts) {
    opts = opts || {};
    body.classList.remove('sidebar-open');
    setScrollLock(false);
    if (opts.persist !== false) {
      try { localStorage.setItem(SIDEBAR_KEY, 'closed'); } catch (_) { /* no-op */ }
    }
    if (menuFab) menuFab.focus();
  }

  // Default sidebar state (closed on first visit)
  (function () {
    var saved = null;
    try { saved = localStorage.getItem(SIDEBAR_KEY); } catch (_) { /* no-op */ }
    var shouldOpen = saved === 'open';
    if (shouldOpen) {
      openSidebar({ persist: false });
    } else {
      closeSidebar({ persist: false });
    }
  })();

  if (menuFab) menuFab.addEventListener('click', function () { openSidebar(); });
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', function () { closeSidebar(); });
  if (backdrop) backdrop.addEventListener('click', function () { closeSidebar(); });

  // Keep scroll lock correct on resize
  window.addEventListener('resize', function () {
    if (!body.classList.contains('sidebar-open')) return;
    setScrollLock(isMobileNav());
  }, { passive: true });

  // Close sidebar on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
      closeSidebar();
    }
  });


  /* ═══════════════════════════════════════════════════════════════
     4. NAVIGATION
     ═══════════════════════════════════════════════════════════════ */

  // ── Smooth scroll for anchor links ─────────────────────────────

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        // Close sidebar if open (for mobile nav links)
        closeSidebar();
        var offset = 90; // Account for fixed topbar
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Active nav highlighting on scroll ──────────────────────────

  var navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"], .topnav a[href^="#"]'));
  var navSections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  var navTicking = false;

  function setActiveNav() {
    var scrollY = window.scrollY + 120;
    var currentId = navSections.length ? navSections[0].id : null;

    navSections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var target = link.getAttribute('href');
      if (target) target = target.slice(1);
      if (target === currentId) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    navTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!navTicking) {
      window.requestAnimationFrame(setActiveNav);
      navTicking = true;
    }
  }, { passive: true });
  window.addEventListener('load', setActiveNav);

  // ── Desktop topbar auto-hide ───────────────────────────────────

  var topbar = document.getElementById('topbar');
  var lastScrollY = 0;
  var scrollTicking = false;
  var SCROLL_THRESHOLD = 100;

  function updateTopbarVisibility() {
    var currentScroll = window.pageYOffset;

    if (currentScroll <= SCROLL_THRESHOLD) {
      if (topbar) topbar.classList.remove('topbar-hidden');
    } else if (currentScroll > lastScrollY && currentScroll > SCROLL_THRESHOLD) {
      // Scrolling down — hide
      if (topbar) topbar.classList.add('topbar-hidden');
    } else if (currentScroll < lastScrollY) {
      // Scrolling up — show
      if (topbar) topbar.classList.remove('topbar-hidden');
    }

    lastScrollY = currentScroll;
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking && window.innerWidth > 900) {
      window.requestAnimationFrame(updateTopbarVisibility);
      scrollTicking = true;
    }
  }, { passive: true });

  // ── Anchor offset for sticky header ────────────────────────────

  function setAnchorOffset() {
    var offset = 24;
    if (topbar) {
      var styles = getComputedStyle(topbar);
      var visible = styles.display !== 'none' && styles.visibility !== 'hidden' && topbar.offsetHeight > 0;
      if (visible) {
        offset = topbar.offsetHeight + 16;
      }
    }
    root.style.setProperty('--anchor-offset', offset + 'px');
  }

  setAnchorOffset();
  window.addEventListener('resize', setAnchorOffset, { passive: true });


  /* ═══════════════════════════════════════════════════════════════
     5. PHOTO GALLERY
     ═══════════════════════════════════════════════════════════════ */

  var photoFiles = [
    'images/studio-1.jpg',
    'images/studio-2.jpg',
    'images/studio-3.jpg',
    'images/studio-4.jpg',
    'images/studio-5.jpg',
    'images/studio-6.jpg',
    'images/studio-7.jpg',
    'images/studio-8.jpg',
    'images/studio-9.jpg',
    'images/studio-10.jpg',
    'images/studio-11.jpg',
    'images/studio-12.jpg',
    'images/studio-13.jpg',
    'images/studio-14.jpg',
    'images/studio-15.jpg',
    'images/studio-16.jpg',
    'images/studio-17.jpg',
    'images/studio-18.jpg'
  ];

  var altTexts = [
    'Studio San Francisco main recording room with instruments and mixing setup',
    'Studio control room with digital audio workstation and monitors',
    'Drum kit recording setup with microphone array',
    'Guitar and bass recording corner with amplifiers',
    'Vocal booth with professional microphone and pop filter',
    'Keyboard workstation and MIDI controller setup',
    'Studio lounge area for breaks and creative discussion',
    'Equipment rack with audio interfaces and preamps',
    'Wide shot of the studio space with lighting and seating',
    'Close-up of studio microphones and stands ready for tracking',
    'Mix position view with nearfield monitors and acoustic treatment',
    'Bass and guitar gear wall with cases, pedals, and cables',
    'Live room setup for band rehearsal capture',
    'Headphone monitoring and cue mix station',
    'Engineer-led vocal tracking session at Studio San Francisco',
    'Artist working on a custom project in the Studio San Francisco recording space',
    'Full backline live room capture setup at Studio San Francisco',
    'Studio San Francisco recording environment in San Francisco Bay Area'
  ];

  var photoHero = document.getElementById('photoHero');
  var photoHeroImg = document.getElementById('photoHeroImg');
  var photoGrid = document.getElementById('photoGrid');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var lightboxCounter = document.getElementById('lightboxCounter');
  var currentPhotoIndex = 0;

  // Set hero photo and highlight active thumbnail
  function setHeroPhoto(index) {
    currentPhotoIndex = index;
    if (photoHeroImg) {
      photoHeroImg.src = photoFiles[index];
      photoHeroImg.alt = altTexts[index] || 'Studio San Francisco recording environment photo ' + (index + 1);
    }
    document.querySelectorAll('.photo-thumb').forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === index);
    });
  }

  // Lightbox controls
  function openLightbox(index) {
    currentPhotoIndex = index;
    if (lightboxImg) {
      lightboxImg.src = photoFiles[index];
      lightboxImg.alt = altTexts[index] || 'Studio San Francisco recording environment photo ' + (index + 1);
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = (index + 1) + ' / ' + photoFiles.length;
    }
    if (lightbox) lightbox.classList.add('active');
    body.classList.add('noscroll');
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('active');
    body.classList.remove('noscroll');
    var thumb = document.querySelector('.photo-thumb:nth-child(' + (currentPhotoIndex + 1) + ')');
    if (thumb) thumb.focus();
  }

  function showPrevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photoFiles.length) % photoFiles.length;
    if (lightboxImg) {
      lightboxImg.src = photoFiles[currentPhotoIndex];
      lightboxImg.alt = altTexts[currentPhotoIndex] || 'Studio San Francisco recording environment photo ' + (currentPhotoIndex + 1);
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentPhotoIndex + 1) + ' / ' + photoFiles.length;
    }
  }

  function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photoFiles.length;
    if (lightboxImg) {
      lightboxImg.src = photoFiles[currentPhotoIndex];
      lightboxImg.alt = altTexts[currentPhotoIndex] || 'Studio San Francisco recording environment photo ' + (currentPhotoIndex + 1);
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentPhotoIndex + 1) + ' / ' + photoFiles.length;
    }
  }

  // Hero photo click → open lightbox
  if (photoHero) {
    photoHero.addEventListener('click', function () { openLightbox(currentPhotoIndex); });
    photoHero.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(currentPhotoIndex);
      }
    });
  }

  // Lightbox buttons
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevPhoto);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextPhoto);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Lightbox keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevPhoto();
      if (e.key === 'ArrowRight') showNextPhoto();
    }
  });

  // Build thumbnail grid
  if (photoGrid) {
    photoFiles.forEach(function (src, i) {
      var thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.setAttribute('role', 'button');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', 'View studio photo ' + (i + 1));
      if (i === 0) thumb.classList.add('active');

      var img = document.createElement('img');
      img.src = src;
      img.alt = altTexts[i] || 'Studio San Francisco recording environment photo ' + (i + 1);
      img.loading = i < 3 ? 'eager' : 'lazy';

      thumb.appendChild(img);

      thumb.addEventListener('click', function () { setHeroPhoto(i); });
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setHeroPhoto(i);
        }
      });

      photoGrid.appendChild(thumb);
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     6. FAQ ACCORDION
     ═══════════════════════════════════════════════════════════════ */

  var faqList = document.getElementById('faqList');
  if (faqList) {
    var faqItems = Array.from(faqList.querySelectorAll('details.faq-item'));
    faqItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        // Close all other items
        faqItems.forEach(function (other) {
          if (other !== item) other.removeAttribute('open');
        });
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     7. BACK TO TOP
     ═══════════════════════════════════════════════════════════════ */

  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    var bttTicking = false;

    function updateBackToTop() {
      var scrolled = window.pageYOffset || document.documentElement.scrollTop;

      if (scrolled > 400) {
        backToTop.style.display = 'block';
        setTimeout(function () { backToTop.classList.add('visible'); }, 10);
      } else {
        backToTop.classList.remove('visible');
        setTimeout(function () {
          if (!backToTop.classList.contains('visible')) {
            backToTop.style.display = 'none';
          }
        }, 300);
      }
      bttTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!bttTicking) {
        requestAnimationFrame(updateBackToTop);
        bttTicking = true;
      }
    }, { passive: true });

    // Initial check
    updateBackToTop();
  }


  
  /* ═══════════════════════════════════════════════════════════════
     7b. TESTIMONIALS — HIDE REVIEWS + SCROLL TO SECTION TOP
     ═══════════════════════════════════════════════════════════════ */

  function scrollToSectionTop(targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;

    // Account for fixed header (desktop) so the section title isn't hidden.
    var topbar = document.getElementById('topbar');
    var offset = (topbar && topbar.offsetHeight ? topbar.offsetHeight : 0) + 16;

    var y = (window.pageYOffset || document.documentElement.scrollTop) + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  var hideReviewsBtn = document.getElementById('hideReviewsBtn');
  if (hideReviewsBtn) {
    hideReviewsBtn.addEventListener('click', function (e) {
      e.preventDefault();

      // Close the <details> container
      var details = hideReviewsBtn.closest('details');
      if (details) details.removeAttribute('open');

      // Update URL hash for shareable context
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#testimonials');
        } else {
          window.location.hash = '#testimonials';
        }
      } catch (_) { /* no-op */ }

      // After layout collapses, scroll to the top of the testimonials section.
      window.requestAnimationFrame(function () {
        scrollToSectionTop('testimonials');
      });
    });
  }

/* ═══════════════════════════════════════════════════════════════
     8. FOOTER — CURRENT YEAR
     ═══════════════════════════════════════════════════════════════ */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  // Also populate any class-based year spans (subpages)
  document.querySelectorAll('.js-year').forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });


  /* ═══════════════════════════════════════════════════════════════
     9. MOBILE CTA BAR
     ═══════════════════════════════════════════════════════════════ */

  var primaryCtaMobile = document.getElementById('primaryCtaMobile');
  if (primaryCtaMobile) {
    primaryCtaMobile.addEventListener('click', function (e) {
      e.preventDefault();
      var qs = document.getElementById('quick-start');
      if (qs) {
        var offset = 90;
        var targetPosition = qs.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
   10. SCROLL REVEAL (data-reveal / data-stagger)
   ═══════════════════════════════════════════════════════════════ */

(function initScrollReveal() {
  var htmlEl = document.documentElement;
  var revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (!revealEls.length) return;

  try {
    // Only enable reveal-hiding once we're ready to observe
    htmlEl.classList.add('reveal-ready');

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealEls.forEach(function (el) { revealObserver.observe(el); });

      // Safety: don't leave content hidden if the observer doesn't fire (edge cases / extensions)
      setTimeout(function () {
        revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
      }, 8000);
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
    }
  } catch (e) {
    console.warn('[Reveal] Disabled due to error:', e);
    htmlEl.classList.remove('reveal-ready');
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }
})();

/* ═══════════════════════════════════════════════════════════════
     11. PERSONA FILTER (Reference Pricing)
     ═══════════════════════════════════════════════════════════════ */

  var personaFilter = document.getElementById('personaFilter');
  if (personaFilter) {
    var personaBtns = personaFilter.querySelectorAll('.persona-btn');
    var menuGroups = document.querySelectorAll('#menuContent .menu-group');
    var menuItems = document.querySelectorAll('#menuContent .menu-item, #menuContent .menu-item-help');

    personaBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var persona = btn.getAttribute('data-persona');

        // Update active state
        personaBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Filter groups
        menuGroups.forEach(function (group) {
          var gp = group.getAttribute('data-persona') || group.getAttribute('data-personas') || '';
          if (gp.indexOf(persona) !== -1) {
            group.classList.remove('persona-hidden');
          } else {
            group.classList.add('persona-hidden');
          }
        });

        // Filter individual items within visible groups
        menuItems.forEach(function (item) {
          var ip = item.getAttribute('data-persona') || item.getAttribute('data-personas') || '';
          if (ip.indexOf(persona) !== -1) {
            item.classList.remove('persona-hidden');
          } else {
            item.classList.add('persona-hidden');
          }
        });
      });
    });

    // Trigger initial filter for the default active tab
    var activeBtn = personaFilter.querySelector('.persona-btn.active');
    if (activeBtn) activeBtn.click();
  }


  /* ═══════════════════════════════════════════════════════════════
     11b. OPEN PLAN INTAKE — scrolls to Quick-Start and opens
          the "Start with a Plan" walkthrough form
     ═══════════════════════════════════════════════════════════════ */

  function openPlanIntake() {
    var qsSection = document.getElementById('quick-start');
    if (!qsSection) return;
    // Scroll to quick-start
    var offset = 72;
    var top = qsSection.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
    // Expand the walkthrough card if not already expanded
    var walkthroughCard = document.querySelector('.qs-accordion-card[data-flow="walkthrough"]');
    if (walkthroughCard && !walkthroughCard.classList.contains('is-expanded')) {
      var wHeader = walkthroughCard.querySelector('.qs-accordion-header');
      if (wHeader) wHeader.click();
    }
    // After accordion opens, click the Next button to show the form
    setTimeout(function () {
      var nextBtn = walkthroughCard && walkthroughCard.querySelector('.card-next');
      if (nextBtn) nextBtn.click();
    }, 350);
  }

  // Asterisk buttons → open Plan intake
  document.querySelectorAll('.menu-asterisk').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openPlanIntake();
    });
  });

  // .open-plan-intake links → open Plan intake (also closes any open dialog first)
  document.querySelectorAll('.open-plan-intake').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelectorAll('.dialog-overlay.active').forEach(function (d) {
        closeDialog(d);
      });
      openPlanIntake();
    });
  });


  /* ═══════════════════════════════════════════════════════════════
     12. CURSOR GLOW + PARTICLE CONSTELLATION SYSTEM (Theme-Aware)
     ═══════════════════════════════════════════════════════════════ */

  // --- Cursor Glow (smooth lerp follow) ---
  var cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var glowMouseX = 0, glowMouseY = 0;
    var glowX = 0, glowY = 0;

    document.addEventListener('mousemove', function (e) {
      glowMouseX = e.clientX;
      glowMouseY = e.clientY;
    });

    function animateCursorGlow() {
      glowX += (glowMouseX - glowX) * 0.06;
      glowY += (glowMouseY - glowY) * 0.06;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateCursorGlow);
    }
    animateCursorGlow();
  }

  // --- Particle Constellation System ---
  var canvas = document.getElementById('particleCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ctx = canvas.getContext('2d');
    var constellationParticles = [];
    var constellationMouseX = -1000, constellationMouseY = -1000;

    // Theme detection
    function isLightTheme() {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }

    // Cyan for both themes
    function getParticleColor(opacity) {
      return 'rgba(0, 198, 255, ' + opacity + ')';
    }
    function getLineColor(opacity) {
      return 'rgba(0, 198, 255, ' + opacity + ')';
    }

    // Light mode needs stronger opacity to be visible
    function getOpacityMultiplier() {
      return isLightTheme() ? 3.5 : 1.0;
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      constellationParticles = [];
      var density = Math.min(90, Math.floor((canvas.width * canvas.height) / 16000));

      for (var i = 0; i < density; i++) {
        constellationParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.8 + 0.6,
          baseOpacity: Math.random() * 0.4 + 0.15
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var opacityMult = getOpacityMultiplier();

      for (var i = 0; i < constellationParticles.length; i++) {
        var p = constellationParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        var particleOpacity = p.baseOpacity * opacityMult;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = getParticleColor(particleOpacity);
        ctx.fill();

        // Connect nearby particles
        for (var j = i + 1; j < constellationParticles.length; j++) {
          var p2 = constellationParticles[j];
          var cdx = p.x - p2.x;
          var cdy = p.y - p2.y;
          var cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 120) {
            var lineOpacity = (0.12 * (1 - cdist / 120)) * opacityMult;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = getLineColor(lineOpacity);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Repel from cursor
        var rdx = constellationMouseX - p.x;
        var rdy = constellationMouseY - p.y;
        var rdist = Math.sqrt(rdx * rdx + rdy * rdy);

        if (rdist < 150 && rdist > 0) {
          var force = (150 - rdist) / 150;
          var pushStrength = force * force * 0.08;
          p.vx -= (rdx / rdist) * pushStrength;
          p.vy -= (rdy / rdist) * pushStrength;
        }

        // Damping (friction)
        p.vx *= 0.992;
        p.vy *= 0.992;

        // Speed limit
        var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) {
          p.vx = (p.vx / speed) * 3;
          p.vy = (p.vy / speed) * 3;
        }
      }

      requestAnimationFrame(drawParticles);
    }

    document.addEventListener('mousemove', function (e) {
      constellationMouseX = e.clientX;
      constellationMouseY = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
      constellationMouseX = -1000;
      constellationMouseY = -1000;
    });

    resizeCanvas();
    createParticles();
    drawParticles();

    var constellationResizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(constellationResizeTimeout);
      constellationResizeTimeout = setTimeout(function () {
        resizeCanvas();
        createParticles();
      }, 150);
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     13. FORM VALIDATION + NETLIFY FORMS SUBMISSION
     ═══════════════════════════════════════════════════════════════ */

  // Netlify Forms AJAX helper (keeps the single-page flow intact)
  // Follows Netlify's recommended pattern: FormData -> URLSearchParams string body.
  function submitNetlifyForm(formEl) {

    // ── Local environment guard ─────────────────────────────────────────────
    // Netlify Forms are processed on Netlify's edge servers — they CANNOT work
    // when opened from a local file, localhost, or any non-Netlify host.
    // Detect all common local/dev environments and fail fast with a clear message.
    var _proto = window.location.protocol;
    var _host  = window.location.hostname;
    var _isLocal = (
      _proto === 'file:'        ||   // opened directly from disk
      _host  === ''             ||   // no hostname
      _host  === 'localhost'    ||   // Node / Python / VS Code Live Server
      _host  === '127.0.0.1'   ||   // explicit loopback
      _host  === '0.0.0.0'     ||   // some dev servers bind here
      /^192\.168\./.test(_host) ||   // LAN / home network
      /^10\./.test(_host)       ||   // corporate / VPN private range
      /^172\.(1[6-9]|2\d|3[01])\./.test(_host)  // RFC-1918 range
    );
    if (_isLocal) {
      console.warn('[Netlify Forms] Cannot submit from a local environment. Deploy to Netlify first, then test at the live URL.');
      return Promise.reject(new Error('netlify-local'));
    }

    // ── Build the encoded body ──────────────────────────────────────────────
    var fd = new FormData(formEl);

    // Ensure form-name is present (Netlify requires this for AJAX submissions).
    if (!fd.get('form-name')) {
      var hiddenName = formEl.querySelector('input[name="form-name"]');
      fd.set('form-name', (hiddenName && hiddenName.value) || formEl.getAttribute('name') || '');
    }

    var encodedBody = new URLSearchParams(fd).toString();

    // ── POST to Netlify ─────────────────────────────────────────────────────
    return fetch('/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    encodedBody
    });
  }

  // Override default form submission with validation + Netlify AJAX
  [walkthroughForm, launchForm].forEach(function (form) {
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous error states
      form.querySelectorAll('.field-error').forEach(function (el) {
        el.classList.remove('field-error');
      });

      var submitBtn = form.querySelector('.intake-submit-btn');
      if (submitBtn) {
        submitBtn.classList.remove('btn-error', 'btn-success');
      }

      // Check required fields
      var isValid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (field.type === 'checkbox' && !field.checked) {
          isValid = false;
          var row = field.closest('.terms-row');
          if (row) row.classList.add('field-error');
        } else if (!field.value.trim()) {
          isValid = false;
          field.classList.add('field-error');
        }
      });

      if (!isValid) {
        if (submitBtn) {
          submitBtn.classList.add('btn-error');
          submitBtn.textContent = 'Please fill required fields';
          setTimeout(function () {
            submitBtn.classList.remove('btn-error');
            submitBtn.textContent = 'Submit and Schedule Now \u2192';
          }, 2000);
        }
        var firstError = form.querySelector('.field-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstError.focus();
        }
        return;
      }

      // Show submitting state
      var statusEl = form.querySelector('.form-status');
      if (statusEl) {
        statusEl.classList.remove('is-error', 'is-success');
        statusEl.textContent = 'Submitting\u2026';
      }

      submitNetlifyForm(form).then(function (res) {
        // Netlify Forms: on success, fetch follows Netlify's internal redirect
        // and lands on a 200 response. res.ok covers 200-299.
        // A 404 means the form was not registered by Netlify at deploy time.
        if (!res || !res.ok) {
          throw new Error('HTTP ' + (res ? res.status : 'no-response'));
        }

        // Green success state
        if (submitBtn) {
          submitBtn.classList.add('btn-success');
          submitBtn.textContent = 'Submitted! \u2713';
          submitBtn.disabled = true;
        }
        if (statusEl) {
          statusEl.classList.add('is-success');
          statusEl.textContent = 'Got it. Next: choose a time on the calendar below.';
        }

        // Proceed to Calendly after short delay
        setTimeout(function () {
          if (submitBtn) {
            submitBtn.classList.remove('btn-success');
            submitBtn.textContent = 'Submit and Schedule Now \u2192';
            submitBtn.disabled = false;
          }
          form.reset();
          showStep3();
        }, 650);
      }).catch(function (err) {
        console.warn('[Quick-Start] Submission failed:', err && err.message);

        var isLocalErr  = err && err.message === 'netlify-local';
        var is404       = err && err.message === 'HTTP 404';

        var btnText, statusMsg;

        if (isLocalErr) {
          btnText   = 'Deploy first \u2014 forms need Netlify';
          statusMsg = 'Form submissions only work on the deployed Netlify site. Open <strong>bookthestudiosf.com</strong> to test.';
        } else if (is404) {
          btnText   = 'Form not found \u2014 redeploy site';
          statusMsg = 'Netlify did not register this form. Redeploy the site so Netlify can scan the latest HTML, then try again.';
        } else {
          btnText   = 'Submission failed \u2014 try again';
          statusMsg = 'Something blocked the form submission. Please try again, or email <a href="mailto:hello@bookthestudiosf.com">hello@bookthestudiosf.com</a>.';
        }

        if (submitBtn) {
          submitBtn.classList.add('btn-error');
          submitBtn.textContent = btnText;
          setTimeout(function () {
            submitBtn.classList.remove('btn-error');
            submitBtn.textContent = 'Submit and Schedule Now \u2192';
          }, 4000);
        }
        if (statusEl) {
          statusEl.classList.add('is-error');
          statusEl.innerHTML = statusMsg;
        }
      });
    });

    // Clear error state on input
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('field-error')) {
        e.target.classList.remove('field-error');
      }
    });

    form.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox') {
        var row = e.target.closest('.terms-row');
        if (row) row.classList.remove('field-error');
      }
      if (e.target.classList.contains('field-error')) {
        e.target.classList.remove('field-error');
      }
    });
  });


  /* ── "Other" checkbox toggle for Plan form ──────────────────── */
  var otherCb = document.querySelector('input[name="plan_help[]"][value="other"]');
  var otherField = document.querySelector('input[name="plan_help_other"]');
  if (otherCb && otherField) {
    otherCb.addEventListener('change', function () {
      otherField.style.display = otherCb.checked ? 'block' : 'none';
      if (!otherCb.checked) otherField.value = '';
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     13b. STUDIO PLAYER (v5 — enhanced with testimonials)
     ═══════════════════════════════════════════════════════════════ */

  // ── TESTIMONIALS DATA ──────────────────────────────────────────
  var V5_TESTIMONIALS = [
    { author:"Azaria Mendoza",   quote:"\u201CWorking with Stephen on a music track for a film was absolutely seamless and joyous. Professional, fun, and encouraging \u2014 the speed and precision he brought was astounding.\u201D" },
    { author:"Audie Bethea",     quote:"\u201CStephen knows the space inside and out. Prompt setups for new ideas, professional solutions for every obstacle. He genuinely cares about the best sound, best take, and best result.\u201D" },
    { author:"Lizzie Waters",    quote:"\u201CI couldn\u2019t have asked for a better day in the studio. Low stress, super fun environment \u2014 without ever sacrificing productivity. I\u2019d recommend working with him in a heartbeat.\u201D" },
    { author:"Charles Malcolm",  quote:"\u201CStephen is great at working through the recording process efficiently while keeping the energy right. You leave with takes you\u2019re actually proud of. Professional, creative, and relaxed.\u201D" },
    { author:"Jack Frank",       quote:"\u201CStephen\u2019s studio gave my music live, spontaneous, raw energy. Every take feels like a performance. He\u2019s an enthusiastic audience and a skilled studio musician and engineer.\u201D" },
    { author:"Daniel Ward",      quote:"\u201CWelcoming, professional, incredibly organized. Keeps all our recording files dialed and up to date \u2014 huge for getting songs to their best version. Genuinely in great hands.\u201D" },
    { author:"Marina Ilyas",     quote:"\u201CFirst time in a studio and I was nervous. Stephen was so supportive it felt natural immediately. He patiently helped build on my vision and make it come to life.\u201D" },
    { author:"Daze Tenneti",     quote:"\u201CHelped my band record our first album, mixed it super tight, worked within our constraints. Great drummer, great studio, phenomenal photographer.\u201D" },
    { author:"Joseph Canas",     quote:"\u201CHis skill as a multi-instrumentalist and songwriter makes him a valuable creative partner. He has the humility to let artists work and the passion to put you in your most inspired state.\u201D" },
    { author:"Chine Emeahara",   quote:"\u201CIncredibly reliable, understands the assignment. Calm, collaborative energy \u2014 calling audibles on the fly. He makes every project run smoother.\u201D" },
    { author:"Shauvanna Kumar",  quote:"\u201CWe were nervous about recording our podcast. Stephen made us completely comfortable \u2014 calm, professional, and encouraging. It felt smooth and natural from the start.\u201D" },
    { author:"Manny LaCarrubba", quote:"\u201CSuper flexible and easy to work with. He pulled a great mix and made the whole session feel effortless \u2014 our band\u2019s first demo couldn\u2019t have gone better.\u201D" },
    { author:"Amine Mohamad",    quote:"\u201CWorking with Stephen was lots of fun \u2014 very enthusiastic and energetic. He has the knowledge to make high-quality recordings and run great jam sessions.\u201D" },
    { author:"Demian Ibarra",    quote:"\u201CStephen is a friend and a fellow musician. He offers his musicianship and gives you the space necessary to find the feel and sound you hear in your head.\u201D" }
  ];

  // ── TRACK DATA ─────────────────────────────────────────────────
  var spTracks = [
    'audio/May Queen (demo) - Charles Malcolm - 08 01 2024.mp3',
    'audio/Oh So What (LIVE) - Jack Frank - 06 20 2023.mp3',
    'audio/Waited Too Long (demo) - Joseph Anthony Canas - 03 22 2023.mp3',
    'audio/Holdin On (LIVE-acoustic) - Robert Halverson - 05 9 2023.mp3',
    'audio/Tour Bus - Burn Journal - 7 2 2025.mp3',
    'audio/Graveyard Dance (LIVE-acoustic) - Jake Pepp - 03 28 2023.mp3',
    'audio/Rocketship (LIVE) - Burn Journal - 02 07 2025.mp3',
    'audio/Revenge (LIVE) - Banned Margera - 07 24 2023.mp3',
    'audio/Perfect Days (won\'t last) (demo) - Demian Ibarra - 05 22 2025.mp3',
    'audio/My Observation (demo) - Amine Mohamad - 01 24 2024.mp3',
    'audio/Cry About It - Audie Bethea feat. Azaria Mendoza - 04 15 2025.mp3',
    'audio/Shorty Sax - feat. Gordon Ramos - 02 25 2023.mp3',
    'audio/Queen Snake - Audie Bethea feat. Lizzie Waters - 03 27 2025.mp3',
    'audio/Poetry (demo) - Marina Ilyas - 7 9 2023.mp3',
    'audio/IMPATIENTLY WAITING - 12 27 2025.mp3',
    'audio/Lost in my Mind - 08 14 2025.mp3',
    'audio/TO ME - 07 31 2024.mp3',
    'audio/Crazy for You - 01 13 2025.mp3',
    'audio/Call me - 12 28 2024.mp3',
    'audio/Moonlight One - 01 29 2025.mp3',
    'audio/Underwater (Stay with Me) - 04 26 2022.mp3',
    'audio/Soldier - 06 20 2024.mp3',
    'audio/About u - 05 02 2022.mp3',
    'audio/Plugged In - 10 27 2023.mp3',
    'audio/Otherside - 06 20 2024.mp3',
    'audio/Soldier On - 06 20 2024.mp3',
    'audio/WE WERE TOO - 09 10 2023.mp3',
    'audio/Three Minutes - 03 03 2022.mp3'
  ];

  var spNames = spTracks.map(function (p) { return p.replace('audio/', '').replace(/\.mp3$/i, ''); });

  // ── DOM REFS ───────────────────────────────────────────────────
  var spAudio    = document.getElementById('studioAudio');
  var spTitle    = document.getElementById('spTitle');
  var spSubEl    = document.getElementById('spSub');
  var spCounter  = document.getElementById('spCounter');
  var spPlaysEl  = document.getElementById('spPlays');
  var spErrorEl  = document.getElementById('spError');
  var spDisc     = document.getElementById('spDisc');
  var spPlay     = document.getElementById('spPlay');
  var spPrev     = document.getElementById('spPrev');
  var spNext     = document.getElementById('spNext');
  var spMute     = document.getElementById('spMute');
  var spVol      = document.getElementById('spVol');
  var spBar      = document.getElementById('spProgressBar');
  var spWrap     = document.getElementById('spProgressWrap');
  var spCur      = document.getElementById('spTimeCurrent');
  var spDur      = document.getElementById('spTimeDuration');

  // ── STATE ──────────────────────────────────────────────────────
  var spIdx      = 0;
  var spUserSetVolume = false; // prevents hero click from overriding user volume

  var spPlaying  = false;
  var spIdle     = true;  // true until user first interacts
  var spErrorTimeout = null;

  function spNextIdx(dir) {
    return (spIdx + dir + spTracks.length) % spTracks.length;
  }

  function spShufflePick() {
    if (spTracks.length <= 1) return 0;
    var n = spIdx;
    while (n === spIdx) n = Math.floor(Math.random() * spTracks.length);
    return n;
  }

  // ── PLAY COUNT TRACKING ────────────────────────────────────────
  var SP_COUNT_VERSION = '2';
  var spPlayCounts = {};
  try {
    if (localStorage.getItem('spCountVersion') !== SP_COUNT_VERSION) {
      localStorage.removeItem('spPlayCounts');
      localStorage.setItem('spCountVersion', SP_COUNT_VERSION);
    }
    spPlayCounts = JSON.parse(localStorage.getItem('spPlayCounts') || '{}');
  } catch (e) { spPlayCounts = {}; }
  var spPlayCounted = false;

  function spSaveCount(idx) {
    var key = spTracks[idx];
    spPlayCounts[key] = (spPlayCounts[key] || 0) + 1;
    try { localStorage.setItem('spPlayCounts', JSON.stringify(spPlayCounts)); } catch (e) {}
  }

  function spGetCount(idx) {
    return spPlayCounts[spTracks[idx]] || 0;
  }

  function spUpdatePlaysUI(idx) {
    var n = spGetCount(idx);
    var txt = n > 0 ? n + (n === 1 ? ' play' : ' plays') : '';
    if (spPlaysEl) spPlaysEl.textContent = txt;
    var miniPlays = document.getElementById('miniPlays');
    if (miniPlays) miniPlays.textContent = txt;
  }

  // ── SONG PARSER ────────────────────────────────────────────────
  var SP_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function spParseName(name) {
    var parts = name.split(' - ').map(function (s) { return s.trim(); });
    var title  = parts[0] || name;
    var artist = null;
    var dateStr = null;

    // Last part is always the date (MM DD YYYY)
    if (parts.length >= 2) {
      var last = parts[parts.length - 1];
      var dm = last.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/);
      if (dm) {
        var mo = parseInt(dm[1], 10) - 1;
        var day = parseInt(dm[2], 10);
        var yr = dm[3];
        var suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                     (day === 2 || day === 22) ? 'nd' :
                     (day === 3 || day === 23) ? 'rd' : 'th';
        dateStr = 'Recorded ' + SP_MONTHS[mo] + ' ' + day + suffix + ', ' + yr;
      }
    }

    // If 3+ parts, middle parts are artist; if 2 parts (title - date), no artist
    if (parts.length >= 3) {
      artist = parts.slice(1, -1).join(' \u2014 ');
    }

    return { title: title, artist: artist, date: dateStr, rest: null };
  }

  // ── MARQUEE ────────────────────────────────────────────────────
  function spApplyMarquee(container, inner) {
    if (!container || !inner) return;
    container.classList.remove('is-scrolling');
    var overflow = inner.scrollWidth - container.clientWidth;
    if (overflow > 6) {
      var dur = Math.max(6, Math.round(overflow / 28)) + 's';
      container.style.setProperty('--marquee-distance', '-' + overflow + 'px');
      container.style.setProperty('--marquee-dur', dur);
      setTimeout(function () { container.classList.add('is-scrolling'); }, 1200);
    }
  }

  function spCheckMarquee() {
    if (!spTitle) return;
    var inner = spTitle.querySelector('.sp-title-inner');
    spApplyMarquee(spTitle, inner);

    // Sub-line marquee
    if (spSubEl) {
      var subInner = spSubEl.querySelector('.sp-sub-inner');
      spApplyMarquee(spSubEl, subInner);
    }

    // Mini-player title marquee
    var miniTitle = document.getElementById('miniTitle');
    if (miniTitle) {
      var miniInner = miniTitle.querySelector('.mini-title-inner');
      spApplyMarquee(miniTitle, miniInner);
    }
  }

  function spFmt(s) {
    if (!s || !isFinite(s)) return '0:00';
    var m = Math.floor(s / 60);
    var sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // ── VOLUME FILL ────────────────────────────────────────────────
  function spUpdateVolFill(val) {
    if (spVol) spVol.style.setProperty('--vol-pct', (val * 100) + '%');
  }
  spUpdateVolFill(0.8);

  // ── WAKE FROM IDLE ─────────────────────────────────────────────
  function spWake() {
    if (!spIdle) return;
    spIdle = false;
    var parsed = spParseName(spNames[spIdx]);
    var inner = spTitle && spTitle.querySelector('.sp-title-inner');
    if (inner) inner.textContent = parsed.title;
    var wakeSubText = parsed.artist || '';
    if (parsed.date) wakeSubText += (wakeSubText ? ' \u00b7 ' : '') + parsed.date;
    if (spSubEl) {
      var subInner = spSubEl.querySelector('.sp-sub-inner');
      if (subInner) { subInner.textContent = wakeSubText || '\u2014'; }
      else { spSubEl.innerHTML = '<span class="sp-sub-inner">' + (wakeSubText || '\u2014') + '</span>'; }
    }
    if (spCounter) spCounter.textContent = 'Track ' + (spIdx + 1) + ' of ' + spTracks.length;
    spUpdatePlaysUI(spIdx);
    if (spAudio) {
      spAudio.src = spTracks[spIdx];
      spAudio.load();
    }
    setTimeout(spCheckMarquee, 200);
    // Update mini-player title
    var miniTitle = document.getElementById('miniTitle');
    if (miniTitle) {
      var miniInner = miniTitle.querySelector('.mini-title-inner');
      var miniText = spNames[spIdx];
      if (miniInner) { miniInner.textContent = miniText; }
      else { miniTitle.innerHTML = '<span class="mini-title-inner">' + miniText + '</span>'; }
    }
  }

  // ── LOAD TRACK ─────────────────────────────────────────────────
  function spLoad(idx, autoplay) {
    spIdx = idx;
    spPlayCounted = false;
    clearTimeout(spErrorTimeout);
    if (spErrorEl) spErrorEl.classList.remove('visible');

    var parsed = spParseName(spNames[idx]);
    var inner = spTitle && spTitle.querySelector('.sp-title-inner');

    if (spIdle) {
      spIdle = false;
    }

    if (inner) inner.textContent = parsed.title;
    if (spTitle) spTitle.classList.remove('is-scrolling');
    if (spSubEl) spSubEl.classList.remove('is-scrolling');
    var subText = parsed.artist || '';
    if (parsed.date) subText += (subText ? ' \u00b7 ' : '') + parsed.date;
    if (spSubEl) {
      var subInner = spSubEl.querySelector('.sp-sub-inner');
      if (subInner) { subInner.textContent = subText || '\u2014'; }
      else { spSubEl.innerHTML = '<span class="sp-sub-inner">' + (subText || '\u2014') + '</span>'; }
    }
    if (spCounter) spCounter.textContent = 'Track ' + (idx + 1) + ' of ' + spTracks.length;
    spUpdatePlaysUI(idx);
    if (spBar) spBar.style.width = '0';
    if (spCur) spCur.textContent = '0:00';
    if (spDur) spDur.textContent = '0:00';

    // Update mini-player title
    var miniTitle = document.getElementById('miniTitle');
    if (miniTitle) {
      miniTitle.classList.remove('is-scrolling');
      var miniInner = miniTitle.querySelector('.mini-title-inner');
      var miniText = spNames[idx];
      if (miniInner) { miniInner.textContent = miniText; }
      else { miniTitle.innerHTML = '<span class="mini-title-inner">' + miniText + '</span>'; }
    }

    if (spAudio) {
      spAudio.pause();
      spAudio.src = spTracks[idx];
      spAudio.load();
      if (autoplay) {
        var p = spAudio.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }
    }

    setTimeout(spCheckMarquee, 200);
  }

  // ── TOGGLE PLAY/PAUSE ─────────────────────────────────────────
  function spToggle() {
    if (!spAudio) return;
    if (spIdle) {
      spWake();
      var p = spAudio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
      return;
    }
    if (!spAudio.src || spAudio.src === window.location.href) {
      spLoad(spIdx, true);
      return;
    }
    if (spAudio.paused) {
      var p2 = spAudio.play();
      if (p2 && typeof p2.catch === 'function') p2.catch(function () {});
    } else {
      spAudio.pause();
    }
  }

  // ── AUDIO EVENTS ───────────────────────────────────────────────
  if (spAudio) {
    spAudio.volume = 0.8;

    spAudio.addEventListener('play', function () {
      spPlaying = true;
      if (spPlay) spPlay.innerHTML = '<svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="0" width="4" height="16" rx="1"/><rect x="9" y="0" width="4" height="16" rx="1"/></svg>';
      if (spDisc) spDisc.classList.add('is-spinning');
      // Mini-player sync
      var miniPlay = document.getElementById('miniPlay');
      if (miniPlay) miniPlay.innerHTML = '<svg width="10" height="12" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="0" width="4" height="16" rx="1"/><rect x="9" y="0" width="4" height="16" rx="1"/></svg>';
      var miniDisc = document.getElementById('miniDisc');
      if (miniDisc) miniDisc.classList.add('is-spinning');
      spMiniShowControls();
      // Hero play icon sync
      var hpb = document.getElementById('heroPlayBtn');
      if (hpb) {
        var hi = hpb.querySelector('.hero-play-icon');
        if (hi) hi.innerHTML = '<svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="0" width="4" height="16" rx="1"/><rect x="9" y="0" width="4" height="16" rx="1"/></svg>';
      }
    });

    spAudio.addEventListener('pause', function () {
      spPlaying = false;
      if (spPlay) spPlay.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor"><path d="M2.5 1.2a1 1 0 0 1 1.5-.86l11 8.16a1 1 0 0 1 0 1.72l-11 7.16A1 1 0 0 1 2.5 16.5V1.2z"/></svg>';
      if (spDisc) spDisc.classList.remove('is-spinning');
      // Mini-player sync
      var miniPlay = document.getElementById('miniPlay');
      if (miniPlay) miniPlay.innerHTML = '<svg width="12" height="14" viewBox="0 0 16 18" fill="currentColor"><path d="M2.5 1.2a1 1 0 0 1 1.5-.86l11 8.16a1 1 0 0 1 0 1.72l-11 7.16A1 1 0 0 1 2.5 16.5V1.2z"/></svg>';
      // Hero play icon sync
      var hpb = document.getElementById('heroPlayBtn');
      if (hpb) {
        var hi = hpb.querySelector('.hero-play-icon');
        if (hi) hi.innerHTML = '<svg width="14" height="16" viewBox="0 0 16 18" fill="currentColor"><path d="M2.5 1.2a1 1 0 0 1 1.5-.86l11 8.16a1 1 0 0 1 0 1.72l-11 7.16A1 1 0 0 1 2.5 16.5V1.2z"/></svg>';
      }
      var miniDisc = document.getElementById('miniDisc');
      if (miniDisc) miniDisc.classList.remove('is-spinning');
    });

    spAudio.addEventListener('timeupdate', function () {
      if (!spAudio.duration) return;
      var pct = (spAudio.currentTime / spAudio.duration) * 100;
      if (spBar) spBar.style.width = pct + '%';
      if (spCur) spCur.textContent = spFmt(spAudio.currentTime);
      // Mini-player progress line
      var miniPF = document.getElementById('miniProgressFill');
      if (miniPF) miniPF.style.width = pct + '%';
      // Count a play after 5 s
      if (!spPlayCounted && spAudio.currentTime >= 5) {
        spPlayCounted = true;
        spSaveCount(spIdx);
        spUpdatePlaysUI(spIdx);
      }
    });

    spAudio.addEventListener('loadedmetadata', function () {
      if (spDur) spDur.textContent = spFmt(spAudio.duration);
    });

    // Auto-advance on track end
    spAudio.addEventListener('ended', function () {
      var next = spNextIdx(1);
      spLoad(next, true);
    });

    // Error handling — show message and auto-skip
    spAudio.addEventListener('error', function () {
      if (spErrorEl) spErrorEl.classList.add('visible');
      spPlaying = false;
      if (spPlay) spPlay.innerHTML = '<svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor"><path d="M2.5 1.2a1 1 0 0 1 1.5-.86l11 8.16a1 1 0 0 1 0 1.72l-11 7.16A1 1 0 0 1 2.5 16.5V1.2z"/></svg>';
      if (spDisc) spDisc.classList.remove('is-spinning');
      clearTimeout(spErrorTimeout);
      spErrorTimeout = setTimeout(function () {
        spLoad(spNextIdx(1), false);
      }, 2000);
    });
  }

  // ── PLAYER CONTROLS ────────────────────────────────────────────
  if (spPlay) spPlay.addEventListener('click', spToggle);

  if (spNext) spNext.addEventListener('click', function () {
    if (spIdle) { spWake(); }
    spLoad(spNextIdx(1), spPlaying);
  });

  // Smart prev: restart if >3s in, else previous track
  if (spPrev) spPrev.addEventListener('click', function () {
    if (spIdle) { spWake(); }
    if (spAudio && spAudio.currentTime > 3) {
      spAudio.currentTime = 0;
    } else {
      spLoad(spNextIdx(-1), spPlaying);
    }
  });

  // Shuffle
  var v5BtnShuffle = document.getElementById('v5BtnShuffle');
  if (v5BtnShuffle) v5BtnShuffle.addEventListener('click', function () {
    if (spIdle) { spWake(); }
    spLoad(spShufflePick(), spPlaying || true);
  });

  // Seek on progress bar click + hover thumb
  if (spWrap) {
    spWrap.addEventListener('mousemove', function (e) {
      var r = spWrap.getBoundingClientRect();
      var pct = ((e.clientX - r.left) / r.width * 100);
      spWrap.style.setProperty('--seek-pct', Math.max(0, Math.min(100, pct)) + '%');
    });
    spWrap.addEventListener('click', function (e) {
      if (!spAudio || !spAudio.duration) return;
      var rect = spWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      spAudio.currentTime = pct * spAudio.duration;
    });
  }

  // Volume with fill
  if (spVol) spVol.addEventListener('input', function () {
    spUserSetVolume = true;
    if (spAudio) {
      spAudio.volume = parseFloat(spVol.value);
      spAudio.muted = false;
      if (spMute) spMute.innerHTML = spAudio.volume < 0.01 ? '&#128263;' : '&#128266;';
      spUpdateVolFill(spAudio.volume);
    }
  });

  if (spMute) spMute.addEventListener('click', function () {
    if (!spAudio) return;
    spAudio.muted = !spAudio.muted;
    spMute.innerHTML = spAudio.muted ? '&#128263;' : '&#128266;';
  });

  // ── GUARDED KEYBOARD SHORTCUTS ─────────────────────────────────
  function spInFormField() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  document.addEventListener('keydown', function (e) {
    if (spInFormField()) return;
    var k = e.key.toLowerCase();
    if (k === ' ') {
      e.preventDefault();
      spToggle();
    }
    if (k === 'n') {
      e.preventDefault();
      if (spIdle) spWake();
      spLoad(spNextIdx(1), spPlaying || true);
    }
    if (k === 'arrowleft') {
      e.preventDefault();
      v5RevPage = (v5RevPage - 1 + v5TotalPages) % v5TotalPages;
      v5RenderReviews();
    }
    if (k === 'arrowright') {
      e.preventDefault();
      v5RevPage = (v5RevPage + 1) % v5TotalPages;
      v5RenderReviews();
    }
  });

  // ══════════════════════════════════════════════════════════════
  // V5 TESTIMONIALS (paginated cards with nav)
  // ══════════════════════════════════════════════════════════════

  var V5_PER_PAGE = 1;
  var v5RevPage = 0;
  var v5TotalPages = Math.ceil(V5_TESTIMONIALS.length / V5_PER_PAGE);
  var v5RevAnimating = false;

  // ── TYPEWRITER UTILITY ──────────────────────────────────────────
  var v5TypeState = { timer: null, raf: null, typing: false, fullText: '' };

  function v5CancelType() {
    if (v5TypeState.timer) { clearTimeout(v5TypeState.timer); v5TypeState.timer = null; }
    if (v5TypeState.raf) { cancelAnimationFrame(v5TypeState.raf); v5TypeState.raf = null; }
    v5TypeState.typing = false;
  }

  function v5SkipType() {
    if (!v5TypeState.typing) return;
    v5CancelType();
    var el = document.getElementById('v5DialogueText');
    if (el) el.innerHTML = v5TypeState.fullText + '<span class="v5-cursor"></span>';
  }

  function v5TypeText(text, el, onDone) {
    v5CancelType();
    v5TypeState.fullText = text;
    v5TypeState.typing = true;
    el.innerHTML = '<span class="v5-cursor"></span>';
    var i = 0;
    var charDelay = 18;

    function typeNext() {
      if (!v5TypeState.typing) return;
      if (i < text.length) {
        el.innerHTML = text.slice(0, i + 1) + '<span class="v5-cursor"></span>';
        i++;
        v5TypeState.timer = setTimeout(typeNext, charDelay);
      } else {
        v5TypeState.typing = false;
        if (onDone) onDone();
      }
    }
    typeNext();
  }

  // Click/tap dialogue to skip typing
  (function () {
    var dialogue = document.getElementById('v5ConsoleDialogue');
    if (dialogue) {
      dialogue.addEventListener('click', function (e) {
        if (v5TypeState.typing) {
          e.stopPropagation();
          v5SkipType();
        }
      });
    }
  })();

  function v5BuildDots() {
    var wrap = document.getElementById('v5DotsWrap');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (var i = 0; i < v5TotalPages; i++) {
      var b = document.createElement('button');
      b.className = 'v5-tdot' + (i === v5RevPage ? ' active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Page ' + (i + 1));
      (function (idx) {
        b.addEventListener('click', function () { v5RevPage = idx; v5RenderReviews(); });
      })(i);
      wrap.appendChild(b);
    }
  }

  function v5UpdateDots() {
    var wrap = document.getElementById('v5DotsWrap');
    if (!wrap) return;
    var dots = wrap.querySelectorAll('.v5-tdot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === v5RevPage);
    }
  }

  function v5RenderReviews(animate) {
    if (animate === undefined) animate = true;
    var item = V5_TESTIMONIALS[v5RevPage];
    var speaker = document.getElementById('v5SpeakerName');
    var index = document.getElementById('v5ConsoleIndex');
    var textEl = document.getElementById('v5DialogueText');
    var dialogue = document.getElementById('v5ConsoleDialogue');
    var revIdx = document.getElementById('v5RevIdx');

    if (!item || !textEl) return;

    var quoteText = item.quote;

    function applyUI() {
      if (speaker) speaker.textContent = item.author;
      if (index) index.textContent = 'TESTIMONIAL ' + (v5RevPage + 1) + ' / ' + V5_TESTIMONIALS.length;
      if (revIdx) revIdx.textContent = v5RevPage + 1;
      v5UpdateDots();
    }

    // Cancel any in-progress typing
    v5CancelType();

    if (!animate || v5RevAnimating) {
      // Instant render (initial load or rapid nav fallback)
      applyUI();
      textEl.innerHTML = quoteText + '<span class="v5-cursor"></span>';
      return;
    }

    v5RevAnimating = true;

    // Animate-out
    if (dialogue) dialogue.classList.add('v5-anim-out');

    setTimeout(function () {
      applyUI();
      if (dialogue) dialogue.classList.remove('v5-anim-out');

      // Type the quote
      try {
        v5TypeText(quoteText, textEl, function () {
          v5RevAnimating = false;
        });
      } catch (_) {
        // Fallback: show full text immediately
        textEl.innerHTML = quoteText + '<span class="v5-cursor"></span>';
        v5RevAnimating = false;
      }

      // Safety: unlock animating state if typing takes too long
      setTimeout(function () { v5RevAnimating = false; }, 12000);
    }, 150);
  }

  // Testimonial nav buttons
  var v5BtnPrev = document.getElementById('v5BtnPrevRev');
  var v5BtnNext = document.getElementById('v5BtnNextRev');
  if (v5BtnPrev) v5BtnPrev.addEventListener('click', function () {
    v5RevPage = (v5RevPage - 1 + v5TotalPages) % v5TotalPages;
    v5RenderReviews();
  });
  if (v5BtnNext) v5BtnNext.addEventListener('click', function () {
    v5RevPage = (v5RevPage + 1) % v5TotalPages;
    v5RenderReviews();
  });

  // Touch / swipe on testimonials
  (function () {
    var consoleEl = document.getElementById('v5Console');
    if (!consoleEl) return;
    var touchStartX = 0, touchStartY = 0, swiping = false;

    consoleEl.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });

    consoleEl.addEventListener('touchend', function (e) {
      if (!swiping) return;
      swiping = false;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx < 0) {
          v5RevPage = (v5RevPage + 1) % v5TotalPages;
        } else {
          v5RevPage = (v5RevPage - 1 + v5TotalPages) % v5TotalPages;
        }
        v5RenderReviews();
      }
    }, { passive: true });
  })();

  // ── INIT ───────────────────────────────────────────────────────
  var v5RevTotal = document.getElementById('v5RevTotal');
  if (v5RevTotal) v5RevTotal.textContent = V5_TESTIMONIALS.length;
  v5BuildDots();
  v5RenderReviews(false);


  /* ── MINI-PLAYER (sticky bottom bar) ─────────────────────── */
  var miniPlayer   = document.getElementById('miniPlayer');
  var miniInvite   = document.getElementById('miniInvite');
  var miniControls = document.getElementById('miniControls');

  function spMiniShowControls() {
    if (!miniInvite || !miniControls) return;
    miniInvite.style.display   = 'none';
    miniControls.style.display = 'flex';
  }

  // Show mini-player after a short delay (respects sessionStorage dismiss)
  if (miniPlayer) {
    var miniDismissed = false;
    try { miniDismissed = !!sessionStorage.getItem('miniDismissed'); } catch (e) {}
    if (!miniDismissed) {
      setTimeout(function () {
        miniPlayer.classList.add('is-visible');
        document.body.classList.add('has-mini-player');
      }, 2500);
    }

    document.getElementById('miniDismiss') && document.getElementById('miniDismiss').addEventListener('click', function () {
      miniPlayer.classList.remove('is-visible');
      document.body.classList.remove('has-mini-player');
      try { sessionStorage.setItem('miniDismissed', '1'); } catch (e) {}
    });

    // Invite "Press Play"
    var miniPlayInvite = document.getElementById('miniPlayInvite');
    if (miniPlayInvite) miniPlayInvite.addEventListener('click', function () {
      spLoad(0, true);
    });

    // Hero play prompt — true toggle (play/pause) + gentle ramp on first play
    var heroPlayBtn = document.getElementById('heroPlayBtn');
    var heroListen = document.getElementById('heroListen');

    function heroSetIcon(isPlaying){
      if (!heroPlayBtn) return;
      var icon = heroPlayBtn.querySelector('.hero-play-icon');
      if (!icon) return;
      icon.innerHTML = isPlaying ? '<svg width="10" height="12" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="0" width="4" height="16" rx="1"/><rect x="9" y="0" width="4" height="16" rx="1"/></svg>' : '<svg width="12" height="14" viewBox="0 0 16 18" fill="currentColor"><path d="M2.5 1.2a1 1 0 0 1 1.5-.86l11 8.16a1 1 0 0 1 0 1.72l-11 7.16A1 1 0 0 1 2.5 16.5V1.2z"/></svg>';
      heroPlayBtn.setAttribute('aria-label', isPlaying ? 'Pause studio samples' : 'Play studio samples');
    }

    if (heroPlayBtn) heroPlayBtn.addEventListener('click', function () {
      if (!spAudio) return;

      // If currently playing, pause immediately (true toggle)
      if (!spAudio.paused && !spAudio.ended) {
        heroSetIcon(false);
        spAudio.pause();
        return;
      }

      // Starting playback: reflect intent immediately
      heroSetIcon(true);

      // Gentle start: if the user hasn't touched volume, begin lower and ramp up.
      if (!spUserSetVolume) {
        var rampTarget = Math.min(0.6, (spAudio.volume || 0.8));
        var startVol = Math.min(0.3, (spAudio.volume || 0.8));
        spAudio.volume = startVol;
        var steps = 11;
        var step = 0;
        var volTimer = setInterval(function () {
          step++;
          var t = step / steps;
          spAudio.volume = startVol + (rampTarget - startVol) * t;
          if (step >= steps) clearInterval(volTimer);
        }, 50);
      }

      // Ensure a track is loaded then play
      if (!spAudio.src || spAudio.src === window.location.href) {
        spLoad(0, true);
      } else {
        var p = spAudio.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      }

      // If playback is blocked/failed, revert icon shortly after.
      setTimeout(function () {
        if (spAudio.paused) heroSetIcon(false);
      }, 450);

      // Make sure mini-player is visible and in controls state
      if (miniPlayer && !miniPlayer.classList.contains('is-visible')) {
        miniPlayer.classList.add('is-visible');
        document.body.classList.add('has-mini-player');
      }
    });
// Mini controls wired to shared audio
    var miniPlayBtn = document.getElementById('miniPlay');
    if (miniPlayBtn) miniPlayBtn.addEventListener('click', spToggle);

    var miniPrevBtn = document.getElementById('miniPrev');
    if (miniPrevBtn) miniPrevBtn.addEventListener('click', function () {
      if (spAudio && spAudio.currentTime > 3) {
        spAudio.currentTime = 0;
      } else {
        spLoad(spNextIdx(-1), spPlaying);
      }
    });

    var miniNextBtn = document.getElementById('miniNext');
    if (miniNextBtn) miniNextBtn.addEventListener('click', function () {
      spLoad(spNextIdx(1), spPlaying);
    });

    // Mini volume — mirrors the main player's audio element
    var miniVolSlider = document.getElementById('miniVol');
    var miniMuteBtn   = document.getElementById('miniMute');

    if (miniVolSlider) miniVolSlider.addEventListener('input', function () {
      if (spAudio) {
        spAudio.volume = parseFloat(miniVolSlider.value);
        spAudio.muted  = false;
        if (spVol) spVol.value = miniVolSlider.value;
        var icon = spAudio.volume < 0.01 ? '&#128263;' : '&#128266;';
        if (miniMuteBtn) miniMuteBtn.innerHTML = icon;
        if (spMute) spMute.innerHTML = icon;
      }
    });

    if (miniMuteBtn) miniMuteBtn.addEventListener('click', function () {
      if (!spAudio) return;
      spAudio.muted = !spAudio.muted;
      var icon = spAudio.muted ? '&#128263;' : '&#128266;';
      miniMuteBtn.innerHTML = icon;
      if (spMute) spMute.innerHTML = icon;
    });

    // Tapping the track title scrolls to the full audio player
    var miniTitleEl = document.getElementById('miniTitle');
    if (miniTitleEl) {
      function spScrollToPlayer() {
        var target = document.getElementById('testimonials');
        if (!target) return;
        var offset = 72; // topbar height
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      miniTitleEl.addEventListener('click', spScrollToPlayer);
      miniTitleEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spScrollToPlayer(); }
      });
    }
  }


  /* ═══════════════════════════════════════════════════════════════
     14. DIALOG HANDLERS (Terms + What's the Difference)
     ═══════════════════════════════════════════════════════════════ */

  function openDialog(dialogEl) {
    if (!dialogEl) return;
    dialogEl.classList.add('active');
    body.classList.add('noscroll');
    var closeBtn = dialogEl.querySelector('.dialog-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeDialog(dialogEl) {
    if (!dialogEl) return;
    dialogEl.classList.remove('active');
    body.classList.remove('noscroll');
  }

  // Terms dialog
  var termsDialog = document.getElementById('termsDialog');
  document.querySelectorAll('.terms-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openDialog(termsDialog);
    });
  });

  // What's the difference dialog
  var diffDialog = document.getElementById('diffDialog');
  var diffLink = document.getElementById('diffLink');
  if (diffLink) {
    diffLink.addEventListener('click', function (e) {
      e.preventDefault();
      openDialog(diffDialog);
    });
  }

  // New dialogs
  var contactDialog = document.getElementById('contactDialog');
  var nextGigDialog = document.getElementById('nextGigDialog');
  var passDetailsDialog = document.getElementById('passDetailsDialog');

  // Artist Pass savings breakdown (Deals)
  function setPassBreakdown(passKey) {
    var titleEl = document.getElementById('passDetailsTitle');
    var boxEl = document.getElementById('passSavingsBreakdown');
    if (!boxEl) return;

    var data = {
      starter: {
        title: 'Starter - Savings Breakdown',
        includedValue: '$1,025',
        passPrice: '$750',
        builtIn: '$275',
        perksTotal: '$100',
        totalPossible: '$375',
        lines: [
          '10 studio hours @ $80/hr = $800',
          '1 Final Mix = $150',
          '1 Stems export = $75'
        ],
        perks: [
          'Next-Gig at $400 (normally $450) = save $50',
          'Artist Feature at $400 (normally $450) = save $50'
        ]
      },
      builder: {
        title: 'Builder - Savings Breakdown',
        includedValue: '$2,595',
        passPrice: '$1,750',
        builtIn: '$845',
        perksTotal: '$200',
        totalPossible: '$1,045',
        lines: [
          '24 studio hours @ $80/hr = $1,920',
          '3 Final Mixes @ $150 = $450',
          '3 Stems exports @ $75 = $225'
        ],
        perks: [
          'Next-Gig at $350 (normally $450) = save $100',
          'Artist Feature at $350 (normally $450) = save $100'
        ]
      },
      headliner: {
        title: 'Headliner - Savings Breakdown',
        includedValue: '$5,190',
        passPrice: '$3,495',
        builtIn: '$1,695',
        perksTotal: '$300',
        totalPossible: '$1,995',
        lines: [
          '48 studio hours @ $80/hr = $3,840',
          '6 Final Mixes @ $150 = $900',
          '6 Stems exports @ $75 = $450'
        ],
        perks: [
          'Additional Next-Gig at $300 (normally $450) = save $150',
          'Artist Feature at $300 (normally $450) = save $150'
        ]
      }
    };

    var d = data[passKey] || data.starter;
    if (titleEl) titleEl.textContent = 'Artist Pass Details';
    boxEl.innerHTML =
      '<h4 class="dialog-subtitle">' + d.title + '</h4>' +
      '<p class="dialog-muted">How savings are calculated</p>' +
      '<p><strong>Included retail value (a la carte): ' + d.includedValue + '</strong></p>' +
      '<ul>' + d.lines.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p><strong>Pass price: ' + d.passPrice + '</strong><br>Built-in savings: <strong>' + d.builtIn + '</strong></p>' +
      '<p><strong>Optional perk savings (if used)</strong></p>' +
      '<ul>' + d.perks.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '<p><strong>Total possible savings with perks: ' + d.totalPossible + '</strong></p>';
  }


  // Generic handler: any link with data-dialog opens the named dialog
  document.querySelectorAll('[data-dialog]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (link.getAttribute('data-dialog') === 'passDetailsDialog' && link.getAttribute('data-pass')) {
        setPassBreakdown(link.getAttribute('data-pass'));
      }
      var dialogEl = document.getElementById(link.getAttribute('data-dialog'));
      if (dialogEl) openDialog(dialogEl);
    });
  });

  // Reach Out form — handled by inline handler below (reachOutForm__inlineHandler)

  // Close + click-outside handlers for ALL dialogs
  document.querySelectorAll('.dialog-overlay').forEach(function (dialog) {
    var closeBtn = dialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeDialog(dialog);
      });
    }
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        closeDialog(dialog);
      }
    });
  });

  // ESC closes any open dialog
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dialog-overlay.active').forEach(function (dialog) {
        closeDialog(dialog);
      });
    }
  });


}); // end DOMContentLoaded


// reachOutForm__inlineHandler: keep modal open, show inline status, turn button green like Quick-Start
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reachOutForm');
  if(!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const statusBox = form.querySelector('.form-inline-status');
  const origBtnText = submitBtn ? submitBtn.textContent : 'Send →';

  const setStatus = (kind, html) => {
    if(!statusBox) return;
    statusBox.innerHTML = html || '';
    statusBox.dataset.kind = kind || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    setStatus('', '');
    if(submitBtn){
      submitBtn.disabled = true;
      submitBtn.classList.remove('is-submitted');
      submitBtn.textContent = 'Sending...';
    }

    try{
      const formData = new FormData(form);
      const body = new URLSearchParams(formData).toString();

      const res = await fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      if(!res.ok) throw new Error('Network response not ok');

      if(submitBtn){
        submitBtn.classList.add('is-submitted');
        submitBtn.textContent = 'Sent ✓';
      }

      // disable fields to reduce double submits
      form.querySelectorAll('input, select, textarea').forEach(el => {
        if(el.type !== 'hidden') el.disabled = true;
      });

      setStatus('ok', `
        <div class="ok">
          <div class="tick">✓</div>
          <div class="msg">
            <strong>Got it.</strong> I’ll reach out soon.<br/>
            <span style="color: rgba(255,255,255,0.62);">If it’s urgent, text me and I’ll jump on it.</span>
          </div>
        </div>
      `);
    }catch(err){
      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = origBtnText;
      }
      setStatus('err', `<div class="err">Something went wrong. Please try again.</div>`);
    }
  }, true);
});


/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO PAGE — portfolio.html
   Loads from photos.json. Shuffles on every page load.
   To add photos: edit photos.json only — no HTML changes needed.
   ═══════════════════════════════════════════════════════════════ */

(function() {
  if (!document.getElementById('portGrid')) return;

  const grid       = document.getElementById('portGrid');
  const filtersEl  = document.getElementById('portFilters');
  const countEl    = document.getElementById('portCount');
  const emptyEl    = document.getElementById('portEmpty');
  const lb         = document.getElementById('lightbox');
  const lbImgWrap  = document.getElementById('lbImgWrap');
  const lbTitle    = document.getElementById('lbTitle');
  const lbCat      = document.getElementById('lbCat');

  let allPhotos    = [];   // full shuffled list
  let visiblePhotos = [];  // currently filtered subset
  let currentIndex = 0;

  // ── Shuffle (Fisher-Yates) ──────────────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── Build a tile element ────────────────────────────────────
  function makeTile(photo, index) {
    const div = document.createElement('div');
    div.className = 'port-item';
    div.dataset.cat   = photo.cat;
    div.dataset.title = photo.title;
    div.dataset.index = index;

    // Inner markup
    const encodedSrc = encodeURI(photo.src);
    div.innerHTML = `
      <img
        src="${encodedSrc}"
        alt="${photo.title}"
        loading="lazy"
        onerror="this.closest('.port-item').style.display='none'"
      />
      <div class="port-item-overlay">
        <div>
          <div class="port-item-title">${photo.title}</div>
          <div class="port-item-cat">${photo.catLabel}</div>
        </div>
      </div>`;

    // Click → lightbox
    div.addEventListener('click', () => {
      currentIndex = visiblePhotos.indexOf(photo);
      openLb(currentIndex);
    });

    return div;
  }

  // ── Render grid for current filter ─────────────────────────
  function render(cat) {
    visiblePhotos = cat === 'all' ? allPhotos : allPhotos.filter(p => p.cat === cat);
    grid.innerHTML = '';

    visiblePhotos.forEach((photo, i) => {
      const tile = makeTile(photo, i);
      // Stagger reveal
      tile.style.transitionDelay = (i * 40) + 'ms';
      grid.appendChild(tile);
      // Trigger reflow then reveal
      requestAnimationFrame(() => requestAnimationFrame(() => tile.classList.add('revealed')));
    });

    countEl.textContent = visiblePhotos.length
      ? `${visiblePhotos.length} photo${visiblePhotos.length !== 1 ? 's' : ''}`
      : '';
    emptyEl.style.display = visiblePhotos.length === 0 ? 'block' : 'none';
  }

  // ── Filter buttons ──────────────────────────────────────────
  function buildFilters(categories) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className    = 'filter-btn';
      btn.dataset.filter = cat.id;
      btn.textContent  = cat.label;
      filtersEl.appendChild(btn);
    });

    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.filter);
    });
  }

  // ── Lightbox ────────────────────────────────────────────────
  function openLb(idx) {
    currentIndex = (idx + visiblePhotos.length) % visiblePhotos.length;
    const photo  = visiblePhotos[currentIndex];
    lbImgWrap.innerHTML = '';

    const img = document.createElement('img');
    img.src = encodeURI(photo.src);
    img.alt = photo.title;
    lbImgWrap.appendChild(img);

    lbTitle.textContent = photo.title;
    lbCat.textContent   = photo.catLabel;

    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.getElementById('lbPrev').addEventListener('click', () => openLb(currentIndex - 1));
  document.getElementById('lbNext').addEventListener('click', () => openLb(currentIndex + 1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowLeft')   openLb(currentIndex - 1);
    if (e.key === 'ArrowRight')  openLb(currentIndex + 1);
  });

  // ── Load photos.json and boot ───────────────────────────────
  fetch('photos.json')
    .then(r => r.json())
    .then(data => {
      // Build a lookup of cat id → label
      const catLabels = {};
      data.categories.forEach(c => { catLabels[c.id] = c.label; });

      // Attach label to each photo, then shuffle
      allPhotos = shuffle(
        data.photos.map(p => ({ ...p, catLabel: catLabels[p.cat] || p.cat }))
      );

      buildFilters(data.categories);
      render('all');
    })
    .catch(() => {
      grid.innerHTML = '<p style="color:var(--muted2);text-align:center;padding:60px 0;">Could not load photos. Make sure photos.json is in the same folder.</p>';
    });

})();

/* ═══════════════════════════════════════════════════════════════
   BLOG PAGE — blog.html
   Only runs when #notifyForm or .blog-featured is present.
   ═══════════════════════════════════════════════════════════════ */

(function() {
  if (!document.getElementById('notifyForm') && !document.querySelector('.blog-featured')) return;



const notifyForm = document.getElementById('notifyForm');
const csSuccess = document.getElementById('csSuccess');
if (notifyForm) {
  notifyForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var fd = new FormData(notifyForm);
    if (!fd.get('form-name')) fd.set('form-name', 'blog-notify');
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fd).toString()
    }).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      notifyForm.style.display = 'none';
      if (csSuccess) csSuccess.style.display = 'block';
    }).catch(function() {
      notifyForm.style.display = 'none';
      if (csSuccess) csSuccess.style.display = 'block';
    });
  });
}

})();
