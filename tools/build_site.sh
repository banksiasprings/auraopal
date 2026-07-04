#!/usr/bin/env bash
# Assemble the publishable static site from www/ + data/ + icons/ into _site/.
# The app source lives in www/ (index.html, sw.js, manifest.json); the canonical
# data + icons are top-level siblings. GitHub Pages branch-source can only serve
# root or /docs, so we flatten everything into _site/ (used by BOTH the deploy
# workflow and local preview) — published at banksiasprings.github.io/auraopal/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/_site"
rm -rf "$OUT"; mkdir -p "$OUT"
cp -R "$ROOT/www/." "$OUT/"
cp -R "$ROOT/data"  "$OUT/data"
cp -R "$ROOT/icons" "$OUT/icons"
# The source KML (opal_mine_v2.kml, ~12 MB) is kept in the repo for reference/re-ingestion
# but is NOT needed at runtime (the app uses the extracted GeoJSON/photos) — keep it out of
# the published site so Pages doesn't serve 12 MB.
rm -f "$OUT/data"/*.kml
touch "$OUT/.nojekyll"
echo "Assembled $OUT ($(find "$OUT" -type f | wc -l | tr -d ' ') files)"
