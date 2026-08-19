#!/bin/bash
# Downloads the Cryotherapy Rejuvenate media library into the project.
set -u
DEST="${1:?usage: fetch_assets.sh <dest-dir>}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
BASE="https://cryotherapyrejuvenate.com/wp-content/uploads"

mkdir -p "$DEST"/{video,machines,chamber,team,brand,lifestyle,testimonials}

get() { # get <url-path> <outfile>
  local out="$DEST/$2"
  [ -s "$out" ] && { echo "skip  $2"; return; }
  curl -sfL --compressed -A "$UA" -H "Referer: https://cryotherapyrejuvenate.com/" \
       --max-time 180 "$BASE/$1" -o "$out" \
    && echo "ok    $2 ($(du -h "$out" | cut -f1))" \
    || echo "FAIL  $2"
  sleep 1
}

# --- Video: hero + machine sequence source ---
get 2025/11/MECOTEC-cryotherapy-whole-body-chambers.mp4          video/mecotec-chambers.mp4
get 2025/03/cryotherapy-banner-video.mp4                          video/banner.mp4
get 2025/04/aerial-view-of-a-snowy-forest-with-trees-covered-in-snow-SBV-348949650-HD.mp4 video/snowy-forest.mp4
get 2025/04/light-splashes-abstract-background-SBV-312843072-HD.mp4 video/light-splashes.mp4

# --- Testimonial videos + poster frames ---
get 2025/07/Cryotherapy-Client-Testimonial-Mark-Poster-Mark.mp4   testimonials/mark.mp4
get 2025/06/Client-Testimonial-Ken.mp4                            testimonials/ken.mp4
get 2025/06/Client-Testimonial-Mary.mp4                           testimonials/mary.mp4
get 2025/06/Client-Testimonial-Jane.mp4                           testimonials/jane.mp4
get 2025/06/Cryotherapy-Dallas-PA-Nadine-Testimonial.mp4          testimonials/nadine.mp4
get 2025/07/Cryotherapy-Client-Testimonial-Mark-Poster-scaled.jpg testimonials/mark-poster.jpg
get 2025/06/Client-Testimonial-Ken_frame-scaled.jpg               testimonials/ken-poster.jpg
get 2025/06/Client-Testimonial-Mary_frame-scaled.jpg              testimonials/mary-poster.jpg
get 2025/06/Client-Testimonial-Jane_frame-scaled.jpg              testimonials/jane-poster.jpg
get 2025/06/Cryotherapy-Dallas-PA-Nadine-Testimonial-frame-scaled.jpg testimonials/nadine-poster.jpg

# --- Machines / product cutouts ---
get 2025/08/SP11B_Product_Img.png                machines/sp11b-product.png
get 2025/11/SP11B-Image-2.jpg                    machines/sp11b-2.jpg
get 2025/11/SP11B-Image-3.jpg                    machines/sp11b-3.jpg
get 2025/11/SP4B-Image.png                       machines/sp4b.png
get 2025/11/SP4B-transparat-Product.png          machines/sp4b-transparent.png
get 2025/11/SP4B-Cutout.jpg                      machines/sp4b-cutout.jpg
get 2025/11/SP3B-Cutout.jpg                      machines/sp3b-cutout.jpg
get 2025/08/SP13B_Banner.jpg                     machines/sp13b-banner.jpg
get 2025/11/cryotherapy-cryoair-portable-devices-scaled.png machines/cryoair-portable.png
get 2025/11/Layer-0-scaled-v1-scaled.png         machines/layer-0-v1.png
get 2025/11/Layer-0-scaled.png                   machines/layer-0.png
get 2025/05/electric-cryotherapy-chamber-antarctica-open-head-v1.png machines/antarctica-open-head.png
get 2025/04/whole-body-cryotherapy-with-antarctica.jpg machines/antarctica-wbc.jpg

# --- Chamber / facility ---
get 2025/11/cryotherapy-whole-body-chambers-bg-img-1.jpg chamber/wbc-bg-1.jpg
get 2025/11/cryotherapy-whole-body-chambers-0m17s.jpg    chamber/wbc-0m17s.jpg
get 2025/11/cryotherapy-image-1.jpg                      chamber/cryotherapy-1.jpg
get 2025/11/Cryo-therapy-in-Dickson-City-Pa-scaled.png   chamber/dickson-city.png
get 2025/11/Cryo-therapy-in-Dickson-City-Pa-1-scaled.png chamber/dickson-city-1.png
get 2025/04/cryotherapy-restore-and-rejuvenate.jpg       chamber/restore-rejuvenate.jpg
get 2025/02/cryotherapy-restore-and-rejuvenate-scaled.jpg chamber/restore-rejuvenate-wide.jpg
get 2025/03/cryotherapy-banner-video-poster.jpg          chamber/banner-poster.jpg

# --- Team ---
get 2025/11/Mike-Amory-and-Mark-Heise-Co-Owners-Cryo-Therpay-Rejuvenate-Dickson-City.jpg team/mike-and-mark.jpg
get 2025/11/Mike-Amory-CryotherapyRejuvenate-scaled.png team/mike-amory.png
get 2025/03/Mike-Amory-Cryotherapy-Dallas-PA.jpg        team/mike-amory-alt.jpg

# --- Brand ---
get 2025/09/Cryotherapy-Rejuvenate-White.png  brand/logo-white.png
get 2025/09/Cryotherapy-Rejuvenate-Black.png  brand/logo-black.png
get 2025/09/Cryotherapy-Rejuvenate-Icon.png   brand/icon.png
get 2025/03/cryotherapy-site-logo.svg         brand/logo.svg

# --- Lifestyle / benefits ---
get 2025/02/athletes-recivery-cryotherapy-sessions.jpg   lifestyle/athletes-recovery.jpg
get 2025/02/college-athletes-recovery-therapy.png        lifestyle/college-athletes.png
get 2025/03/woman-jogging-outdoors.jpg                   lifestyle/woman-jogging.jpg
get 2025/03/person-tying-athletic-shoes.jpg              lifestyle/tying-shoes.jpg
get 2025/03/group-fitness-activity-outdoors.jpg          lifestyle/group-fitness.jpg
get 2025/02/picketball-cold-therapy-back-mountain-dallas-pa-scaled.jpg lifestyle/pickleball.jpg
get 2025/02/cryotherapy-weight-loss-benefits-NEPA-scaled.jpg lifestyle/weight-loss.jpg
get 2025/02/cryotherapy-sessions-neurons-scaled.jpg      lifestyle/neurons.jpg
get 2025/03/serving-the-local-community.jpg              lifestyle/local-community.jpg
get 2025/03/local-renewal-close-to-home-v1.jpg           lifestyle/local-renewal.jpg
get 2025/03/begin-your-wellness-journey-with-us.jpg      lifestyle/wellness-journey.jpg
get 2025/04/iStock-2153087169.jpg                        lifestyle/istock-recovery.jpg 2>/dev/null
get 2025/11/iStock-2153087169.jpg                        lifestyle/istock-recovery.jpg
get 2025/03/cryotherapy-package-1-student-athletes.jpg   lifestyle/pkg-student-athletes.jpg
get 2025/03/cryotherapy-package-3-adults-18plus.jpg      lifestyle/pkg-adults.jpg
get 2025/03/senior-adults-over-65-with-id.jpg            lifestyle/pkg-seniors.jpg

echo "=== DONE ==="
du -sh "$DEST"
