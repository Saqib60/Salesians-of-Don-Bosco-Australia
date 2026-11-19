/* Salesians of Don Bosco — Variation 3 prototype interactions */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2800);
  }

  /* ---------- Hash routing between page templates ---------- */
  const views = $$(".view");
  const names = views.map(v => v.id);
  function route() {
    const want = (location.hash || "#home").slice(1);
    const id = names.includes(want) ? want : "home";
    views.forEach(v => v.classList.toggle("is-active", v.id === id));
    $$(".main-nav a, .drawer a.nav-link").forEach(a => a.classList.toggle("is-active", a.dataset.section === $("#" + id).dataset.section));
    document.title = $("#" + id).dataset.title + " | Salesians of Don Bosco";
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    closeDrawer();
    observeReveals();
  }
  window.addEventListener("hashchange", route);

  /* Placeholder links (no page yet) */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-soon]");
    if (a) { e.preventDefault(); toast(a.dataset.soon || "This page is part of the next design phase."); }
  });

  /* ---------- Sticky header ---------- */
  const header = $(".site-header");
  const progress = $(".progress"), toTop = $(".to-top");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("is-scrolled", y > 24);
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    toTop.classList.toggle("is-on", y > innerHeight * 0.8);
    const heroMedia = $(".view.is-active .hero .media");
    if (heroMedia && !reduce) heroMedia.style.transform = "translateY(" + Math.min(y, 600) * 0.08 + "px)";
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  onScroll();

  /* Cursor spotlight on colour tiles, bands and the event card */
  document.addEventListener("pointermove", e => {
    const el = e.target.closest(".tile, .band, .event");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  /* ---------- Mobile drawer ---------- */
  const drawer = $("#drawer");
  function openDrawer() { drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); $(".menu-toggle").setAttribute("aria-expanded", "true"); }
  function closeDrawer() { drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); $(".menu-toggle").setAttribute("aria-expanded", "false"); }
  $(".menu-toggle").addEventListener("click", openDrawer);
  $$("[data-close-drawer]").forEach(b => b.addEventListener("click", closeDrawer));

  /* ---------- Search overlay ---------- */
  const search = $("#search");
  $$("[data-open-search]").forEach(b => b.addEventListener("click", () => { search.classList.add("is-open"); setTimeout(() => $("input", search).focus(), 50); }));
  $$("[data-close-search]").forEach(b => b.addEventListener("click", () => search.classList.remove("is-open")));
  $("form", search).addEventListener("submit", e => {
    e.preventDefault();
    const q = $("input", search).value.trim();
    search.classList.remove("is-open");
    location.hash = "#resources";
    setTimeout(() => { const i = $("#res-q"); i.value = q; filterResources(); }, 60);
  });

  /* ---------- Video modal ---------- */
  const modal = $("#video");
  $$("[data-video]").forEach(b => b.addEventListener("click", () => { $("#video-title").textContent = b.dataset.video; modal.classList.add("is-open"); }));
  $$("[data-close-video]").forEach(b => b.addEventListener("click", () => modal.classList.remove("is-open")));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { modal.classList.remove("is-open"); search.classList.remove("is-open"); closeDrawer(); }
  });

  /* ---------- Event countdown ---------- */
  const eventDate = new Date("2026-12-06T10:00:00+11:00");
  function tick() {
    const ms = Math.max(0, eventDate - new Date());
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    $$("[data-cd]").forEach(el => {
      el.querySelector("[data-d]").textContent = String(d).padStart(2, "0");
      el.querySelector("[data-h]").textContent = String(h).padStart(2, "0");
      el.querySelector("[data-m]").textContent = String(m).padStart(2, "0");
      const sEl = el.querySelector("[data-s]");
      sEl.textContent = String(s).padStart(2, "0");
      sEl.classList.remove("tick"); void sEl.offsetWidth; sEl.classList.add("tick");
    });
    $$("[data-days-to-go]").forEach(el => (el.textContent = d + " days to go"));
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Add to calendar / register / share ---------- */
  $$("[data-toast]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); toast(b.dataset.toast); }));
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); toast("Link copied to clipboard"); }
    catch (err) { toast("Copy this page's address from your browser bar"); }
  }));

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(el => el.classList.add("is-in")); return; }
    if (io) io.disconnect();
    io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: 0.12 });
    $$(".view.is-active .reveal:not(.is-in)").forEach(el => {
      const grid = el.parentElement && el.parentElement.classList.contains("grid") ? el.parentElement : null;
      if (grid) el.style.transitionDelay = Array.from(grid.children).indexOf(el) * 90 + "ms";
      io.observe(el);
    });
  }

  /* ---------- Podcast player (simulated) ---------- */
  const player = $(".player");
  if (player) {
    const total = 38 * 60 + 5;
    let pos = 12 * 60 + 40, timer = null;
    const fill = $(".track__fill", player), cur = $("[data-cur]", player), btn = $(".play-btn", player);
    const fmt = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
    const draw = () => { fill.style.width = (pos / total) * 100 + "%"; cur.textContent = fmt(pos); };
    btn.addEventListener("click", () => {
      if (timer) { clearInterval(timer); timer = null; player.classList.remove("is-playing"); btn.innerHTML = '<svg class="i i--lg"><use href="#i-play"/></svg>'; btn.setAttribute("aria-label", "Play episode"); }
      else { timer = setInterval(() => { pos = Math.min(total, pos + 1); draw(); }, 1000); player.classList.add("is-playing"); btn.innerHTML = '<svg class="i i--lg"><use href="#i-pause"/></svg>'; btn.setAttribute("aria-label", "Pause episode"); }
    });
    $(".track__bar", player).addEventListener("click", e => { const r = e.currentTarget.getBoundingClientRect(); pos = ((e.clientX - r.left) / r.width) * total; draw(); });
    draw();
  }

  /* ---------- Resource library filtering ---------- */
  let activeType = "All";
  function filterResources() {
    const q = ($("#res-q").value || "").toLowerCase();
    const topic = $("#res-topic").value, aud = $("#res-aud").value;
    let n = 0;
    $$(".res-card").forEach(c => {
      const ok = (activeType === "All" || c.dataset.type === activeType) &&
        (topic === "All topics" || c.dataset.topic === topic) &&
        (aud === "All audiences" || c.dataset.aud.includes(aud)) &&
        (!q || c.textContent.toLowerCase().includes(q));
      c.style.display = ok ? "" : "none";
      if (ok) n++;
    });
    $("#res-count").textContent = n + (n === 1 ? " item" : " items") + " · Newest first";
    $(".empty").style.display = n ? "none" : "block";
  }
  window.filterResources = filterResources;
  $$(".fchip").forEach(ch => ch.addEventListener("click", () => {
    $$(".fchip").forEach(c => c.classList.remove("is-active"));
    ch.classList.add("is-active"); activeType = ch.dataset.type; filterResources();
  }));
  ["#res-q", "#res-topic", "#res-aud"].forEach(s => $(s).addEventListener("input", filterResources));
  $("#res-form").addEventListener("submit", e => { e.preventDefault(); filterResources(); });
  $$(".pager button").forEach(b => b.addEventListener("click", () => {
    $$(".pager button").forEach(x => x.classList.remove("is-active")); b.classList.add("is-active");
    $("#res-results").scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- FAQ: one open at a time ---------- */
  function animateDetails(d, open) {
    const a = $(".answer", d);
    if (reduce) { d.open = open; return; }
    if (open) {
      d.open = true;
      const h = a.scrollHeight;
      a.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 350, easing: "cubic-bezier(.2,.7,.2,1)" });
    } else {
      const h = a.scrollHeight;
      a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" }).onfinish = () => (d.open = false);
    }
  }
  $$(".faq summary").forEach(s => s.addEventListener("click", e => {
    e.preventDefault();
    const d = s.parentElement, willOpen = !d.open;
    if (willOpen) $$(".faq details[open]").forEach(o => { if (o !== d) animateDetails(o, false); });
    animateDetails(d, willOpen);
  }));

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

  route();
})();
