# AuraOpal — build log

The long-form record. Newest at top. Read the tail before changing anything.

---

## v0.1.3 — opal-formation model in Site info (2026-07-04)

Steven's field insight — the crux of any future favourability model. The basal clay isn't just a
base layer, it's **the key predictor of THICK opal**: where the clay basement dips into low points
it dams silica-rich water into pools; that water + organic matter in the mudstone converts mudstone
→ **ironstone** (silica-binding chemistry); the ironstone **immediately above the basement** carries
the thickest, best opal. Thickness tracks **proximity to the clay-basement pools** — colour is a
separate axis. The model target is therefore **clay-basement TOPOGRAPHY (low points), not raw
depth-to-clay.**

Site-info panel additions (no other code):
- **★ KEY** annotation on the basal-clay stratigraphy row (gold-highlighted): "clay-basement LOW
  POINTS pool silica-rich water — the ironstone right above them carries the thickest, best opal."
- New **"How opal forms here"** paragraph capturing the mudstone→ironstone process, cited to the
  operator's field notes (Aug 2025 trip).
- A flagged **future-model target** callout: clay-basement topography (the low points), not
  depth-to-clay.
- Same insight folded into CLAUDE.md domain notes (defines the future model).

Version bump v0.1.2 → **v0.1.3** — required so the service worker's SHELL_REV changes and existing
installs actually re-fetch the shell (a shell content change with an unchanged SW would not
propagate to Steven's phone). Site-info is content-only; no layer/JS wiring changed.

---

## v0.1.2 — GPR-verdict correction (2026-07-04)

Steven corrected the stratigraphy I'd mis-stated in v0.1.1: at Opalton the clay is **basal** —
at the very bottom, UNDER the opal-bearing ironstone target — not a cap over the sandstone. Most
dig areas are pure sandstone near-surface → ironstone (target) → basal clay. Only a minority carry
a capping clay above the sandstone.

That flips the GPR verdict: GPR fires through the radar-friendly sandstone, **images the ironstone
target**, and only then dies at the basal clay *beneath* the target — which is fine, the target is
already imaged. GPR only fails in the minority capped-clay case. So **GPR is the top pick for
Steven's typical (uncapped) dig conditions** — higher resolution at shallow depth, cheaper per
site, walk-behind/ute-dragged, direct 2-D/3-D image. **ERT drops to best-in-class fallback for
capped or unknown-cap ground.**

Correction pass (no new research):
- `research/opal_favourability_data_sources.md` — rewrote the Section-A premise, the GPR section
  (header + clay paragraph), the fit table (GPR verdict + ERT verdict), the bottom line, the ERT
  header, and the honest-verdict blockquote.
- `www/index.html` site-info — new geophysics one-liner ("GPR top pick for uncapped … ERT for
  capped … mag weak, radiometrics moderate"); stratigraphy diagram clay row relabelled **basal**
  (bottom, under the target) + a CAP_NOTE flagging capping-clay as an uncommon variant.
- CLAUDE.md / README / this log corrected. v0.1.1 → **v0.1.2**.

---

## v0.1.1 — lease-first + terrain + honest geophysics (2026-07-04)

Steven's mid-build asks: focus 80% on his mining lease; add best-available terrain; be honest
about magnetics; research active geophysical techniques for shallow (5–8 m) boulder opal.

### App
- **Default view zooms to the claim** (`CLAIM_ZOOM` 15→16); brighter/thicker claim boundary; the
  lease is now the anchor.
- **10 m contours** — QLD `Elevation/Contours` L10 (SRTM-derived), fetched then **clipped to the
  lease** with a Liang-Barsky polyline clip (11 lines, 17 KB, 250–280 m) and **bundled offline**.
  Confirmed the honest constraint: **LiDAR 5 m (L20) and 1 m (L30) return 0 features over the
  claim** — no LiDAR flown over remote Opalton, so 10 m is the resolution ceiling.
- **Hillshade** — Esri World Hillshade toggle.
- **Two honest geophysics-enhancement overlays** (validated by the research): **Radiometrics
  ternary** (`radmap_v4_2019_filtered_ternary_image` — the moderate weathering signal, labelled
  "often > mag here") and **Magnetics 1VD** (`magmap_v7_2019_1VD` — shallow/structural filter).
  TMI-RTP relabelled "weak/coarse here — structure only".
- **Satellite over-zoom** to z19 (native z18) for on-claim inspection; Nearmap flagged as
  paid/no-free-cover.
- **📋 Site info panel** — stratigraphy column (sandstone → ironstone ×3–4 🪨 → sandstone → clay
  dam 🪨, opal horizons flagged) + 4 ground-truth patterns + honest imagery/terrain/photo/
  geophysics notes.
- **Field photos:** the Aug 2025 KML's photos did NOT survive the Cowork upload purge (only the
  analysis MD remains; the sole KMLs on disk are AuraGold's Victoria files, untouched). Flagged in
  Site info with the re-export path. Nothing fabricated.

### Research (appended to `research/opal_favourability_data_sources.md`, 203→360 lines, all preserved)
- **Active exploration techniques** — GPR, ERT (clay/ironstone resistivity contrast, 5–8 m,
  ~AUD 2–4k/day), TDEM, passive seismic, reflection seismic, + a fit/cost table. Rio Tinto
  "ute-dragged" tool = most likely a towed ground-TEM/EM array (moderate confidence; no specific
  Rio density mapper confirmed). *(GPR-vs-ERT ranking corrected in v0.1.2 — see above.)*
- **Honest geophysics assessment** — mag weak / radiometrics moderate / GPR-ERT the real prize;
  which enhancement filters (RTP/1VD/tilt) the GA WMS already publishes.
- **East-vs-west Eromanga margin** (v0.2+ note) — east favoured for geological reasons; west
  deeper/less-weathered hypothesis, flagged uncertain.

### Verified (headless, localhost, after clearing the v0.1 SW cache)
Version `v0.1.1`; 7 overlays; 11 contour lines + 3 index labels render; site-info shows 4 strata +
4 patterns; Hillshade tiles 200; GA radiometrics + 1VD WMS load; 0 console errors.

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
