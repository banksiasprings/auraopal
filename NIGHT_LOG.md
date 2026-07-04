# AuraOpal — build log

The long-form record. Newest at top. Read the tail before changing anything.

---

## v0.1.3 (AuraGold UX port — sisters) — 2026-07-04

Steven: "make it as identical as possible to AuraGold so we know they're sisters… the toggles
aren't working properly." Read `~/Documents/auragold/index.html` (reference only) and ported its
control layer. SW cache-rev → `v0.1.3-ux` (chip stays v0.1.3).

- **Unified Layers panel (top-right)** ported from AuraGold's `#layerPanel`: a dark "Layers" button
  (layer-stack SVG) opens a white panel with grouped rows (Base map / Terrain / Geology & geophysics
  / Legality / Ground truth). **Every layer row = checkbox + colour swatch + name + live opacity
  slider + %** — the polish Steven called out. Kept AuraOpal's opal-teal accent (sisters, not clones).
- **Toggle wiring fixed** (Steven's flag). Root cause: the old ad-hoc drawer toggles didn't persist
  and had a brittle single-select base hack. Rebuilt on AuraGold's exact pattern: one pane per layer
  → each slider drives `setPaneOpacity(pane)`; every change writes `localStorage.ao_ly` ({on,op} per
  key) and is re-applied on load. Verified: toggle add/removes the layer + dims the row; opacity
  slider sets pane opacity live; state persists across reload.
- **Button placement mirrors AuraGold**: zoom top-left, Layers top-right, "AuraOpal · Opalton" pill
  top-centre + a "📍 18 finds · Aug 2025" status chip, a **Signal** variant dropdown top-left (mirrors
  AuraGold's VLF selector — switches the active geophysics raster: Radiometrics / Mag-RTP / Mag-1VD /
  Hillshade), bottom-right FAB stack (🌐 3D / ☰ Menu / 📍 Locate), bottom-left CTAs (green **Start
  survey** = session timer, red **Log a find!** = drop a GPS pin saved to `localStorage.ao_myfinds`).
- **3D button** is an honest placeholder (no terrain sidecar yet) — toasts "coming soon" (visual
  parity without faking it).
- **Menu** (right slide-in) now holds Legend + Site info + About/data-sources (layers moved out to
  the panel, exactly like AuraGold).
- Split panes so faults/trenches/mined each get independent opacity (`p-fault`/`p-trench`/`p-mined`).
- **Data + geology untouched**: 18 finds, 12 photos, mined polygon, and the basal-clay-key-predictor
  + false-clay-productive site-info corrections all survive (verified in source + render).
- **Gotcha**: forgot to bump SHELL_REV at first → the SW served the stale shell and the panel came up
  empty in testing. The built file was correct; bumping the rev + cache-busting the test URL fixed it.
  Lesson: any shell change needs a SHELL_REV bump or installed clients keep the cache.
- **Verified** (headless, SW-cleared, clean localStorage): 0 console errors; 5 groups / 15 rows / 15
  opacity sliders; toggle+opacity+persistence work; defaults correct; variant dropdown switches
  rasters; menu renders site-info (5 KB) + 12 legend items; 3D toast fires.

---

## v0.1.3 (ground-truth rebuild from KML v2) — 2026-07-04

Steven re-exported the full Google Earth KML (12 MB — the v1 I first got was a 10-pin subset).
Re-ingested it. Ships under the same **v0.1.3** chip (SW cache-rev `v0.1.3-gt` forces the update).

- **KML → data.** Copied to `~/Documents/wikis/prospecting/opal_mine_opalton_aug2025_v2.kml` +
  `data/opal_mine_v2.kml`. Parsed with ElementTree (the photos are in `<Placemark><Carousel>
  <Image><gx:imageUrl>`, NOT in `<description>` — that's why the first naive parse found nothing).
- **18 opal-find pins** (was 10) — the dense **"main patch"** mid-claim (~142.7346°E, −23.7470°S)
  was the gap. Rebuilt the inline FINDS with real coords + depths (parsed from desc) + KML altitude.
- **12 field photos** extracted from 7 pins, resized ≤1024px (2.2 MB total) → `data/photos/opalton/`,
  shown as thumbnails in pin popups + a full-screen tap-to-enlarge lightbox. Precached offline.
  The 2 "Untitled overlay" GroundOverlays were degenerate (blank 43-byte world-box GIFs) — skipped.
- **Mined-area polygon** ("area mined to 1m above 1st clay layer") — muted grey/dashed fill in the
  main patch, its own toggle. Claim polygon + fault + 8 trenches (trench/potential/path) from the KML.
- **Main-patch analysis**: ~50 m E of the western cluster, ~258 m alt = ~2 m shallower than ~256 m.
- **False-clay geology correction** (Steven): false/intermediate clay layers are productive too
  (smaller local dams), not "just structural" → ERT wins (maps all clay contrasts). Updated the
  stratigraphy diagram, "How opal forms here", and the geophysics framing.
- **Imagery**: found Esri's native ceiling over Opalton is **z17** (z18+ = 2.5 KB "no data"
  placeholder) → capped `maxNativeZoom` 18→17 so deep zoom over-zooms real imagery, not blanks.
- **Deploy hygiene**: `build_site.sh` now strips `*.kml` from `_site` (the 12 MB KML stays in the
  repo for re-ingestion but isn't served). New analysis → `opalton_aug2025_analysis_v2.md` (v1 kept).
- **Verified** (headless, SW-cleared): v0.1.3, 18 markers, 7 photo popups, lightbox opens the photo,
  mined polygon + 5 GT rows, site-info main-patch + false-clay, 0 console errors.

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

---

## v0.1.4 — bottom-sheet UX refactor (sister-synced with AuraGold v44.0)

Steven's critique: the layers panel covered the whole screen (open/close/open just to see the map
react), the top-left Signal dropdown was an orphan, and the menu wanted collapsible sections to
"squeeze lots of data in." Shipped a unified refactor shared skeleton-for-skeleton with AuraGold.

- **Layers → draggable bottom-sheet.** Top-right button is now Layers-ONLY; it opens a bottom-sheet
  with **peek (~15%) / half (~50%) / full (~90%)** states, a drag handle, a scrolling body, and the
  **map stays visible & interactive above** at every state. Tap Layers = open(half)/close; drag the
  handle (or ↑/↓ keys) to peek/half/full. `body.sheet-open` tucks the bottom CTAs + FAB stack so the
  map above reads clean.
  - **Robustness:** resting states use a `vh` height; the drag is a **unit-independent ratio**
    (`Δy / sheetHeight → %`) and the snap transform is applied inline as a **% of the element's own
    height**, so it never depends on `window.innerHeight` (which the Chromium mobile emulator reports
    in device px while CSS uses CSS px — a 2× trap). `position:absolute` (not fixed) — the emulator's
    fixed-positioning viewport is internally inconsistent; absolute matches the other panels.
- **Signal selector moved INTO the sheet.** The top-left `varSel` dropdown is gone; a segmented
  **"Signal overlay — one at a time"** control (None / Radiometrics / Mag RTP / Mag 1VD / Hillshade)
  now lives in the sheet's *Geology & geophysics* group and drives the same single-select
  (`GEO_VARS`); the per-layer opacity rows stay for fine control. `syncVarSelect()` keeps the
  segmented buttons in sync with the rows.
- **Menu → collapsible accordions** (native `<details>`, all default-collapsed): **📍 Site info ·
  🎨 Legend · 🔬 Technologies · 📚 Research · ℹ️ About**. Technologies = 5 tight one-paragraph cards
  (ERT / GPR / Magnetics / Radiometrics / Hillshade-DEM). Research = 3 pointers with one-line
  takeaways + "Read more ↗" to the GitHub blob (`research/*.md`). About now carries the version +
  repo/sibling links.
- **Placement locked to the shared 5-cluster rule:** top-left = zoom only · top-right = Layers only ·
  top-centre = title pill + status chip · bottom-right = 🌐 3D / ☰ Menu / 📍 Locate · bottom-left =
  green Start-survey / red Log-a-find (+ passive version-badge label). No orphan controls remain.

### Verified (Chromium mobile emulation, localhost:8081, 375×812)
- 0 console errors. Default state clean (no orphan dropdown, all 5 clusters correct, badge `v0.1.4`).
- Bottom-sheet peek/half/full all render with the map visible above; Signal→Radiometrics single-
  selects the layer + syncs its row; Menu opens all 5 accordions; Technology cards render (5),
  Research links resolve (3, GitHub blob), Legend (12 items) + Site info (populated).

### Deferred / notes
- 3D terrain sidecar still an honest placeholder in AuraOpal (parity toast). On-device verify on
  Steven's Motorola still ADB-Wi-Fi-bound (emulator-only, same as prior versions).
