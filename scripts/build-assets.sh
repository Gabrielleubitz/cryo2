#!/bin/bash
# Bakes the scroll-canvas frame sequences and web-ready video from assets-src/.
# Idempotent: skips work that already exists. Re-run with FORCE=1 to rebuild.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets-src"
PUB="$ROOT/site/public"

mkdir -p "$PUB"/{seq/session,video,img}

have() { [ -s "$1" ] && [ "${FORCE:-0}" != "1" ]; }

# ---------------------------------------------------------------------------
# 1. Act II frame sequence — "the best 3 minutes of your life"
#    Source window verified continuous + text-free: 86.5s -> 91.9s of the
#    MECOTEC film (a client leaving the lit chamber, joined by a second).
#
#    The window stops at 91.9s on purpose. The shot runs to 94.5s, but the last
#    ~2.6s is both clients standing still close to camera — dead footage that
#    ate 40% of the scroll and made the scrub feel broken.
#
#    The right ~27% of every frame is a dark out-of-focus foreground pillar
#    that reads as a smudge behind the copy, so it is cropped off.
# ---------------------------------------------------------------------------
SEQ_SRC="$SRC/video/mecotec-chambers.mp4"
SEQ_START=86.5
SEQ_DUR=5.4
FRAMES=120
SEQ_CROP="crop=1400:1080:0:0"
# Camera-flat and milky: black level sits around 18% and everything is one
# blue. This restores the toe, adds contrast and pulls the blue back so the
# chamber glow reads as a light source against the dark page.
SEQ_GRADE="eq=contrast=1.16:saturation=0.9:gamma=0.97,curves=all='0/0 0.25/0.17 0.75/0.83 1/1',unsharp=5:5:0.35"

bake_seq() { # bake_seq <width> <quality> <outdir>
  local w="$1" q="$2" out="$3"
  if have "$out/frame_0120.webp"; then echo "skip  seq $(basename "$out")"; return; fi
  rm -rf "$out"; mkdir -p "$out"
  local tmp; tmp="$(mktemp -d)"
  # Oversample, then pick FRAMES evenly below, so SEQ_DUR can change freely
  # without the frame count drifting off 120.
  ffmpeg -v error -y -ss "$SEQ_START" -t "$SEQ_DUR" -i "$SEQ_SRC" \
    -vf "fps=30,$SEQ_CROP,$SEQ_GRADE,scale=$w:-2" -q:v 2 "$tmp/f_%04d.jpg"
  node -e "
    const sharp=require('$ROOT/site/node_modules/sharp');
    const fs=require('fs'),path=require('path');
    const tmp='$tmp',out='$out',q=$q,N=$FRAMES;
    (async()=>{
      const files=fs.readdirSync(tmp).filter(f=>f.endsWith('.jpg')).sort();
      if(files.length<N) throw new Error('only '+files.length+' source frames for '+N);
      let total=0;
      for(let i=0;i<N;i++){
        const src=files[Math.round(i*(files.length-1)/(N-1))];
        const dest=path.join(out,'frame_'+String(i+1).padStart(4,'0')+'.webp');
        await sharp(path.join(tmp,src)).webp({quality:q,effort:5}).toFile(dest);
        total+=fs.statSync(dest).size;
      }
      console.log('  ${w}px: '+N+' frames, '+(total/1048576).toFixed(2)+' MB');
    })();
  "
  rm -rf "$tmp"
  echo "ok    seq $(basename "$out")"
}

echo "== Act II frame sequences =="
bake_seq 1440 72 "$PUB/seq/session/1440"
bake_seq 900  66 "$PUB/seq/session/900"

# Poster for the sequence: the real first frame, so there is no content jump
# when the canvas takes over from the <img>.
SPOSTER="$PUB/img/session-poster.jpg"
if have "$SPOSTER"; then echo "skip  session-poster.jpg"; else
  ffmpeg -v error -y -ss "$SEQ_START" -i "$SEQ_SRC" -frames:v 1 \
    -vf "$SEQ_CROP,$SEQ_GRADE,scale=1440:-2" -q:v 5 "$SPOSTER"
  echo "ok    session-poster.jpg"
fi

# ---------------------------------------------------------------------------
# 2. Testimonial videos — trim to highlights, strip the vendor's frame, encode
#    Sources are 1440x2560 vertical, 3-4 min, 25-40MB each, and each one is
#    matted inside a decorative blue "CLIENT TESTIMONIAL" frame. TRIM_CROP
#    lifts just the inner phone footage back out.
# ---------------------------------------------------------------------------
echo "== Testimonials =="
TRIM_CROP="scale=720:-2,crop=568:906:74:214"

#    Windows below were chosen from transcripts so each clip contains the
#    client's actual condition AND their actual outcome, not just the intro.
#
#    Mark's testimonial is deliberately NOT published: he is a stage-4 cancer
#    patient attributing normalised blood counts to the chamber. Even with the
#    interviewer's on-camera disclaimer, that is a health claim this business
#    should not be making. Source file is retained in assets-src/ only.
trim() { # trim <name> <start> <dur>
  local n="$1" ss="$2" d="$3"
  local out="$PUB/video/$n.mp4"
  if have "$out"; then echo "skip  $n.mp4"; return; fi
  ffmpeg -v error -y -ss "$ss" -t "$d" -i "$SRC/testimonials/$n.mp4" \
    -vf "$TRIM_CROP" -c:v libx264 -profile:v main -crf 27 -preset slow \
    -movflags +faststart -c:a aac -b:a 96k -ac 1 "$out"
  echo "ok    $n.mp4 ($(du -h "$out" | cut -f1))"
}
trim ken    72 46   # five years of post-surgical pain -> "the pain was gone"
trim mary   17 46   # arthritis and old injury -> relief after first session
trim jane   19 60   # 75, rheumatoid arthritis -> "no back pain, very energized"
trim nadine 64 50   # healthcare provider -> "so much pain relief"

# Posters are taken mid-clip so people look engaged rather than mid-blink.
poster() { # poster <name> <seconds-into-trimmed-clip>
  local n="$1" at="$2"
  local P="$PUB/video/$n-poster.jpg"
  have "$P" && { echo "skip  $n-poster"; return; }
  ffmpeg -v error -y -ss "$at" -i "$PUB/video/$n.mp4" -frames:v 1 \
    -vf "scale=540:-2" -q:v 4 "$P"
  echo "ok    $n-poster.jpg"
}
poster ken    20
poster mary   18
poster jane   30
poster nadine 22

# ---------------------------------------------------------------------------
# 3. Hero ambient loop
#    The only long text-free shot of the lit chamber door with a client inside.
#    It's short, so it's ping-ponged (forward + reversed) into a seamless loop
#    and slowed slightly.
#
#    Shot boundaries here are at 29.13s and 31.73s, so the window has to sit
#    strictly inside them. It was 28.9s, which picked up the last 7 frames of
#    the previous shot and hard-cut mid-loop — a visible flash twice per cycle.
#    Verify with:
#      ffmpeg -ss 24 -t 22 -i "$SEQ_SRC" \
#        -vf "select='gt(scene,0.12)',metadata=print:file=-" -an -f null -
# ---------------------------------------------------------------------------
echo "== Hero loop =="
HERO="$PUB/video/hero-loop.mp4"
# The chamber wears a MECOTEC wordmark across its top panel, which landed
# directly beside the Rejuvenate logo in the nav and read as two competing
# brands. Dropping the top 140px removes it and loses nothing else.
HERO_CROP="crop=1920:940:0:140"
if have "$HERO"; then echo "skip  hero-loop.mp4"; else
  ffmpeg -v error -y -ss 29.2 -t 2.45 -i "$SEQ_SRC" \
    -filter_complex "[0:v]$HERO_CROP,$SEQ_GRADE,format=yuv420p,scale=1280:-2,setpts=1.35*PTS,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" \
    -map "[v]" -an -c:v libx264 -profile:v main -crf 30 -preset slow \
    -movflags +faststart "$HERO"
  echo "ok    hero-loop.mp4 ($(du -h "$HERO" | cut -f1))"
fi

# Hero poster, pulled from the same shot so there's no flash on load.
HPOSTER="$PUB/img/hero-poster.jpg"
if have "$HPOSTER"; then echo "skip  hero-poster.jpg"; else
  ffmpeg -v error -y -ss 30.1 -i "$SEQ_SRC" -frames:v 1 \
    -vf "$HERO_CROP,$SEQ_GRADE,scale=1920:-2" -q:v 4 "$HPOSTER"
  echo "ok    hero-poster.jpg"
fi

echo "== DONE =="
du -sh "$PUB/seq" "$PUB/video"
