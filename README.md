# 🪨 AuraOpal

Offline-first field map for **boulder-opal prospecting** at the **Opalton opal field**,
Central-West Queensland. Sibling of [AuraGold](https://github.com/banksiasprings/auragold) —
same offline-PWA DNA (Leaflet + service worker + bundled overlays + one-push OTA), built fresh
for the opal domain: this is **excavation geology**, not metal detecting.

**Live:** https://banksiasprings.github.io/auraopal/

> ⚠️ v0.1 is a **data-visualisation** tool. It plots Steven's Aug 2025 ground-truth finds against
> the geology, geophysics and mining-tenement layers that *drive* boulder-opal favourability.
> It does **not** predict where opal is — favourability scoring is deliberately deferred until
> the raw data layers are honest and complete.

## What it shows

**Anchored on Steven's mining lease** (the default view frames the ~15 ha claim).

- **Base maps** — Satellite (Esri, default, over-zoomed to z19 for on-claim detail), Topographic
  (OpenTopoMap), ⬜ Minimal (blank, offline).
- **Ground truth (Aug 2025 field trip)** — the claim polygon (~15 ha), 10 opal finds colour-coded
  by type (🟢 gem · 🔴 red · 🟤 potch · 🟠 patch/indeterminate) with depth, 3 fault markers, and
  6 trench excavations.
- **Terrain** — 10 m contours (QLD SRTM, bundled offline — no LiDAR 1m/5m exists over remote
  Opalton) + Esri hillshade.
- **Winton Formation** — the boulder-opal host rock, from QLD state surface geology.
- **Geophysics (raw signals, labelled honestly)** — Radiometrics ternary (the moderate weathering
  signal, often more useful here than mag) + Magnetics TMI-RTP and 1VD (weak/coarse over Opalton —
  kept for structure). Clipped to a ~50 km buffer. None of these is a forecast.
- **Mining tenements** — QLD Mineral Tenement (Mining Leases / Claims / Exploration Permits;
  opal-mineral tenements highlighted). Doubles as the legality + historical-activity layer.
- **📋 Site info panel** — stratigraphy column + Steven's ground-truth patterns + honest notes on
  imagery/terrain/photo/geophysics limits.

Everything (contours, geology, tenements) works offline once loaded (service worker precaches the
shell + bundled GeoJSON; map tiles and the GA geophysics WMS are cached on view).

For which **active geophysical technique** to actually run over the claim (GPR vs ERT vs TDEM, with
AUD costs), see [`research/opal_favourability_data_sources.md`](research/opal_favourability_data_sources.md)
→ "Active exploration techniques". Short version: **GPR** is the top pick for typical
uncapped-sandstone dig areas (the basal clay sits *under* the ironstone target, so radar images
the target and only dies beneath it); **ERT** is the fallback where a capping clay is present or
suspected.

## Structure

```
www/            app source — index.html, sw.js, manifest.json
data/           bundled overlays — winton_formation.geojson, tenements_opalton.geojson
icons/          PWA icons (opal-gem)
research/        opal_favourability_data_sources.md — the full QLD data landscape + verdicts
tools/          build_site.sh + data-refetch notes
.github/workflows/deploy.yml   GitHub Pages (Actions source)
qa/             verification screenshots
CLAUDE.md       project context (read this first)
NIGHT_LOG.md    long-form build log
```

## Run locally

```bash
bash tools/build_site.sh          # assemble www + data + icons -> _site/
cd _site && python3 -m http.server 8099
# open http://localhost:8099/
```

## Deploy (OTA)

Push to `main`. `.github/workflows/deploy.yml` rebuilds `_site` and deploys to GitHub Pages.
Bump `APP_VERSION` (`www/index.html`) and `SHELL_REV` (`www/sw.js`) in lockstep on every deploy.

## Data sources & licences

All layers cite a real, verified source (CC-BY 4.0 for the government data). See the in-app
**About & data sources** panel and [`research/opal_favourability_data_sources.md`](research/opal_favourability_data_sources.md).
Ground-truth finds are Steven's own field data (Google Earth KML, Aug 2025).

## Advisories

- **Legality** shown is advisory, derived from public tenement data. Always verify tenure and
  permission with the Queensland Government before entering or digging on any ground.
- **Aboriginal cultural heritage** applies everywhere in Queensland and is **not** shown here
  (the data is legally restricted). Check the Cultural Heritage Duty of Care Guidelines separately.
