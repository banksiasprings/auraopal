# AuraOpal — build log

The long-form record. Newest at top. Read the tail before changing anything.

---

## v0.1 — first build (2026-07-04)

Scaffolded AuraOpal as a **sibling of AuraGold** (not a fork): same offline-PWA pattern
(Leaflet + service worker + bundled-GeoJSON overlays + basemap toggle + one-push OTA), built
fresh for the boulder-opal domain at **Opalton, CW Queensland**. Excavation geology, not metal
detection. Trip target winter 2027.

### What shipped
- **`www/`** single-file-ish app (`index.html` + `sw.js` + `manifest.json`), opal-teal/ironstone theme.
- **3 basemaps** — Satellite (Esri, default), Topographic (OpenTopoMap), ⬜ Minimal (client-side
  near-white fill, offline-instant). Single-select, mirrors AuraGold v42.4.
- **Ground truth** (verbatim from `~/Documents/wikis/prospecting/opalton_aug2025_analysis.md`):
  claim polygon (6-vertex, ~15 ha), **10 opal finds** (9 numbered + 1 unnumbered surface-gem
  record from the KML) colour-coded gem/red/potch/patch with depth + Steven's note, 3 fault
  markers (2 points + 1 NE line), 6 trench line-strings. All rendered as always-available vector
  layers (no fetch).
- **Winton Formation** overlay — bundled `data/winton_formation.geojson` (8 features, 133 KB),
  fetched from QLD `GeologyState` L6 filtered `ru_name='Winton Formation'`. The claim sits
  directly on it (`map_symbol=Kw`, Cretaceous) — confirmed by point query.
- **Magnetics (TMI-RTP)** — GA `geophys:magmap_v7_2019_RTP` WMS overlay, clipped to a ~50 km
  buffer (`MAG_BOUNDS`) so it reads as a local anomaly map, not a continent wash. Labelled a raw
  signal, default OFF.
- **Mining tenements** — bundled `data/tenements_opalton.geojson` (67 features, 25 KB) from QLD
  `Economy/MineralTenement` FeatureServer. 24 Mining Leases + 43 Exploration Permits; 45 are
  opal (`tenmineral='OP'`). Styled ML(red)/EPM(dashed blue), opal fill amber. Popups carry a
  legality advisory (ML = holder's permission needed; EPM = no fossick right).
- **Deploy** — `tools/build_site.sh` flattens `www`+`data`+`icons` → `_site`;
  `.github/workflows/deploy.yml` uploads it as the Pages artifact (Actions source, clean URL).
- Opal-gem PWA icons generated with PIL (`tools/` one-off).

### Data landscape research
`research/opal_favourability_data_sources.md` — full per-source verdict table (coverage over
Opalton, licence, v0.1-ready?). v0.1-ready and shipped: GSQ geology, GA magnetics, QLD tenements.
Verified-but-deferred: GA radiometrics (`radmap_v4_2019_*`), SRTM terrain, Geofabric streams (now
a BoM ArcGIS FeatureServer — the WFS was decommissioned Nov 2023), GSQ faults. Genuine gap: GA
palaeovalley data doesn't cover QLD.

### Verified (headless Chromium, localhost:8099)
- 0 console errors; satellite tiles load; version chip reads `AuraOpal v0.1`.
- 10 find markers, 8 Winton polygons, claim + 6 trenches + faults render (21 vector paths base,
  85 with tenements on).
- GA magnetics WMS `GetMap` → HTTP 200, 66 KB PNG tiles; attribution shows GA CC-BY 4.0.
- Tenement fetch → 67 features; overlay renders.

### Deferred to v0.2+
Favourability scoring (data-first discipline — not until layers are complete/honest) · radiometrics
· terrain slope+drainage for clay-dam pockets · Geofabric drainage · faults/lineaments · offline
trip-area tiles (AuraGold TTL model) · 1:100k detailed geology · on-device verify on Steven's
Motorola (ADB Wi-Fi-bound, same limitation as AuraGold — emulator/headless only for v0.1).
