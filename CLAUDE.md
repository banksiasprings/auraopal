# AuraOpal — project context

Offline-first PWA for **boulder-opal prospecting** at the **Opalton field**, Central-West
Queensland (Steven's phone: Motorola Edge 50 Neo). Sibling of **AuraGold**
(`~/Documents/auragold` · github.com/banksiasprings/auragold) — same Leaflet + basemap-toggle
+ offline-service-worker + overlay-bundling + OTA pattern, but built fresh for the opal domain:
**excavation geology, not metal detection.** Trip target: **winter 2027** (≈1-year runway from
the Aug 2025 recon).

Live: https://banksiasprings.github.io/auraopal/ · app source in `www/` (`index.html` + `sw.js`
+ `manifest.json`); canonical `data/` + `icons/` are top-level siblings. Detailed build log:
`NIGHT_LOG.md` (read the tail before changing anything).

## Deploy / OTA
GitHub Pages branch-source can only serve `/` or `/docs`, so `tools/build_site.sh` flattens
`www/` + `data/` + `icons/` into `_site/` and `.github/workflows/deploy.yml` uploads that as the
Pages artifact (source = **GitHub Actions**, not branch). OTA = commit + push to `main` → the
workflow rebuilds `_site` and deploys. **Every deploy: bump `APP_VERSION` (www/index.html) AND
`SHELL_REV` (www/sw.js) in lockstep** (the on-screen version chip + the SW shell-cache key).
Local preview: `bash tools/build_site.sh && (cd _site && python3 -m http.server 8099)`.

## Version table

| Version | What | Where |
|---|---|---|
| **v0.1.2** | 🩹 GPR-verdict correction (stratigraphy fix from Steven). The clay is **basal** (UNDER the ironstone target), not a cap — so GPR images the target through the sandstone and only dies beneath it. **GPR is now the top pick for typical uncapped-sandstone dig areas; ERT for capped/unknown-cap sites.** Updated the research doc's GPR section + fit table, the site-info geophysics one-liner + stratigraphy diagram (clay labelled basal; capping-clay flagged as an uncommon variant). | `research/` §Active techniques · `www/index.html` site-info |
| **v0.1.1** | 🎯 **Lease-first.** Default view zooms to Steven's claim (z16). Added: **10 m contours** (QLD SRTM, bundled offline, clipped to the lease — NO LiDAR 1m/5m exists over remote Opalton), **Hillshade** (Esri), and two honest geophysics-enhancement overlays — **Radiometrics ternary** (`radmap_v4_2019_filtered_ternary_image`, the "moderate weathering signal, often > mag here") and **Magnetics 1VD** (`magmap_v7_2019_1VD`, shallow/structural filter). Brighter claim boundary. New **📋 Site info** panel: stratigraphy column + ground-truth patterns + honest imagery/terrain/photo/geophysics notes. Satellite over-zoom to z19. Field photos: the Aug 2025 KML's photos didn't survive the upload purge (re-export needed). | `www/index.html` · `research/` (Active exploration techniques) |
| **v0.1** | 🪨 First build. 3 basemaps (Satellite default / Topographic / ⬜ Minimal). Steven's Aug 2025 ground truth: claim polygon (~15 ha), 10 opal finds colour-coded by type (gem=green, red=red, potch=brown, patch=amber), 3 fault markers, 6 trench excavations. Winton Formation footprint (QLD geology). GA magnetics (TMI-RTP) heatmap clipped to a ~50 km buffer. QLD mining-tenement overlay (ML/MC/EPM, opal-mineral highlighted) as the legality+activity layer. Data-viz only — **no favourability scoring yet.** | `www/` · `research/opal_favourability_data_sources.md` |

## Do-not-break invariants
- **v0.1 shows RAW signals, honestly labelled.** The magnetics overlay is a noisy geophysical
  input, NOT a favourability forecast. Do not imply prediction until a scored model exists
  (deferred — see `research/` "Deferred"). Data-first → correlations → specialists.
- **Every layer cites a real, verified source** (see the `#srcList` block in `www/index.html`
  and `research/opal_favourability_data_sources.md`). Do NOT invent geology datasets.
- **Ground truth is verbatim** from `~/Documents/wikis/prospecting/opalton_aug2025_analysis.md`
  (Steven's Google Earth KML). NEVER write to anything under `~/Documents/wikis/` — it is
  Steven's source data. App exports (when added) go to `exports/`.
- **Cultural heritage is advisory-only.** QLD Aboriginal & Torres Strait Islander cultural
  heritage (ACHRIS/DATSIP) is legally restricted — the app carries a Duty-of-Care text advisory
  and NEVER ingests or maps heritage site data.
- **Legality is advisory.** The tenement overlay is derived from public QLD data; the app always
  tells the user to verify tenure/permission with the Queensland Government before entering ground.
- AuraGold is a separate repo — never modify it from here (shared design DNA, independent code).

## Data sources (all verified over Opalton, v0.1) — see `research/` for the full landscape
| Layer | Source | Endpoint | Licence |
|---|---|---|---|
| Satellite | Esri World Imagery | `server.arcgisonline.com/.../World_Imagery` | Esri terms |
| Topographic | OpenTopoMap | `tile.opentopomap.org` | CC-BY-SA |
| Winton Formation | GSQ State Surface Geology (`ru_name='Winton Formation'`, symbol `Kw`) | QLD Spatial `GeoscientificInformation/GeologyState` L6 → bundled `data/winton_formation.geojson` | CC-BY 4.0 |
| Contours (10 m) | QLD Contours, 10 m (from GA 1-second ~30 m bare-earth SRTM DEM) | QLD Spatial `Elevation/Contours` L10 → bundled `data/contours_10m_opalton.geojson` (clipped to lease). L20/L30 (LiDAR 5m/1m) = 0 features over Opalton | CC-BY 4.0 |
| Hillshade | Esri World Hillshade (global relief) | `server.arcgisonline.com/.../Elevation/World_Hillshade` | Esri terms |
| Magnetics (TMI-RTP / 1VD) | Geoscience Australia national geophysical grids v7 2019 | `services.ga.gov.au/gis/geophysical-grids/wms` layers `geophys:magmap_v7_2019_RTP` + `_1VD` (WMS, runtime-cached) | CC-BY 4.0 |
| Radiometrics (ternary) | GA national radiometric grids v4 2019 (K-Th-U) | same WMS, `geophys:radmap_v4_2019_filtered_ternary_image` | CC-BY 4.0 |
| Mining tenements | QLD Mineral Tenement (ML/MC/EPM; opal = `tenmineral='OP'`) | QLD Spatial `Economy/MineralTenement` FeatureServer → bundled `data/tenements_opalton.geojson` | CC-BY 4.0 |
| Ground truth | Steven's Opalton field trip, Aug 2025 | Google Earth KML → `~/Documents/wikis/prospecting/opalton_aug2025_analysis.md` | Steven's |

**Refetch bundled data:** re-run the ArcGIS FeatureServer `/query?f=geojson` calls in
`tools/README.md` (Winton Fm + tenements) with the Opalton bbox; they are small (≈133 KB + 25 KB).

## Domain notes (boulder-opal favourability — for later scoring)
Opal forms in the **weathered profile of the Winton Formation**: sandstone overburden → 3–4
ironstone layers (bottom usually best) → sandstone → basal **clay layer** that dams silica-rich
water. Steven's ground truth: best gem/red opal clusters in a ~40×40 m box **west of the fault**
at ~4 m depth; **fault-adjacent finds run potchy** (fractures carry water but make patch, not
colour). Depth stratification is real (0.3 m surface → 4 m in situ → 8 m isolated boulders).
Favourability drivers to model later: Winton Fm extent (necessary), ironstone (→ magnetics),
weathering/clay (→ radiometrics K/Th/U), clay-dam topographic pockets (→ DEM slope/drainage +
Geofabric), structure (→ faults/lineaments), historical activity (→ tenement/claim density).

## Geophysics honesty (v0.1.1 — see `research/` "Active exploration techniques")
Over Opalton: **airborne mag = weak** (coarse survey + low-Fe Winton ironstone, chemically unlike
the Mt Isa ore country the surveys were flown for — keep it for structure/lineaments only, hence
the 1VD enhancement layer); **radiometrics = moderate** (real weathering/silicification proxy —
the better free layer); **the real prize = high-res GPR or ERT over the claim itself.** Research
verdict (corrected v0.1.2): **GPR is the top pick for Steven's typical dig conditions** — the clay
is **basal** (UNDER the ironstone target), so GPR fires through the near-surface sandstone, images
the ironstone target, and only dies at the clay *beneath* it; it fails only in the minority case
where clay **caps** the sandstone above the target. **ERT is the best-in-class fallback for capped
or unknown-cap ground** (clay-conductive vs ironstone-resistive, ~AUD 2–4k/day indicative).
Rio Tinto's "ute-dragged" tool is most likely a towed ground-TEM/EM conductivity array (moderate
confidence — could not confirm a specific Rio density mapper). East-vs-west Eromanga margin: east
favoured for geological reasons (shallow weathered Winton Fm), west likely deeper/less-weathered —
a moderate-confidence hypothesis to test, not a settled opportunity.

## Deferred (see `research/` for verdicts)
Favourability scoring · radiometrics (K/Th/U — GA `radmap_v4_2019_*`, verified, not yet wired) ·
SRTM/terrain slope+drainage for clay-dam pockets · Geofabric streams (BoM ArcGIS FeatureServer —
old WFS decommissioned Nov 2023) · GSQ faults/lineaments · offline trip-area tiles (AuraGold TTL
pattern) · GeologyDetailed 1:100k for finer geology · 3D terrain sidecar. GA palaeovalley data
does **not** cover QLD (genuine gap).
