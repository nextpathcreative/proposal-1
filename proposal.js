/* =====================================================================
   proposal.js — vanilla replacement for the old React/Babel stack.
   Handles: icon init, scroll-reveal, stat count-up, sticky-header shadow,
   FAQ accordion, and the "Book a 15-minute setup call" scheduler modal.
   ---------------------------------------------------------------------
   CFG = the only merge values the JS needs (the scheduler + receipt text).
   To reskin for a new prospect, edit these to match the copy baked into
   proposal.html. The brand COLOR is a single CSS var (--brand) in the HTML.
   ===================================================================== */
(function () {
  "use strict";

  var CFG = {
    CLIENT:      "Rose City Plumbing",
    CITY:        "Portland",
    MY_BUSINESS: "NextPath Creative",
    MY_NAME:     "Simon",
    MY_FULLNAME: "Simon Chen",
    MY_PHONE:    "971-419-5054",
    MY_SMS_HREF: "sms:+19714195054"
  };

  /* ------------------------------ Icons ------------------------------ */
  function icons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

  /* --------------------------- Scroll reveal -------------------------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
    // Failsafe: never leave content hidden if observers misbehave.
    setTimeout(function () { els.forEach(function (e) { e.classList.add("in"); }); }, 2600);
  }

  /* ----------------------------- Count-up ----------------------------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.textContent = target; return; }
    var dur = 1100, t0 = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 5);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }
  function initCountUp() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".countup"));
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (e) { e.textContent = "0"; io.observe(e); });
    setTimeout(function () {
      els.forEach(function (e) { if (e.textContent === "0") animateCount(e); });
    }, 2600);
  }

  /* ------------------------- Sticky header shadow --------------------- */
  function initHeader() {
    var hdr = document.getElementById("hdr");
    if (!hdr) return;
    function onScroll() { hdr.classList.toggle("scrolled", window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------- FAQ -------------------------------- */
  function initFaq() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
    function setOpen(item, open) {
      var a = item.querySelector(".faq-a");
      var inner = item.querySelector(".faq-a-inner");
      var btn = item.querySelector(".faq-q");
      item.classList.toggle("open", open);
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.height = open ? inner.scrollHeight + "px" : "0px";
    }
    items.forEach(function (item) {
      var btn = item.querySelector(".faq-q");
      // Initialise: open ones get their measured height, the rest collapse.
      setOpen(item, item.classList.contains("open"));
      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        items.forEach(function (other) { if (other !== item) setOpen(other, false); });
        setOpen(item, !isOpen);
      });
    });
    // Re-measure open items once fonts settle.
    window.addEventListener("load", function () {
      items.forEach(function (item) {
        if (item.classList.contains("open")) {
          var a = item.querySelector(".faq-a"), inner = item.querySelector(".faq-a-inner");
          a.style.height = inner.scrollHeight + "px";
        }
      });
    });
  }

  /* --------------------------- Booking modal -------------------------- */
  var SLOTS = ["9:00", "9:30", "10:30", "11:30", "1:00", "2:00", "3:30", "4:30"];

  function buildDays() {
    var out = [], c = new Date();
    c = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    while (out.length < 5) {
      var d = c.getDay();
      if (d !== 0 && d !== 6) out.push(new Date(c));
      c = new Date(c.getTime() + 86400000);
    }
    return out;
  }
  function bookedSet(date) {
    var seed = date.toDateString().split("").reduce(function (a, c) { return a + c.charCodeAt(0); }, 0);
    var t = {};
    SLOTS.forEach(function (s, i) { if ((seed * (i + 5)) % 10 < 3) t[s] = true; });
    return t;
  }
  function dn(d) {
    var t = new Date(), tm = new Date(t.getTime() + 86400000);
    if (d.toDateString() === t.toDateString()) return "Today";
    if (d.toDateString() === tm.toDateString()) return "Tmrw";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  function fullDay(d) {
    var t = new Date(), tm = new Date(t.getTime() + 86400000);
    if (d.toDateString() === t.toDateString()) return "Today";
    if (d.toDateString() === tm.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }
  function dateLabel(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  var DAYS = buildDays();
  var state = { open: false, step: 1, dayIdx: 0, slot: null, form: { name: "", phone: "", biz: "" } };
  var root = document.getElementById("modal-root");

  function schedulerHTML() {
    var day = DAYS[state.dayIdx], taken = bookedSet(day), s = "";

    if (state.step === 1) {
      s += '<div class="sched-head"><div>' +
        '<div class="sched-eyebrow"><i data-lucide="calendar-check"></i> 15-minute setup call</div>' +
        '<div class="sched-title">Pick a time. I\'ll confirm by text within the hour.</div>' +
        '</div></div>';
      s += '<div class="sched-host"><div class="av">SC</div><div class="meta"><b>' + esc(CFG.MY_FULLNAME) + '</b><span>' + esc(CFG.MY_BUSINESS) + ' · ' + esc(CFG.CITY) + '</span></div></div>';
      s += '<div class="sched-days">';
      DAYS.forEach(function (d, i) {
        s += '<button type="button" class="sched-day' + (i === state.dayIdx ? " on" : "") + '" data-day="' + i + '"><span class="dn">' + dn(d) + '</span><span class="dd">' + d.getDate() + '</span></button>';
      });
      s += '</div>';
      s += '<div class="sched-slotlabel"><span>Open times · ' + fullDay(day) + ' ' + dateLabel(day) + '</span><span class="tz">Pacific</span></div>';
      s += '<div class="sched-slots">';
      SLOTS.forEach(function (sl) {
        s += '<button type="button" class="sched-slot' + (state.slot === sl ? " on" : "") + '"' + (taken[sl] ? " disabled" : "") + ' data-slot="' + sl + '">' + sl + '</button>';
      });
      s += '</div>';
      s += '<div class="sched-foot">' +
        '<button class="btn btn-primary btn-block" data-next' + (state.slot === null ? " disabled" : "") + '>' +
        (state.slot === null ? "Pick a time above" : "Continue — " + fullDay(day) + " at " + state.slot) +
        '<i data-lucide="arrow-right"></i></button>' +
        '<div class="sched-fine"><i data-lucide="shield-check"></i><span>No pitch on the call. I grab your details and answer questions. That\'s it.</span></div>' +
        '</div>';
    } else if (state.step === 2) {
      s += '<div class="sched-head" style="align-items:center;">' +
        '<button type="button" class="sched-back" data-back><i data-lucide="arrow-left"></i> Change time</button>' +
        '<span class="sched-when"><i data-lucide="calendar"></i> ' + fullDay(day) + ' · ' + state.slot + '</span></div>';
      s += '<div class="sched-form">' +
        '<div class="field"><label>Your name</label><input class="input" data-f="name" value="' + esc(state.form.name) + '" placeholder="Alex Rivera" autofocus></div>' +
        '<div class="field"><label>Mobile number</label><input class="input" data-f="phone" value="' + esc(state.form.phone) + '" placeholder="(503) 555-0188" inputmode="tel"></div>' +
        '<div class="field"><label>Your business <span style="color:var(--fg-subtle);font-weight:400;">(optional)</span></label><input class="input" data-f="biz" value="' + esc(state.form.biz) + '" placeholder="Rose City Plumbing"></div>' +
        '</div>';
      s += '<div class="sched-foot">' +
        '<button class="btn btn-primary btn-block" data-book-confirm' + (state.form.name && state.form.phone ? "" : " disabled") + '>Book the call <i data-lucide="arrow-right"></i></button>' +
        '<div class="sched-fine"><i data-lucide="message-square"></i><span>I\'ll text ' + (state.form.phone ? esc(state.form.phone) : "you") + ' to confirm — no spam, no list.</span></div>' +
        '</div>';
    } else {
      var first = state.form.name ? ", " + esc(state.form.name.split(" ")[0]) : "";
      s += '<div class="sched-done">' +
        '<div class="sched-check"><i data-lucide="check"></i></div>' +
        '<div class="sched-done-title">You\'re on my calendar.</div>' +
        '<p class="small body-muted" style="max-width:30ch;">I\'ll text to confirm shortly. Talk soon' + first + '.</p>' +
        '<div class="sched-receipt">' +
        '<div class="r"><span>When</span><b>' + fullDay(day) + ', ' + dateLabel(day) + ' · ' + state.slot + ' PT</b></div>' +
        '<div class="r"><span>With</span><b>' + esc(CFG.MY_FULLNAME) + '</b></div>' +
        '<div class="r"><span>Confirm to</span><b>' + (esc(state.form.phone) || "—") + '</b></div>' +
        '</div>' +
        '<p class="fine" style="max-width:32ch;">Rather just talk now? Call or text <a href="' + CFG.MY_SMS_HREF + '" style="color:var(--brand-deep);font-weight:700;">' + esc(CFG.MY_PHONE) + '</a>.</p>' +
        '<button class="btn-link" data-restart><i data-lucide="rotate-ccw"></i> Pick a different time</button>' +
        '</div>';
    }
    return '<div class="sched sched--modal">' + s + '</div>';
  }

  function render() {
    if (!state.open) { root.innerHTML = ""; document.body.style.overflow = ""; return; }
    root.innerHTML =
      '<div class="modal-overlay" data-overlay role="dialog" aria-modal="true" aria-label="Book a setup call">' +
      '<div class="modal-card">' +
      '<button class="modal-x" data-close aria-label="Close"><i data-lucide="x"></i></button>' +
      schedulerHTML() +
      '</div></div>';
    document.body.style.overflow = "hidden";
    icons();
    bindModal();
  }

  function bindModal() {
    var overlay = root.querySelector("[data-overlay]");
    if (!overlay) return;
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    var x = root.querySelector("[data-close]");
    if (x) x.addEventListener("click", close);

    if (state.step === 1) {
      root.querySelectorAll("[data-day]").forEach(function (b) {
        b.addEventListener("click", function () { state.dayIdx = parseInt(b.getAttribute("data-day"), 10); state.slot = null; render(); });
      });
      root.querySelectorAll("[data-slot]").forEach(function (b) {
        b.addEventListener("click", function () { state.slot = b.getAttribute("data-slot"); render(); });
      });
      var next = root.querySelector("[data-next]");
      if (next) next.addEventListener("click", function () { if (state.slot !== null) { state.step = 2; render(); } });
    } else if (state.step === 2) {
      var confirm = root.querySelector("[data-book-confirm]");
      root.querySelectorAll("[data-f]").forEach(function (inp) {
        inp.addEventListener("input", function () {
          state.form[inp.getAttribute("data-f")] = inp.value;
          if (confirm) confirm.disabled = !(state.form.name && state.form.phone);
        });
      });
      var back = root.querySelector("[data-back]");
      if (back) back.addEventListener("click", function () { state.step = 1; render(); });
      if (confirm) confirm.addEventListener("click", function () { if (state.form.name && state.form.phone) { state.step = 3; render(); } });
    } else {
      var restart = root.querySelector("[data-restart]");
      if (restart) restart.addEventListener("click", function () {
        state.step = 1; state.slot = null; state.form = { name: "", phone: "", biz: "" }; render();
      });
    }
  }

  function open() { state.open = true; render(); }
  function close() { state.open = false; render(); }

  window.bookNow = open;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && state.open) close(); });

  function initBookTriggers() {
    document.querySelectorAll("[data-book]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
  }

  /* ------------------------------- Boot ------------------------------- */
  function boot() {
    icons();
    initReveal();
    initCountUp();
    initHeader();
    initFaq();
    initBookTriggers();
    setTimeout(icons, 300);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
