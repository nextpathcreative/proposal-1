# Proposal Page — Design Brief

Context and build rules for designing the proposal page. **Pair this with
`proposal-page-copy.md`** — that file has the exact, final copy, section by
section. This file has the intent, the audience, and the rules the copy can't
convey on its own.

---

## The three roles (so nothing gets confused)

- **The operator** — the person sending this proposal. Runs a small web-design business and pitches trades owners. This page is *their* sales asset.
- **The prospect** — the trades business owner receiving the proposal (a plumber, electrician, HVAC tech, etc.). The page is personalized to them.
- **You** — the design agent building the page.

---

## What you're building

A personalized proposal page the operator sends to a prospect after a cold call,
to pitch a free, low-risk landing-page test. It is **not** a customer-facing
service page — its only job is to get the prospect to book a 15-minute setup call.

---

## The single most important idea

**The page *is* the pitch.** The operator sells one thing: a fast, well-built
landing page that converts Google traffic into booked jobs better than a generic
website. So this proposal page has to *be* that — fast, clean, mobile-first,
obviously well-made. The prospect should feel the quality before they read a word
about it. A mediocre-looking proposal page quietly kills the entire offer. Make
this genuinely good; it's a live demonstration of the operator's work.

---

## Who it's for

A skeptical, busy trades owner — a peer, not a consumer. They have been buried in
agency spam promising "500% MORE LEADS." With this audience, **restraint and
honesty out-convert hype.** No marketing fluff, no glossy stock photography, no
jargon, no flashing urgency. Calm, plain, credible.

---

## Voice & tone

Honest-operator: direct, warm, plain-spoken, confident without being salesy. The
**visual** design should match the **written** voice — clean, trustworthy,
uncluttered, tradesperson-to-tradesperson. Avoid corporate-slick and
flashy-startup aesthetics alike. Do not rewrite or "improve" the copy; it's
final. Lay it out, don't edit it.

---

## The one action

Everything points to a single action: **book a 15-minute setup call** (primary
CTA, repeated down the page). Phone/text and "reply to my email" are the
**secondary** fallback. Keep the primary CTA visually dominant and consistent.

---

## Personalization is the emotional hook

Each page is reskinned per prospect — **their logo, their brand colors, their
business name in the headline.** It must feel made *for them*, not like a template
with a name dropped in. Build the brand color and logo as **single-source
variables** (one place to swap), so producing the next prospect's version is a
quick reskin, not a rebuild.

---

## Merge fields

The copy contains tokens like `{{CLIENT}}`, `{{CITY}}`, `{{DEMO_URL}}`. These are
filled in **before the page ships** (a build-time merge). Treat them as real,
filled content slots — never render the literal braces. The full field list and
what each means is at the top of `proposal-page-copy.md`. Highlights:
`{{CLIENT}}` is the prospect's business name (headline + personalization), and
`{{DEMO_URL}}` is the live demo link (see below — it's the strongest element on
the page).

---

## Landing-page doctrine to follow

This proposal page is itself a landing page and obeys the operator's landing-page
doctrine — **with one exception, noted next.**

- **Mobile-first.** Most of this audience reads on a phone. Design and test on a
  narrow viewport first.
- **Fast.** Target a sub-2-second load. Compress images, keep scripts minimal.
  (Speed is literally the product being sold.)
- **Trust density near the top.** The offer-reassurance chips — *no upfront cost,
  you keep your site, live in [X], switch back anytime* — sit right under the
  headline, above the fold.
- **Real / authentic imagery over stock.** If photos are used, lean real.
- **One CTA, repeated,** same target (the setup-call booking) every time.

### The one exception — this page MAY link out

On a customer-facing conversion page the rule is "no exit doors." **That rule does
not apply here.** This proposal page is *encouraged* to link out to: (1) the live
demo, (2) the operator's contact, and optionally (3) the prospect's existing
website. These support the pitch — do not strip them. The single *action* is
still booking the call; these links are proof and reassurance, not competing CTAs.

---

## The live demo is the strongest element

Section 8 links to a live demo page (`{{DEMO_URL}}`) — a real, working example of
the product the prospect would receive, including a bookable scheduler. Letting
the prospect *tap through and book a test visit themselves* beats any claim on the
page. Make this button prominent and inviting ("try it yourself"), not a buried
footnote.

---

## Stats — handle with care

A few statistics appear in the copy (Section 3). Each one **must display its small
source caption** (e.g. "Think with Google") as fine print near the number. Rules:

- Never drop a caption.
- Never inflate, round up, or restyle a number into something it isn't.
- Never add stats that aren't in the copy.

Credibility here comes from accurate attribution, not big flashy figures. A modest,
sourced number beats an impressive unsourced one with this audience.

---

## Section-by-section intent

Follow the copy deck's order (1–11). Intent per section so the visual hierarchy
serves the goal:

1. **Hero** — outcome headline + no-risk reassurance chips + primary CTA, all
   above the fold. The whole pitch in five seconds.
2. **The short version** — plain-language summary that answers "what's the catch"
   immediately. Calm and readable; don't let graphics fight the words.
3. **Why this works** — the persuasion-and-education core. The three captioned
   stats live here. This section carries the argument; give it room to breathe.
4. **What you're getting** — concrete list of what's on the landing page. Scannable.
5. **How the test works** — the reversible 4-step mechanism. A clean numbered/step
   layout works well; emphasize *one thing changes* and *fully reversible*.
6. **The terms** — what you get vs. what it costs, side by side. Make **$0 upfront**
   unmissable.
7. **Timeline** — a light 3-beat "yes → build → live." Reassuring, not heavy.
8. **Who you'd be working with** — the operator's credibility + the live-demo
   button. Keep it human; make the demo button prominent.
9. **Straight answers (FAQ)** — objection handling. Clean accordion or Q&A list.
10. **Final CTA** — one last, low-pressure push to book the call. Big and clear.
11. **Footer** — minimal: contact line + the "your site stays live" fine print.
    No multi-column site nav.

---

## Don't

- Don't rewrite, trim, or "polish" the copy — it's final.
- Don't add a multi-page nav menu or make it feel like a big website. It's one page.
- Don't use generic agency / heavy-stock visuals.
- Don't drop stat captions or render literal `{{merge}}` braces.
- Don't bury the booking CTA or the demo link.

---

## Output

A single static HTML page, mobile-first and fast (it will deploy on Cloudflare).
Brand logo and primary color as easily-swappable variables so each prospect's
version is a quick reskin.
