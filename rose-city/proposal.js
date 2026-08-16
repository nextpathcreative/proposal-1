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
    MY_SMS_HREF: "sms:+19714195054",
    // Web3Forms public access key — emails each booking to nextpathcreativellc@gmail.com.
    // Same key is reused across every prospect proposal; the "proposal" field
    // below tells you which one a booking came from.
    FORM_KEY:    "4f4d72eb-936f-4fb0-b26a-09330c0a9fb0"
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

    // Cancel any in-flight animation before restarting.
    if (el.__countRaf) {
      cancelAnimationFrame(el.__countRaf);
      el.__countRaf = null;
    }

    el.textContent = "0";
    var dur = 1100, t0 = performance.now();
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 5);
      el.textContent = Math.round(eased * target);
      if (p < 1) {
        el.__countRaf = requestAnimationFrame(tick);
      } else {
        el.textContent = target;
        el.__countRaf = null;
      }
    }
    el.__countRaf = requestAnimationFrame(tick);
  }

  function resetCount(el) {
    if (el.__countRaf) {
      cancelAnimationFrame(el.__countRaf);
      el.__countRaf = null;
    }
    el.textContent = "0";
  }

  function initCountUp() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".countup"));
    if (!els.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach(function (e) {
        e.textContent = parseInt(e.getAttribute("data-count"), 10) || 0;
      });
      return;
    }

    if (!("IntersectionObserver" in window)) { els.forEach(animateCount); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target;
        if (en.isIntersecting) {
          if (el.__countInView) return;
          el.__countInView = true;
          animateCount(el);
        } else {
          el.__countInView = false;
          resetCount(el);
        }
      });
    }, { threshold: 0.4 });

    els.forEach(function (e) {
      resetCount(e);
      e.__countInView = false;
      io.observe(e);
    });
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
  // Bookable window: 11:00am – 6:00pm on the hour (a 30-min call from the 6:00
  // slot ends at 6:30, so the window still runs to 6:30). Hourly keeps the grid
  // compact so the modal fits without scrolling on mobile.
  var SLOTS = ["11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00"];

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
    // All offered times show as open — no simulated "already booked" slots, so
    // nothing looks arbitrarily closed. Simon confirms the exact time by text
    // after a request comes in. To show a realistic scattering of taken slots
    // instead, return a map keyed by slot, e.g. { "2:00": true }.
    return {};
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
  var state = { open: false, step: 1, dayIdx: 0, slot: null, sending: false, form: { name: "", phone: "", biz: "" } };
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
        '<div class="sched-done-title">Got it — I\'ll be in touch.</div>' +
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

  /* Sends the booking to Web3Forms, which emails it to me.
     `done(true)` on success, `done(false)` on any failure. */
  function submitBooking(done) {
    var day = DAYS[state.dayIdx];
    var payload = {
      access_key:  CFG.FORM_KEY,
      subject:     "New call booking — " + CFG.CLIENT + " (" + state.form.name + ")",
      from_name:   CFG.MY_BUSINESS + " proposal",
      // Booking details — these become the email body:
      name:        state.form.name,
      phone:       state.form.phone,
      business:    state.form.biz || "—",
      requested:   fullDay(day) + ", " + dateLabel(day) + " at " + state.slot + " PT",
      proposal:    CFG.CLIENT,      // which prospect page this came from
      page:        location.href
    };
    fetch("https://api.web3forms.com/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body:    JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) { done(!!(data && data.success)); })
      .catch(function () { done(false); });
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
      if (confirm) confirm.addEventListener("click", function () {
        if (!(state.form.name && state.form.phone) || state.sending) return;
        state.sending = true;
        confirm.disabled = true;
        confirm.innerHTML = "Booking…";
        submitBooking(function (ok) {
          state.sending = false;
          if (ok) { state.step = 3; render(); return; }
          // Send failed — re-enable and surface a call-me fallback so no lead is lost.
          confirm.disabled = false;
          confirm.innerHTML = 'Try again <i data-lucide="arrow-right"></i>';
          icons();
          var foot = confirm.parentNode;
          if (foot && !foot.querySelector(".sched-err")) {
            var er = document.createElement("div");
            er.className = "sched-fine sched-err";
            er.style.color = "#b91c1c";
            er.innerHTML = "<span>Couldn’t send just now — call or text " + esc(CFG.MY_PHONE) + " and I’ll lock it in.</span>";
            foot.appendChild(er);
          }
        });
      });
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

  /* Phone "tap to explore" (mobile only — the controls are display:none on desktop).
     The iframe is inert by default via CSS so the page scrolls through it; tapping
     activates inline scrolling, and Done — or a tap anywhere off the phone — exits.
     Taps inside the iframe don't bubble past its boundary, so they never exit. */
  function initPhoneActivate() {
    var screen = document.querySelector(".phone-screen");
    if (!screen) return;
    var activate = screen.querySelector(".phone-activate");
    var done = screen.querySelector(".phone-done");
    if (activate) activate.addEventListener("click", function () { screen.classList.add("is-active"); });
    if (done) done.addEventListener("click", function () { screen.classList.remove("is-active"); });
    document.addEventListener("click", function (e) {
      if (screen.classList.contains("is-active") && !e.target.closest(".phone")) {
        screen.classList.remove("is-active");
      }
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
    initPhoneActivate();
    setTimeout(icons, 300);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
