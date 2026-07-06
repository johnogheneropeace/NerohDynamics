/* ============================================================================
   NEROH DYNAMICS
   app.js. Header state, mobile menu, sector rotator, scroll reveals,
   interactive sectors, stat counters, contact form handling, active nav.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- current year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- header scroll state ---- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- active nav link by pathname ---- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-panel a.m-link').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (href === here || (here === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.querySelector('.mobile-panel');
  var scrim = document.querySelector('.scrim');
  var mClose = document.querySelector('.m-close');
  function openMenu() { if (panel) panel.classList.add('open'); if (scrim) scrim.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { if (panel) panel.classList.remove('open'); if (scrim) scrim.classList.remove('open'); document.body.style.overflow = ''; }
  if (toggle) toggle.addEventListener('click', openMenu);
  if (mClose) mClose.addEventListener('click', closeMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-panel a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---- hero sector rotator ---- */
  var rotator = document.querySelector('.rotator');
  if (rotator) {
    var words = Array.prototype.slice.call(rotator.querySelectorAll('.word'));
    var i = 0;
    words.forEach(function (w, idx) { w.classList.toggle('in', idx === 0); });
    if (!reduce && words.length > 1) {
      setInterval(function () {
        var cur = words[i];
        cur.classList.remove('in');
        cur.classList.add('out');
        i = (i + 1) % words.length;
        var next = words[i];
        setTimeout(function () {
          words.forEach(function (w) { w.classList.remove('out'); });
          next.classList.add('in');
        }, 500);
      }, 2400);
    }
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, idx) {
      el.style.transitionDelay = (Math.min(idx % 4, 3) * 80) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- interactive sector tiles (tap to activate on touch) ---- */
  document.querySelectorAll('.sector-tile').forEach(function (tile) {
    tile.addEventListener('click', function () {
      document.querySelectorAll('.sector-tile').forEach(function (t) { if (t !== tile) t.classList.remove('active'); });
      tile.classList.toggle('active');
    });
  });

  /* ---- stat counters ---- */
  var stats = document.querySelectorAll('.stat .n[data-count]');
  if (stats.length && 'IntersectionObserver' in window && !reduce) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = Math.floor(p * target);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(tick);
        so.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(function (el) { so.observe(el); });
  } else {
    stats.forEach(function (el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
  }

  /* ---- contact form ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    var success = document.getElementById('formSuccess');
    function setInvalid(field, bad) {
      var wrap = field.closest('.field');
      if (wrap) wrap.classList.toggle('invalid', bad);
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim()) { setInvalid(name, true); ok = false; } else setInvalid(name, false);
      if (!emailRe.test(email.value.trim())) { setInvalid(email, true); ok = false; } else setInvalid(email, false);
      if (!message.value.trim()) { setInvalid(message, true); ok = false; } else setInvalid(message, false);

      if (!ok) return;

      /* No backend is wired yet. Compose a mailto as a working fallback so the
         form is usable on day one. Replace this block with a Formspree or
         Netlify Forms endpoint when ready. */
      var interest = form.querySelector('[name="interest"]');
      var org = form.querySelector('[name="organisation"]');
      var subject = encodeURIComponent('Website enquiry: ' + (interest ? interest.value : 'General'));
      var body = encodeURIComponent(
        'Name: ' + name.value + '\n' +
        'Organisation: ' + (org ? org.value : '') + '\n' +
        'Interest: ' + (interest ? interest.value : '') + '\n\n' +
        message.value
      );
      window.location.href = 'mailto:hello@nerohdynamics.com?subject=' + subject + '&body=' + body;

      if (success) {
        form.style.display = 'none';
        success.classList.add('show');
      }
    });
  }
})();
