/* =========================================================
   VINIXX — shared interactions
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* horizontal swipe on touch screens; ignores mostly-vertical drags so page scrolling still works */
  function addSwipe(el, cb) {
    if (!el) return;
    let x0 = 0,
      y0 = 0,
      t0 = 0;
    el.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        x0 = t.clientX;
        y0 = t.clientY;
        t0 = Date.now();
      },
      { passive: true },
    );
    el.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - x0,
          dy = t.clientY - y0;
        if (
          Math.abs(dx) > 48 &&
          Math.abs(dx) > Math.abs(dy) * 1.4 &&
          Date.now() - t0 < 700
        )
          cb(dx < 0 ? 1 : -1);
      },
      { passive: true },
    );
  }

  /* ---- Theme (light / dark) ---- */
  const root = document.documentElement;
  const themeBtn = document.querySelector(".theme-toggle");
  const media = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  const readSaved = () => {
    try {
      return localStorage.getItem("vinixx-theme");
    } catch (e) {
      return null;
    }
  };

  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(t === "dark"));
      const label =
        t === "dark" ? "Switch to light mode" : "Switch to dark mode";
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.classList.add("theme-anim");
      applyTheme(next);
      try {
        localStorage.setItem("vinixx-theme", next);
      } catch (e) {}
      setTimeout(() => root.classList.remove("theme-anim"), 450);
    });
  }
  /* if the visitor never chose, follow the device setting live */
  if (media && media.addEventListener) {
    media.addEventListener("change", (e) => {
      if (!readSaved()) applyTheme(e.matches ? "dark" : "light");
    });
  }

  /* ---- Mobile nav drawer ---- */
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".main-nav");
  const header = document.querySelector(".site-header");
  if (burger && nav && header) {
    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    header.appendChild(backdrop);

    const setNav = (open) => {
      nav.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      backdrop.classList.toggle("show", open);
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    burger.addEventListener("click", () =>
      setNav(!nav.classList.contains("open")),
    );
    backdrop.addEventListener("click", () => setNav(false));
    nav
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", () => setNav(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        burger.focus();
      }
    });
    /* leaving the mobile layout (rotate / resize) must not leave the page locked */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) setNav(false);
    });
  }

  /* ---- Sticky header shadow on scroll ---- */
  const backTop = document.querySelector(".back-top");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (header)
      header.style.boxShadow =
        y > 10 ? "0 8px 30px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.25)";
    if (backTop) backTop.classList.toggle("show", y > 480);
  });
  if (backTop)
    backTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );

  /* ---- Hero slider ---- */
  const slides = document.querySelectorAll(".hero-slide");
  const dotsWrap = document.querySelector(".hero-dots");
  let cur = 0,
    timer;

  function goTo(i) {
    if (!slides.length) return;
    slides[cur].classList.remove("active");
    if (dotsWrap) dotsWrap.children[cur].classList.remove("active");
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add("active");
    if (dotsWrap) dotsWrap.children[cur].classList.add("active");
  }
  function next() {
    goTo(cur + 1);
  }
  function prev() {
    goTo(cur - 1);
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }

  if (slides.length) {
    slides.forEach((s, i) => {
      if (dotsWrap) {
        const b = document.createElement("button");
        if (i === 0) b.classList.add("active");
        b.addEventListener("click", () => {
          goTo(i);
          restart();
        });
        dotsWrap.appendChild(b);
      }
    });
    addSwipe(document.querySelector(".hero"), (dir) => {
      dir > 0 ? next() : prev();
      restart();
    });
    document.querySelector(".hero-next")?.addEventListener("click", () => {
      next();
      restart();
    });
    document.querySelector(".hero-prev")?.addEventListener("click", () => {
      prev();
      restart();
    });
    restart();
  }

  /* ---- Testimonial slider ---- */
  const track = document.querySelector(".test-track");
  if (track) {
    const cards = track.children.length;
    const dots = document.querySelector(".test-dots");
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
        dots.innerHTML = "";
        for (let i = 0; i < pages; i++) {
          const b = document.createElement("button");
          if (i === idx) b.classList.add("active");
          b.addEventListener("click", () => {
            idx = i;
            render();
          });
          dots.appendChild(b);
        }
      }
    }
    render();
    window.addEventListener("resize", render);
    addSwipe(track.closest(".test-slider"), (dir) => {
      idx = Math.max(0, Math.min(pages - 1, idx + dir));
      render();
    });
    let tAuto = setInterval(() => {
      idx = (idx + 1) % pages;
      render();
    }, 5000);
    track
      .closest(".test-slider")
      ?.addEventListener("mouseenter", () => clearInterval(tAuto));
    track.closest(".test-slider")?.addEventListener("mouseleave", () => {
      tAuto = setInterval(() => {
        idx = (idx + 1) % pages;
        render();
      }, 5000);
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            e.target
              .querySelectorAll(".r-child")
              .forEach((c, i) => c.style.setProperty("--i", i));
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- Animated counters ---- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1600;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      function tick(t) {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.floor(p * target) + (el.dataset.suffix || "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              run();
              io2.disconnect();
            }
          });
        },
        { threshold: 0.4 },
      );
      io2.observe(el);
    } else run();
  });

  /* ---- Product filter (products.html) ---- */
  const filterBtns = document.querySelectorAll(".filter-bar button");
  const cards = document.querySelectorAll("[data-cat]");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      cards.forEach((c) => {
        const show = cat === "all" || c.dataset.cat === cat;
        c.style.display = show ? "" : "none";
      });
    });
  });

  /* ---- Product detail tabs ---- */
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab)?.classList.add("active");
    });
  });

  /* ---- Product detail gallery ---- */
  const mainImg = document.querySelector(".pd-gallery .main img");
  document.querySelectorAll(".pd-thumbs img").forEach((t) => {
    t.addEventListener("click", () => {
      document
        .querySelectorAll(".pd-thumbs img")
        .forEach((i) => i.classList.remove("active"));
      t.classList.add("active");
      if (mainImg) mainImg.src = t.src;
    });
  });

  /* ---- Forms (demo submit) ---- */
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = form.querySelector(".form-msg");
      if (msg) {
        msg.textContent =
          "Thank you! Your message has been received — our team will get back to you within 24 hours.";
        msg.classList.add("show");
      }
      form.reset();
      setTimeout(() => msg && msg.classList.remove("show"), 6000);
    });
  });

  /* ---- Set active nav link based on filename ---- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html"))
      a.classList.add("active");
  });
});
