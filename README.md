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

## What v0.1 shows

- **Base maps** — Satellite (Esri, default), Topographic (OpenTopoMap), ⬜ Minimal (blank, offline).
- **Ground truth (Aug 2025 field trip)** — the claim polygon (~15 ha), 10 opal finds colour-coded
  by type (🟢 gem · 🔴 red · 🟤 potch · 🟠 patch/indeterminate) with depth, 3 fault markers, and
  6 trench excavations.
- **Winton Formation** — the boulder-opal host rock, from QLD state surface geology.
- **Magnetics (TMI-RTP)** — Geoscience Australia's national magnetic grid, clipped to a ~50 km
  buffer. A *raw geophysical signal* (an ironstone proxy), shown labelled — not a forecast.
- **Mining tenements** — QLD Mineral Tenement (Mining Leases / Claims / Exploration Permits;
  opal-mineral tenements highlighted). Doubles as the legality + historical-activity layer.

Everything works offline once loaded (service worker precaches the shell + bundled GeoJSON;
map tiles and the GA magnetics WMS are cached on view).

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
