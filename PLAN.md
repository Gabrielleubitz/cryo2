# Cryotherapy Rejuvenate — Landing Page Plan

Rebuild of https://cryotherapyrejuvenate.com/ (currently WordPress on WP Engine).

---

## 1. What this company actually does

**Cryotherapy Rejuvenate** is a single-location cryotherapy wellness clinic.

| | |
|---|---|
| Address | 757 Scranton Carbondale Highway, Dickson City, PA 18508 |
| Phone | 570-290-1979 |
| Email | info@cryotherapyrejuvenate.com |
| Hours | Mon–Fri 11 AM–7 PM · Sat 9 AM–1 PM · Sun 9 AM–1 PM |
| Owners | Mike Amory & Mark Heise |
| Region | Northeastern Pennsylvania (NEPA) / Scranton |

**The core offer is a 3-minute whole-body cryotherapy session.** Their own tagline is "The Best 3 Minutes Of Your Life!" — that number is the single strongest hook on the site and it is currently buried.

### Equipment (the hero of the page)

1. **MECOTEC `cryo:one+`** — a fully electric whole-body chamber. White shell, floor-to-ceiling electric-blue lit door. **No liquid nitrogen** — this is a real differentiator worth stating plainly, since most US cryo clinics use nitrogen vapor. Sub-zero cold is evenly distributed head-to-toe.
2. **MECOTEC `cryoair`** — portable/localized cryotherapy for targeted treatment, plus a **facemask attachment** for cryo facials.

### Services & benefits they claim
Muscle recovery · improved circulation · skin rejuvenation (collagen) · pain relief · weight loss via thermogenesis. Localized adds: pinpoint pain management, post-surgical/strain recovery, cryo facials.

### Pricing (verbatim from their packages page)

| Package | Monthly unlimited | 1 | 5 | 10 |
|---|---|---|---|---|
| Student-Athlete (school ID) | $175 | $20 | $75 | $100 |
| Adult 18+ | $225 | $30 | $125 | $200 |
| Military / First Responder | — | $25 | — | — |

3/6/12-month and family promos exist but are "call us" only.

### Audience
Three clearly-defined segments they already price for: **student-athletes** (they name Univ. of Scranton, Penn State, King's, Wilkes, Misericordia, Keystone, Lackawanna), **adults/professionals**, and **military/first responders**. Seniors are mentioned in prose but have no package.

### Positioning I'd recommend
> World-class recovery technology that normally lives in pro sports facilities — three minutes from your door in Dickson City.

The two real assets are **the machine** (genuinely high-end, electric, no nitrogen) and **the owners** (Mike: 35+ yrs medical devices, 15 yrs traveling with college teams; Mark: 24 yrs ops/customer service). Local + credible + high-tech.

---

## 2. Content problems found on the current site (fix while rebuilding)

These are real inconsistencies in their live copy — worth confirming with the client rather than carrying over:

- **"Iceberg Cryo" vs "MECOTEC"** — headings still say "Benefits of the Iceberg Cryo" and "the Iceberg Cryo facemask" while the body text says MECOTEC. Leftover from a previous vendor.
- **"Antarctica WBC"** images still in the media library from that same old vendor.
- **Two different phone numbers**: `570-290-1979` sitewide vs `(570) 228-CRYO` on the packages page.
- **Packages page calls both products "MECOTEC electric cryo chamber"** — the localized one should be `cryoair`.
- **"the heart of Scranton, PA"** on the homepage, but the clinic is in Dickson City (~10 min away). SEO targets both; copy should stop conflating them.
- **Military package reads "5 min – $25.00 Single 3 minute session"** — contradictory duration.
- A **senior package image** exists ("Senior Adults Over 65 with ID") with no matching price.

---

## 3. Assets — fetched and inventoried

Everything is downloaded to `assets-src/` (285 MB raw). Full media manifest in `research/media-library.json`, copy in `research/site-copy.txt`.

| Folder | Count | Highlights |
|---|---|---|
| `video/` | 4 | **`mecotec-chambers.mp4`** (1920×1080, 105s) ← canvas sequence source; banner + b-roll |
| `testimonials/` | 5 mp4 + 5 posters | **Real client videos, vertical 1440×2560** — Mark, Ken, Mary, Jane, Nadine |
| `machines/` | 13 | Transparent product renders of `cryo:one+` and `cryoair multi`, portable units |
| `chamber/` | 8 | Real installed chamber at Dickson City, incl. clean vertical hero shot |
| `team/` | 3 | **Mike & Mark in front of the chamber** — excellent authentic photo |
| `brand/` | 4 | Logo white/black/icon + SVG |
| `lifestyle/` | 15 | Athletes, jogging, pickleball, community |

**Brand colors extracted from the logo and chamber:**

```
--brand-blue    #305CDE   /* logo blue */
--chamber-blue  #2519E7   /* the lit door — use as accent glow */
--deep-blue     #0200D3
--ink           #0C061A   /* logo black */
```

Five real vertical client testimonial videos is an unusually strong asset for a business this size — that should be a major section, not a footnote.

### Asset work needed
- `lifestyle/athletes-recovery.jpg` is **29 MB / 9603×5402** — must be resized.
- Testimonial videos are 25–40 MB each (192s+). Need transcoding to web (H.264 + WebM, ~1080×1920, poster frames already downloaded) and trimming to 30–60s highlights.
- All raster images → AVIF/WebP with responsive `srcset`.

---

## 4. The centerpiece: Scroll-Tied Canvas Rendering

### What I verified

I probed every video and product image for a usable machine sequence. Findings:

- **There is no native 360° turntable of the machine** anywhere in their library. The product images are single-angle renders.
- The MECOTEC film is a **B2B sales video** aimed at clinic owners — MECOTEC branding, text overlays like "Proven Profit Centers", and a `mecotec.net` end card. Most of it is unusable as-is.
- **But** I ran shot detection and found a clean window at **86.5s–95s: a continuous, text-free, single shot** of two real clients moving around the lit blue chamber in heavy cryo mist. No third-party branding. This is genuinely usable.

I then benchmarked the payload of that window as a scroll-scrub sequence:

| Encoding | Frames | Avg/frame | Total |
|---|---|---|---|
| WebP q70 @ 1440px | 120 | 17.1 KB | **2.00 MB** |
| WebP q70 @ 1080px | 120 | 11.9 KB | 1.40 MB |
| WebP q55 @ 900px | 120 | 8.1 KB | 0.95 MB |

**2 MB for a 120-frame 1440px scroll-scrub is entirely shippable.** Serve 1440px on desktop, 900px on mobile.

### Proposed design — a two-act canvas centerpiece

**Act I — "Meet the chamber" (procedural canvas, ~100vh sticky)**

Rather than fake a turntable that doesn't exist, this act composites the *real* high-res `cryo:one+` product render on canvas and drives cryo-native effects from scroll progress:

- Base layer: the transparent MECOTEC render, scroll-tied slow push-in and parallax.
- Snow layer: six-armed dendrites falling through the frame as progress increases (this started as line-drawn ice crystals creeping in from the edges — see §7).
- Vapor layer: a lightweight particle field of nitrogen-free cold mist pooling at the base.
- Glow layer: the door's blue bloom ramping from cool white to `#2519E7`.
- HUD: a temperature readout counting **+72°F → −220°F** locked to scroll, with hotspot callouts pinned to the machine (door, control panel, even head-to-toe airflow) that fade in at set progress thresholds.

This is honest (real machine, real spec), light (~1 MB), resolution-independent, and it *earns* the canvas rather than decorating with it.

**Act II — "The best 3 minutes of your life" (frame-sequence scrub, ~200vh sticky)**

The classic Apple-style technique, using the verified 86.5–95s window: 120 real frames preloaded and drawn to `<canvas>`, scrubbed 1:1 with scroll. Real clients, real mist, real chamber. Overlaid copy beats appear at progress checkpoints — `0:00 step in` → `1:00` → `2:00` → `3:00 done` — so the scroll literally *is* the three minutes.

### Implementation notes
- Decode frames to `ImageBitmap` via `createImageBitmap`, draw with `drawImage` on a DPR-scaled canvas.
- Preload with concurrency cap + priority on first/last frame; show a determinate loader on the sticky panel.
- Map scroll → frame with `IntersectionObserver` + a single rAF loop; lerp frame index so it never jitters.
- **Mobile**: drop to 900px frames and halve to 60 frames.
- **`prefers-reduced-motion`**: skip both canvases, render a static hero image + the copy beats as a normal stacked list. Non-negotiable for accessibility.
- Both acts are progressive enhancement — the section is fully readable with JS off.

---

## 5. Page structure

1. **Hero** — full-bleed chamber, logo, `Restore & Rejuvenate` / "The best 3 minutes of your life." Primary CTA **Book Now**, secondary **See Packages**. Address + hours + "walk-ins welcome" chip.
2. **Trust bar** — no liquid nitrogen · fully electric MECOTEC · locally owned · walk-ins welcome.
3. **Act I canvas** — meet the `cryo:one+` (see §4).
4. **Benefits grid** — 5 cards: recovery, circulation, skin, pain, metabolism. Icon + one line each.
5. **Act II canvas** — the 3-minute scroll-scrub session (see §4).
6. **Localized cryo + cryo facial** — `cryoair`, split layout, facemask called out.
7. **Pricing** — 3 segment cards (student-athlete / adult / military-first-responder), monthly-unlimited highlighted as best value, "call for 3/6/12-mo + family".
8. **Testimonials** — horizontal rail of the 5 vertical client videos, phone-framed, tap/click to play with sound, muted autoplay preview on hover.
9. **Who we serve** — student-athletes, professionals, seniors, first responders + the named NEPA universities.
10. **Meet Mike & Mark** — the chamber photo, short credibility bios.
11. **FAQ** — accordion, from their existing FAQ (hours, booking, what to wear, payment).
12. **Book / visit** — map, hours, phone, form, directions from Scranton.

---

## 6. Tech stack

- **Next.js (App Router) + TypeScript**, static export — fast, great SEO for "cryotherapy Dickson City / Scranton / NEPA".
- **Tailwind CSS** with the brand tokens above.
- **Lenis** for smooth scroll; canvas driven by native scroll position (not a scroll-jacking library).
- **Custom `<ScrollCanvas>` component** — no heavy dependency; ~200 lines handling preload, DPR, rAF, and reduced-motion.
- **`sharp`** build script to generate AVIF/WebP responsive sets, plus an `ffmpeg` script to bake the frame sequence (both committed so assets are reproducible).
- Deploy to **Vercel**.

### Must-haves
LocalBusiness + FAQPage JSON-LD · real `<h1>` hierarchy · click-to-call · Lighthouse ≥95 · WCAG AA contrast (the blue-on-blue needs care) · keyboard-accessible video rail.

---

## 7. What shipped (and what changed during the build)

The landing page is built in `site/`. Three things I found mid-build that
changed the plan:

1. **The testimonials were filmed at the Dallas, PA clinic**, not Dickson City —
   I transcribed the audio and the interviewer says so on camera. The section
   now discloses this ("filmed at our sister clinic in Dallas, PA, on the same
   MECOTEC equipment"). Worth confirming you're happy to feature them at all.
2. **Mark's testimonial is not published.** He is a stage-4 cancer patient
   attributing normalised blood counts to the chamber. The interviewer does add
   a disclaimer on camera, but publishing it would be a health claim the clinic
   shouldn't make. Source retained in `assets-src/`; the other four are used.
3. **All testimonial pull-quotes are now verbatim** from the transcripts
   (`research/testimonial-transcripts.json`) rather than written for them, and
   each clip was retrimmed so it contains the client's outcome, not just the
   intro.

Also: the client videos ship matted inside a decorative "CLIENT TESTIMONIAL"
border, which is cropped off; the MECOTEC film's only usable window has a dark
foreground pillar on the right, which is cropped off; and the `athletes` image
in their library is a garish stock collage, so it's unused.

### Revision pass

A second pass on the UI and the video, after review:

1. **The session scrub was refetching itself.** `ScrollCanvas` took `widths`
   as an array literal, so its preload effect had a new dependency identity on
   every render and tore the sequence down and refetched it; because each
   loaded frame also set state, the render fed straight back into the refetch.
   One scroll pass made 249 requests for 111 frames and the canvas jumped
   between whatever two frames existed. That is what "the video is glitched"
   was. Fixed, and `site/scripts/probe-seq.mjs` now guards it.
2. **The session window was too long.** The shot runs 86.5–94.5s, but the last
   2.6s is both clients standing still close to camera — 40% of the scroll
   spent on nothing. It now ends at 91.9s, and the footage is graded (its black
   level sat around 18%, which is why it looked washed out).
3. **Frost is now snowfall.** The edge crystals read as stray lines rather than
   cold; they're replaced with real six-armed dendrites falling in two depth
   passes, with a scrim under the copy column so flakes don't sit inside
   letterforms.
4. **The chamber's own MECOTEC wordmark sat beside our logo** in the hero, so
   the top 140px of that shot is cropped away.
5. **The nav now persists.** The page is ~18 screens tall and the header
   scrolled away with the hero, leaving most of the page with no way to
   navigate or book. It's a fixed header that solidifies once you leave the
   hero.
6. **The benefit cards lost their fake stats.** Each was paired with a facility
   fact — "0 nitrogen used" under skin rejuvenation, "7 days a week" under
   metabolism — that looked like data and said nothing. The honest replacements
   would be clinical outcome numbers this clinic has no basis to publish, so
   the cards are indexed instead and the facts stay in the trust bar.

### Second revision pass — the hero

The first hero was a dark video with the headline over it and nothing to do.
For a page whose whole argument is *cold*, the first screen should be the one
place you feel it, so it now carries the site's only direct interaction:
**a sheet of frost you wipe away with the pointer.**

- `FrostLayer` bakes a frost texture once — cool grey base, cloud blotches,
  embedded six-armed crystals, speckle — and clears it with a soft brush along
  the pointer path, refreezing over ~8s. An intro sweep runs once on load so
  touch users and anyone who never moves the mouse still see it happen.
- **The copy moved to the right.** The chamber sits on the left of every frame
  of this shot, so the original layout put the headline directly over the one
  thing worth uncovering and left the frost covering blank wall — the wipe
  revealed nothing. Flipping the composition was the alternative to mirroring
  the footage, which would have reversed the `cryo:one+` wordmark on the door.
- The frost is a deliberately dull grey-blue, not white. A bright sheet made
  the frozen and wiped states look the same; dulling it means wiping is what
  makes the chamber glow.
- It never gates anything: the canvas is `pointer-events: none`, the copy
  column has a falloff baked into the texture, and reduced motion drops the
  layer entirely.

### Third revision pass — hero type and placement

- **New display face.** Inter Tight → **Anton**, a condensed poster weight set
  against the clinical mono readouts. Applied to `h1`/`h2` site-wide, since a
  display face used only in the hero reads as a mistake rather than a system.
  `h3`/`h4` stay in the sans. See the Type section of the README for the
  constraints a single-weight, no-italic face imposes.
- **Copy anchored low instead of centred.** The block sits in the lower right,
  which leaves the frosted chamber the whole upper frame to read as a full sheet.
- **One fewer stacked element.** The eyebrow/headline/body/CTA/fine-print stack
  was five deep and read like a template. The fine print was the same register as
  the address, so it moved onto that rail; a short rule now leads the eyebrow.
- **Tighter copy.** "Walk in, chill out, feel better" is gone — walk-ins are
  already stated on the rail below, and the line was doing tone rather than work.

**The hero loop contained a hard cut.** The window ran 28.9–31.6s, but the shot
actually starts at 29.13s — so the first seven frames were the tail of the
previous shot, and the loop cut to a different image 0.2s in, then again on the
way back through the reversed half. Frame-to-frame difference spiked to 29.9
against a median of 0.073. The window is now 29.2–31.65s, strictly inside the
shot, and `site/scripts/check-loop.mjs` fails the build on any cut or a jumpy
wrap. The session sequence was checked the same way and is clean.

**A rendering bug this surfaced.** Profiling the new hero showed 240 main-thread
long tasks of 70–130ms in the first 16 seconds — the page was pinned at roughly
15fps before you scrolled at all. The frost was not the cause. `MachineCanvas`
gates its render loop on `useSectionProgress`, whose observer carries a 20%
lookahead margin; because the chamber section starts flush against the bottom of
a full-height hero, that margin reported it as visible at scroll 0. It had been
painting three full-viewport gradients and ~150 particles every frame the entire
time anyone sat on the hero. `useSectionProgress` now also returns a strict
`onScreen` flag for work that must not run off screen. **240 long tasks → 0.**

### Fourth revision pass — the rest of the page

With the hero settled, the same review applied to every other section. Six
things, and the first two are consequences of the typeface change that only show
up below the fold.

- **Two headings no longer fit their measure.** Anton sets wide for its height,
  so headings sized for Inter overflowed. "Cold is the trigger. Your body does
  the rest." was breaking after *"Your"* — mid-sentence — so the break is now
  forced between the two sentences and the measure widened from `2xl` to `4xl` to
  clear the longer line. The localized heading sits in a half-width column where
  no measure would fit it, so it was rewritten: **"Cold, exactly where it hurts"**
  — shorter, and more accurate about what localized treatment is for than "in one
  exact place."
- **The chamber section opened with an empty column.** The first hotspot appeared
  at 16% scroll progress, so the copy column sat blank for the first sixth of the
  section — it read as a broken layout rather than an intro. It now shows from the
  moment the section lands, the same reasoning as opening the first FAQ item.
- **The testimonial rail was four glaring rectangles.** Bright waiting-room
  footage against a near-black page, in four slightly different colours. Posters
  are now dimmed and cooled at rest and restored to the untouched footage on
  play; cards are cropped shorter so the whole card lands in one screen; the play
  button went from a translucent grey circle to brand blue. See the README for
  why the crop is different on narrow viewports.
- **The pricing cards drifted out of alignment.** "Military & First Responder"
  wraps to two lines and the other two names do not, which pushed everything
  below it down by a line. The title now reserves two lines' worth at `lg`.
- **The visit card could not fit its own contact details in two columns.** It
  sits in a half-width card, so an even split orphaned "Highway" onto its own
  line; widening the address column then broke the email mid-word
  (`…rejuvenate.c / om`). Neither side can be wide enough, so location, contact
  and hours are stacked in one column — which the card had the height for
  anyway.

Payload and performance are unchanged: 0.48 MB initial, 3.25 MB after a full
scroll, 0 long tasks, 120/120 unique frame requests.

### Fifth revision pass — making the chamber callouts legible

The three chamber callouts were the weakest interaction on the page: the copy
cross-faded in a box at the bottom left while the machine sat there unchanged,
so scrolling 420vh produced no evidence that anything was happening. The cause
was visible in the data — each callout already carried `x`/`y` coordinates
naming a part of the machine, and nothing ever read them.

The callouts now annotate the machine. Numbered pins sit on the part each one
names, the vignette's bright zone eases across to whichever is current so a
spotlight travels between them, and a rail below the copy fills continuously
with scroll. Two of the three fixes were about contrast rather than mechanics,
and the README covers why: an additive glow is invisible on a white shell, and
no single pin fill survives a white shell, a lit blue interior and the dark page
at once.

One pin was also pointing at the wrong thing — "Walk-in floor" sat on the outer
side wall. It is on the doorway threshold now. `scripts/shoot-chamber.mjs`
captures the sequence at six scroll positions and prints the rail state beside
the copy visible at each, since this is exactly the kind of thing a full-page
screenshot pass steps over.

---

## 8. Open questions for you

1. **Booking** — what system do they use? The current site's "Book Now" needs to point somewhere. Embed or link out?
2. **Testimonial videos** — OK to trim to 30–60s highlights, or keep full length?
3. **Copy** — should I write fresh copy (recommended, fixing §2) or preserve their existing wording?
4. **Scope** — landing page only, or the full site (About, Packages, FAQ, Contact)?

---

## 9. Still to do

- Wire the real booking system into `BUSINESS.bookingUrl`.
- Port the client agreement and privacy policy text into their stub routes.
- Confirm the Facebook and Instagram handles in `business.ts` (guessed from the
  legacy footer, which linked them without visible URLs).
- Replace the placeholder social/OG image if you want something other than the
  chamber hero.
- Deploy to Vercel and re-run Lighthouse against the live origin.
