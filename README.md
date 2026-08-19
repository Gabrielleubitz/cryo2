# Cryotherapy Rejuvenate — landing page

A rebuild of [cryotherapyrejuvenate.com](https://cryotherapyrejuvenate.com/), a
cryotherapy clinic in Dickson City, PA. The centrepiece is a pair of
scroll-tied canvas sections built around the clinic's MECOTEC `cryo:one+`
chamber.

```
.
├── assets-src/     Original media pulled from the live WordPress site (285 MB, not deployed)
├── research/       Scraped copy, media manifest, testimonial transcripts
├── scripts/        ffmpeg pipeline: canvas frame sequences + video encoding
├── site/           The Next.js app
└── PLAN.md         Research findings and the design rationale
```

## Getting started

```bash
cd site
npm install
npm run dev          # http://localhost:3000
```

## Asset pipeline

Generated assets are committed under `site/public/`, so a normal build needs no
media tooling. Regenerate only if the sources change — both scripts are
idempotent and skip existing output (`FORCE=1` to rebuild).

```bash
./scripts/build-assets.sh      # frame sequences + video (needs ffmpeg)
cd site && node scripts/build-images.mjs   # AVIF/WebP responsive images
```

`build-assets.sh` does three things worth knowing about:

- **Bakes the scroll sequence.** A verified continuous, text-free window
  (86.5s–91.9s) of the MECOTEC film is cut to 120 WebP frames at two widths.
  The right 27% of each frame is cropped off — it's a dark out-of-focus pillar
  that reads as a smudge behind the copy. The shot actually runs to 94.5s, but
  the last 2.6s is both clients standing still close to camera; including it
  spent 40% of the scroll on nothing. Everything is graded on the way through —
  the footage is camera-flat with its black level around 18%, so the toe and
  contrast are restored and the blue pulled back, which is what makes the
  chamber glow read as a light source rather than a wash.
- **Strips the testimonial frames.** Each client video ships matted inside a
  decorative "CLIENT TESTIMONIAL" border; the crop lifts the inner footage out.
  Trim points were chosen from transcripts so every clip contains the client's
  condition *and* their outcome.
- **Ping-pongs the hero loop.** The only clean shot of the lit chamber door is
  short, so it plays forward then reversed into a seamless loop. Its top 140px
  is cropped away: the chamber wears a MECOTEC wordmark across its top panel
  that landed directly beside the Rejuvenate logo and read as two competing
  brands.

  The window has to sit strictly inside a single shot. Boundaries here are at
  29.13s and 31.73s, and the first cut of this loop started at 28.9s — so seven
  frames of the *previous* shot were baked in and the hero hard-cut twice per
  cycle. That is invisible in a screenshot and obvious in motion, which is what
  `scripts/check-loop.mjs` is for. Find boundaries with:

  ```bash
  ffmpeg -ss 24 -t 22 -i "$SEQ_SRC" \
    -vf "select='gt(scene,0.12)',metadata=print:file=-" -an -f null -
  ```

## The hero: wipe the frost

`FrostLayer` covers the hero with a sheet of frost you clear with the pointer.
The texture — cool grey base, cloud blotches, embedded six-armed crystals,
speckle — is baked once, cleared with a soft `destination-out` brush along the
pointer path, and refreezes over ~8s by recompositing that same texture at low
alpha. An intro sweep runs once on load, so touch users and anyone who never
moves the mouse still see the reveal.

Three things it deliberately does *not* do: block anything (the canvas is
`pointer-events: none`, and a falloff baked into the texture keeps the copy
column thin), stay bright (a white sheet made the frozen and wiped states look
identical — dulling it is what makes wiping reveal a glow), or run when idle.
That last one matters: this layer covers the viewport, so repainting it forces a
full recomposite every frame. Once nothing is being wiped and the sheet has
finished refreezing, it stops drawing entirely.

The copy sits on the **right**, which is the whole reason the layout works. The
chamber is on the left of every frame of this shot, so a conventional left-hand
headline sat directly over the one thing worth uncovering and left the frost
covering blank wall. The alternative was mirroring the footage, which would have
reversed the `cryo:one+` wordmark on the door.

## The scroll-tied canvas sections

Both live under `site/src/components/`, driven by `useSectionProgress` in
`src/lib/scroll.ts`, which reports 0..1 progress through a sticky section from a
rAF loop that only runs while the section is on screen.

It returns two visibility flags, and the difference is load-bearing. `active`
carries a 20% lookahead margin so progress is warm before a section arrives.
`onScreen` is strict, for work too expensive to run off screen — sections here
stack flush, so on a full-height hero the lookahead margin reports the *next*
section as visible at scroll 0. `MachineCanvas` painting on `active` cost 240
main-thread long tasks of 70–130ms in the first 16 seconds, pinning the page
near 15fps before you scrolled at all. On `onScreen` that is zero.

**`MachineCanvas`** — the chamber. Composites the real MECOTEC product render
and drives snowfall, cold vapor and door bloom from scroll position, with a
temperature readout counting +72°F to −220°F. No native turntable of this
machine exists, so nothing here pretends to be one.

The snow is 90 six-armed dendrites drawn in two depth passes, so flakes cross
both behind and in front of the chamber. Each sprite is stroked once into its
own canvas at startup and then blitted with a transform — re-stroking ~90
branching paths every frame does not hold 60fps. A gradient scrim sits under
the copy column, because otherwise flakes land in the middle of letterforms.

### The callouts point at the machine

Three callouts advance as you scroll, and the first version of this was the
weakest thing on the page: the copy cross-faded in a box at the bottom left
while the machine did nothing, so there was no way to tell anything had
happened. The `HOTSPOTS` entries carried `x`/`y` coordinates that were never
read by anything.

They are now numbered pins tracking the part each callout names — the shell for
"fully electric", mid-interior for the even cold, the doorway threshold for the
walk-in floor. Coordinates are fractions of the *drawn machine's* box rather
than the viewport, so pins hold their spot through the scroll-tied push-in and
across breakpoints. Three things fall out of that:

- **The pins are DOM, positioned from the canvas loop.** The loop already knows
  the machine's rect, so it writes `transform` through refs. Publishing the rect
  as state would re-render on every frame.
- **A moving vignette does the spotlighting, not an additive glow.** Screen-
  blending a glow onto a near-white shell produces nothing, which is why the
  first attempt looked inert. Instead the existing vignette's bright zone eases
  toward the active pin, dimming everything except the part being named — same
  draw call, and it travels.
- **No single fill keeps a pin legible.** They land on a white shell, a bright
  blue interior, or the dark page. The active pin is blue banded by a white ring
  and a dark ring outside it, so at least one band always separates it from the
  background; the pulse is dark for the same reason.

Pins are hidden on narrow viewports, where the machine is a third of the size
and the callouts sit directly beneath it. What carries the sequence everywhere
is the progress rail: three segments that fill continuously with scroll, because
segments that only switched at each threshold gave no feedback across the
majority of the scroll where nothing changes.

**`SessionScrub`** — the three minutes. `ScrollCanvas` preloads 120 frames as
`ImageBitmap`s and scrubs them 1:1 with scroll, with copy beats at 0:00, 1:00,
2:00 and 3:00 so the scroll *is* the session.

`ScrollCanvas` handles DPR-correct sizing, a bounded fetch pool, holding the
nearest loaded frame instead of flashing, and a `focusY` cover-fit anchor to
keep subjects in frame. Its `enabled` prop gates preloading until the section
is within 1.5 viewports — that alone cut initial page weight from 2.86 MB to
0.56 MB.

Two details in there are load-bearing, and both caused a visible glitch when
they were wrong:

- **The preload effect's dependencies must be stable.** `widths` was passed as
  an array literal, so it had a new identity on every render, which restarted
  the effect — closing every `ImageBitmap` and refetching the sequence. Since
  each loaded frame also called `setLoaded`, that render fed straight back into
  the refetch. One scroll pass issued 249 requests for 111 frames, with a
  single frame fetched 27 times, and the canvas visibly jumped between whatever
  two frames happened to exist. `scripts/probe-seq.mjs` asserts the healthy
  shape: 120 requests, 120 unique frames, zero refetched.
- **Frames load coarse-to-fine**, both ends then repeated bisection, rather
  than in order. The scrub holds the nearest loaded frame, so filling the
  timeline evenly means an early scroll looks like a low-framerate version of
  the finished sequence instead of snapping between frame 1 and frame 120.

Both sections render a fully readable static fallback under
`prefers-reduced-motion`, with no canvas mounted at all.

## Verification

```bash
cd site
npx tsc --noEmit && npx eslint src
npm run build

node scripts/shoot.mjs http://localhost:3000/ /tmp/shots          # scroll screenshots
node scripts/shoot.mjs http://localhost:3000/ /tmp/shots --mobile
node scripts/audit.mjs http://localhost:3001/                     # reduced motion + payload
node scripts/probe-seq.mjs http://localhost:3001/                 # frame refetch check
node scripts/perf-hero.mjs http://localhost:3001/                 # main-thread long tasks
node scripts/shoot-hero.mjs http://localhost:3001/ /tmp/hero      # frost states
node scripts/shoot-chamber.mjs http://localhost:3001/ /tmp/ch     # callout sequence
node scripts/check-loop.mjs public/video/hero-loop.mp4            # no cut in the loop
```

`perf-hero.mjs` buckets long tasks by 2s window, which is the part that matters:
a busy first second is startup, a busy tenth second is a loop that should have
stopped. Pass `--reduced` for a no-animation floor to compare against.

`shoot-chamber.mjs` exists because the chamber is 420vh of sticky scroll, so
ordinary full-page screenshots step straight over the middle of it and only ever
catch the first callout. It stops at six points, prints the rail fill beside the
copy showing at each, and takes `--mobile`.

Current numbers: 0.48 MB initial load, 3.25 MB after scrolling the entire page,
120/120 unique frame requests with zero refetches, **zero main-thread long tasks
over 16s on the hero**, all routes statically prerendered, no console or network
errors, and every text/background pair passing WCAG AA.

## Type

Three faces, each with one job: **Anton** for display, **Inter** for body,
**JetBrains Mono** for readouts and labels. A condensed poster weight against
clinical mono readouts — the display was Inter Tight, which is competent and
says nothing, because every dark landing page uses it.

Anton ships a single weight and no italic, which sets most of the rules:

- **Hierarchy comes from size and case, never weight.** Its one weight already
  reads as roughly 900, so `.text-display` and `.text-h2` are declared at 400.
  Asking for bold would only trigger faux-bolding, which smears a face this
  heavy.
- **Accents are colour only.** The hero's `−220°F` is brand blue rather than
  italic, because a synthesised oblique on Anton smears the same way.
- **It applies to `h1`/`h2` only.** `h3`/`h4` stay in the sans. A display face
  at 1.5rem stops reading as a choice and starts reading as the wrong body font,
  and card titles need to sit quietly beside body copy.

Being condensed with shallow descenders, it takes a larger size and tighter
leading than a normal-width face at the same measure — hence `9.4vw` capped at
`8.25rem`. Leading is `0.92` rather than the `0.88` that looked right on desktop:
narrow viewports stack the headline into two lines and 0.88 had them colliding.
Tracking is only `-0.005em`, since Anton is already tight by design.

One thing this face demands that a normal-width sans does not: **headline
measures have to be checked against the copy, not chosen once.** Anton sets wide
for its height, so a heading that fits `max-w-2xl` in Inter overflows into a
third ragged line here. Two headings needed work after the switch — the benefits
heading is two sentences, so the break is forced between them and the measure
widened to clear the longer line; the localized heading sits in a half-width
column and was simply rewritten shorter ("Cold, exactly where it hurts").
`text-wrap: balance` will not save a line that cannot fit.

## The testimonial rail

Four clips of real clients, and both of the problems they pose are lighting.
They were shot in a bright waiting room with pale walls, so against a near-black
page they read as four glaring rectangles in four slightly different colours.
At rest each poster is desaturated and dimmed with a CSS `filter` and washed
with flat brand blue; playing sets the filter to `none`, so the footage plays
exactly as shot. The point is to make the rail read as one filmstrip while idle
without ever misrepresenting the video.

The cards are also cropped shorter than the 9:16 source. The subjects sit low in
frame, so cropping the ceiling away with `object-position: 50% 42%` moves them
toward the middle and lets the whole card — quote, name and condition — land in
one screen instead of running past the fold. Narrow viewports stay taller
(`2/3` rather than `4/5`), because the quote wraps to three lines there and the
shorter card left the play button sitting on top of the text.

## Content decisions

Business facts live in one place, `site/src/lib/business.ts`. A few deliberate
departures from the legacy site are documented there and in `PLAN.md` — most
importantly, **Mark's testimonial is not published**: he is a stage-4 cancer
patient attributing normalised blood counts to the chamber, which is not a claim
this business should be making. The source file is retained in `assets-src/`.

See "Open questions" in `PLAN.md` for what still needs the client's input —
chiefly the booking URL, which is currently a placeholder anchor.
