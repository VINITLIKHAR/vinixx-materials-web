/* =========================================================
   VINIXX — shared interactions
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile nav ---- */
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    }));
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
        burger.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.querySelector('.site-header');
  const backTop = document.querySelector('.back-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (header) header.style.boxShadow = y > 10 ? '0 8px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.25)';
    if (backTop) backTop.classList.toggle('show', y > 480);
  });
  if (backTop) backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Hero slider ---- */
  const slides = document.querySelectorAll('.hero-slide');
  const dotsWrap = document.querySelector('.hero-dots');
  let cur = 0, timer;

  function goTo(i) {
    if (!slides.length) return;
    slides[cur].classList.remove('active');
    if (dotsWrap) dotsWrap.children[cur].classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    if (dotsWrap) dotsWrap.children[cur].classList.add('active');
  }
  function next() { goTo(cur + 1); }
  function prev() { goTo(cur - 1); }
  function restart() { clearInterval(timer); timer = setInterval(next, 6000); }

  if (slides.length) {
    slides.forEach((s, i) => {
      if (dotsWrap) {
        const b = document.createElement('button');
        if (i === 0) b.classList.add('active');
        b.addEventListener('click', () => { goTo(i); restart(); });
        dotsWrap.appendChild(b);
      }
    });
    document.querySelector('.hero-next')?.addEventListener('click', () => { next(); restart(); });
    document.querySelector('.hero-prev')?.addEventListener('click', () => { prev(); restart(); });
    restart();
  }

  /* ---- Testimonial slider ---- */
  const track = document.querySelector('.test-track');
  if (track) {
    const cards = track.children.length;
    const dots = document.querySelector('.test-dots');
    let per = window.innerWidth >= 860 ? 3 : 1;
    let pages = Math.max(1, cards - per + 1);
    let idx = 0;

    function render() {
      per = window.innerWidth >= 860 ? 3 : 1;
      pages = Math.max(1, cards - per + 1);
      if (idx > pages - 1) idx = pages - 1;
      const pct = (100 / per) * idx;
      track.style.transform = `translateX(-${pct}%)`;
      if (dots) {
        dots.innerHTML = '';
        for (let i = 0; i < pages; i++) {
          const b = document.createElement('button');
          if (i === idx) b.classList.add('active');
          b.addEventListener('click', () => { idx = i; render(); });
          dots.appendChild(b);
        }
      }
    }
    render();
    window.addEventListener('resize', render);
    let tAuto = setInterval(() => { idx = (idx + 1) % pages; render(); }, 5000);
    track.closest('.test-slider')?.addEventListener('mouseenter', () => clearInterval(tAuto));
    track.closest('.test-slider')?.addEventListener('mouseleave', () => { tAuto = setInterval(() => { idx = (idx + 1) % pages; render(); }, 5000); });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          e.target.querySelectorAll('.r-child').forEach((c, i) => c.style.setProperty('--i', i));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- Animated counters ---- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1600;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      function tick(t) {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.floor(p * target) + (el.dataset.suffix || '');
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { run(); io2.disconnect(); } });
      }, { threshold: 0.4 });
      io2.observe(el);
    } else run();
  });

  /* ---- Product filter (products.html) ---- */
  const filterBtns = document.querySelectorAll('.filter-bar button');
  const cards = document.querySelectorAll('[data-cat]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      cards.forEach(c => {
        const show = cat === 'all' || c.dataset.cat === cat;
        c.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---- Product detail tabs ---- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    });
  });

  /* ---- Product detail gallery ---- */
  const mainImg = document.querySelector('.pd-gallery .main img');
  document.querySelectorAll('.pd-thumbs img').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.pd-thumbs img').forEach(i => i.classList.remove('active'));
      t.classList.add('active');
      if (mainImg) mainImg.src = t.src;
    });
  });

  /* ---- Forms (demo submit) ---- */
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      if (msg) {
        msg.textContent = 'Thank you! Your message has been received — our team will get back to you within 24 hours.';
        msg.classList.add('show');
      }
      form.reset();
      setTimeout(() => msg && msg.classList.remove('show'), 6000);
    });
  });

  /* ---- Set active nav link based on filename ---- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

});
