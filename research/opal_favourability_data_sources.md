# Opal Favourability Data Sources — Opalton Boulder-Opal Field

**Study area:** Opalton opal field, Central-West Queensland (142.5–143.0°E, 23.5–24.0°S; active claim ~142.735°E, −23.748°S). Host rock: **Winton Formation** (Late Cretaceous sandstone/siltstone/mudstone/ironstone). Mining method is **excavation** (bulldozer/excavator), not detection.

**Summary.** The good news: the two most important layers — surface geology showing the Winton Formation host, and the mining-tenement/legal overlay — are both live, cover Opalton, and are Queensland Government open data. Geoscience Australia's national geophysics WMS (magnetics + radiometrics) is verified working over Opalton with a sibling app already using it. AWS terrarium tiles give online terrain. The gaps are honest ones: there is **no LiDAR-grade DEM** over remote Opalton (SRTM ~30 m is the ceiling), the BoM Geofabric's old WFS was **decommissioned** (use the ArcGIS FeatureServer instead), GA's palaeovalley mapping **does not cover Queensland**, and cultural heritage data is **legally restricted — advisory text only, never ingest**.

Every endpoint below was hit during this research. Where a request returned a valid image or feature, it is marked **verified**. Where I could only confirm existence but not a specific layer name, it says so.

---

## Verdict table

| # | Source | Covers Opalton? | Licence | v0.1-ready? | Notes |
|---|--------|-----------------|---------|-------------|-------|
| 1 | **Winton Fm geology** — GSQ GeologyDetailed (1:100k) | ✅ **Yes (verified)** — returns "Winton Formation, Kw" at the claim | CC-BY 4.0 (© State of QLD, Dept of Resources) | ✅ **Yes** | ArcGIS REST; query→GeoJSON. Best single layer. |
| 1b | GA Surface Geology 1:1M/2.5M | ✅ Yes | CC-BY 4.0 (© Commonwealth/GA) | ⚠️ Fallback only | Too coarse to resolve one formation; national backstop. |
| 2 | **Aeromagnetics** — GA `magmap_v7_2019_RTP` WMS | ✅ **Yes (GetMap verified)** | CC-BY 4.0 (© Commonwealth/GA) | ✅ **Yes** | Direct WMS image overlay. Sibling app already uses it. No WCS on this endpoint. |
| 3 | **Radiometrics** — GA `radmap_v4_2019_*` WMS | ✅ **Yes (K GetMap verified)** | CC-BY 4.0 (© Commonwealth/GA) | ✅ **Yes** | Same WMS. K/Th/U/ternary layer names confirmed verbatim. |
| 4 | **DEM/terrain** — AWS terrarium tiles | ✅ **Yes (tile verified)** | CC-BY / ODbL (mixed, SRTM-derived here) | ✅ **Yes (online)** | Online-only; slope/drainage. SRTM ~30 m. |
| 4b | GA SRTM 1-Second (DEM-H) via ELVIS | ✅ Yes | CC-BY 4.0 | ⚠️ Needs processing | Download+reproject for offline. National 5 m LiDAR does **not** cover Opalton. |
| 5 | **Hydrography** — BoM Geofabric v3 (ArcGIS FeatureServer) | ✅ **Yes (extent verified)** | CC-BY 4.0 (© Commonwealth/BoM) | ⚠️ Needs processing | Old WFS **decommissioned Nov 2023**; use the FeatureServer. |
| 5b | GA palaeovalley/palaeochannel | ❌ **No** | CC-BY 4.0 | ❌ No | GA mapping is WA/SA/NT only. Genuine gap for QLD. |
| 6 | **Tenements / legal** — QLD MinesPermitsCurrent | ✅ **Yes (extent verified)** | CC-BY 4.0 (© State of QLD) | ✅ **Yes** | Granular ML/MC/EPM granted layers. THE legal overlay. |
| 6b | QLD Designated Fossicking Land (Opalton) | ✅ Yes (Opalton IS a DFL) | CC-BY 4.0 (assumed — verify) | ⚠️ Find exact layer | Layer exists in QLD Globe/QSpatial; exact WMS name unconfirmed. |
| 7 | **Faults** — GSQ GeologyDetailed/State faults | ✅ Yes | CC-BY 4.0 (© State of QLD) | ✅ **Yes** | Vector faults + folds + lineaments. |
| 8 | **Cultural heritage** — ACHRIS/DATSIP | (restricted) | Restricted — NOT open | ❌ **Never ingest** | Advisory text only. Duty of care. |

---

## 1. Winton Formation extent (surface geology)

**1a. GSQ Detailed Surface Geology (1:100k) — PRIMARY**

1. **What/agency:** Detailed 1:100,000-scale digital surface geology, Geological Survey of Queensland (GSQ), Department of Resources.
2. **Endpoint (ArcGIS REST MapServer):**
   `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/GeoscientificInformation/GeologyDetailed/MapServer`
   - **Layer 15 = "Detailed surface geology"** (polygons, the unit layer).
   - Layer 14 = coverage-extent polygon; Layers 3–13 = structure (see §7).
   - OGC WMS also available on the same server (`.../MapServer/WMSServer`).
3. **Coverage over Opalton:** ✅ **Verified.** A point query at 142.735°E, −23.748°S returned one feature: **Rock Unit = "Winton Formation", Map Symbol = "Kw", Age = Late Cretaceous, "Labile sandstone, siltstone, mudstone, minor coal".** This is exactly the host rock and confirms real 1:100k mapping over Opalton (not just a wide service extent).
4. **Licence/attribution:** CC-BY 4.0. Service `copyrightText`: *"© State of Queensland (Department of Natural Resources and Mines, Manufacturing and Regional and Rural Development)"*. Attribute: **"© State of Queensland (Department of Resources), CC-BY 4.0"**.
5. **Resolution:** 1:100,000 line-work — the highest-detail statewide vector geology. Unit boundaries, symbol, age, lithology per polygon.
6. **Usable vs processing:** Needs light processing. Best path: ArcGIS REST `query` (bbox over Opalton, `outFields=*`, `f=geojson`) → clip to study area → bundle GeoJSON. ~small over one field. Alternatively consume the WMS as an image overlay (loses attributes).
7. **HONEST VERDICT:** **v0.1-ready and the single best geology layer.** Verified to return the Winton Formation at the claim. Ship the Kw polygon(s) as the favourability base layer.

**1b. Geoscience Australia — Surface Geology of Australia (1:1M / 1:2.5M)**

1. **What/agency:** National seamless bedrock/surficial geology, Geoscience Australia.
2. **Endpoint (ArcGIS REST + WMS):**
   `https://services.ga.gov.au/gis/rest/services/GA_Surface_Geology/MapServer`
   - Layer 10 = `AUS_GA_1M_GUPoly_Lithostratigraphy` (1:1M polygons).
   - Layers 3–5 = `AUS_GA_2500k_GUPoly_*` (1:2.5M).
   - WMS: `https://services.ga.gov.au/gis/services/GA_Surface_Geology/MapServer/WMSServer`
3. **Coverage:** ✅ Yes (national, includes Opalton).
4. **Licence:** CC-BY 4.0. `"© Commonwealth of Australia (Geoscience Australia) 2016. …Creative Commons Attribution 4.0 International Licence."`
5. **Resolution:** 1:1M / 1:2.5M — far too coarse to delineate one formation's internal favourability.
6. **Usable:** Directly as WMS overlay.
7. **HONEST VERDICT:** Aspirational for Opalton-scale work; keep only as a **national fallback** if the GSQ service is ever down. The GSQ 1:100k (§1a) supersedes it here.

---

## 2. Aeromagnetics (ironstone / structural proxy)

1. **What/agency:** National airborne magnetic grids (Total Magnetic Intensity and derivatives), Geoscience Australia. Ironstone-rich Winton horizons and structural controls express in magnetics; RTP (reduced-to-pole) recentres anomalies over their source.
2. **Endpoint (WMS):** `https://services.ga.gov.au/gis/geophysical-grids/wms`
   - **Confirmed layer: `geophys:magmap_v7_2019_RTP`** (TMI-RTP, 2019 v7). Also present and verified in capabilities: `geophys:magmap_v7_2019_TMI`, `..._TMI_40m`, `..._1VD`, and a full VRTP derivative suite (`..._VRTP_AS` analytic signal, `..._VRTP_1VD`, upward-continuation series, etc.).
3. **Coverage over Opalton:** ✅ **Verified** — a WMS `GetMap` for `geophys:magmap_v7_2019_RTP` over bbox `-23.9,142.6,-23.6,142.9` (EPSG:4326) returned a valid PNG. National grid.
4. **Licence:** CC-BY 4.0. Service abstract: *"© Commonwealth of Australia (Geoscience Australia) 2022. …Creative Commons Attribution 4.0 International Licence."*
5. **Resolution:** National magnetic compilation gridded at ~40–80 m cell (the v7 2019 grid); adequate for regional ironstone/structure trends, not sub-metre.
6. **Usable vs processing:** **Directly usable** as a Leaflet WMS tile/image overlay (this is exactly how the sibling AuraGold app consumes it). For later raster analysis (thresholding ironstone anomalies), you'd want the grid itself — **note: this endpoint is WMS-only, no WCS advertised.** Grid download is via GA's eCat / GADDS (search "Magnetic Anomaly Map of Australia v7 2019"), a GeoTIFF/ERS download → reproject, not a live WCS.
7. **HONEST VERDICT:** **v0.1-ready as a visual overlay.** Confirmed working over Opalton. Raster-level processing is deferred (needs a manual GeoTIFF download, not a WCS).

---

## 3. Radiometrics (weathering / clay proxy — %K, Th, U, ternary)

1. **What/agency:** National airborne gamma-ray spectrometry grids, Geoscience Australia. Potassium depletion + thorium/uranium patterns track weathering intensity and clay — relevant to the deeply weathered Winton profile that hosts boulder opal.
2. **Endpoint (WMS):** same service — `https://services.ga.gov.au/gis/geophysical-grids/wms`. **Layer names confirmed verbatim from GetCapabilities:**
   - Potassium %K: `geophys:radmap_v4_2019_filtered_pctk`
   - Thorium ppm: `geophys:radmap_v4_2019_filtered_ppmth`
   - Uranium ppm: `geophys:radmap_v4_2019_filtered_ppmu`
   - Ternary (K-Th-U RGB image): `geophys:radmap_v4_2019_filtered_ternary_image`
   - Dose rate: `geophys:radmap_v4_2019_filtered_dose`; ratios `..._ratio_tk`, `..._ratio_uk`, `..._ratio_ut`, `..._ratio_u2t`. (Older v3 2015 series also present.)
3. **Coverage over Opalton:** ✅ **Verified** — a `GetMap` for `geophys:radmap_v4_2019_filtered_pctk` over the Opalton bbox returned a valid PNG. National.
4. **Licence:** CC-BY 4.0 (same GA statement as §2).
5. **Resolution:** National radiometric compilation (~100 m cell class); regional weathering patterns, not paddock-scale.
6. **Usable vs processing:** **Directly usable** as WMS overlays (ternary image is the most immediately readable). Ratio/threshold analysis later needs the grids (eCat download, same WMS-only caveat as §2).
7. **HONEST VERDICT:** **v0.1-ready as overlays.** Layer names verified; K layer confirmed rendering over Opalton. Ternary is the best single "weathering" glance-layer.

---

## 4. DEM + terrain (drainage, slope, clay-dam pockets)

1. **What/agency:** Elevation for slope/drainage/topographic-pocket derivation. Three realistic options.
2. **Endpoints:**
   - **AWS Terrain Tiles (terrarium)** — `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`. Public S3, no auth. **Tile over QLD (z10/906/615) verified returns a valid PNG.** Registry of Open Data on AWS lists it as current (no deprecation). This is what the sibling app uses.
   - **GA SRTM 1-Second** (DEM, DEM-S smoothed, **DEM-H hydrologically-enforced** — DEM-H is best for drainage) via the **ELVIS portal**: `https://elevation.fsdf.org.au/` (clip-and-ship download UI; GA product page: `https://www.ga.gov.au/scientific-topics/national-location-information/digital-elevation-data`). GA also exposes SRTM through ArcGIS image services, but I could **not** confirm a specific public WCS URL that resolves — treat SRTM as a **download**, not a live service.
   - **National 5 m LiDAR DEM:** exists but is **only ~245,000 km² of discrete surveys (2001–2015), not continuous.** ❌ **Does not cover remote Opalton** (unverified as present; GA states it's survey-limited and remote CW QLD was not part of those surveys).
3. **Coverage over Opalton:** AWS terrarium ✅ (verified tile); SRTM 1-sec ✅ (national); 5 m LiDAR ❌.
4. **Licence:** AWS terrain tiles are a **mix** (SRTM-derived over Australia → effectively CC-BY/public-domain SRTM; global mosaic also carries ODbL components — attribute *"Terrain tiles courtesy of AWS/Mapzen; SRTM courtesy of NASA/USGS"*). GA SRTM = CC-BY 4.0 (© Commonwealth/GA).
5. **Resolution:** AWS terrarium & SRTM = **1 arc-second, ~30 m**. Enough for regional slope, drainage lines and broad clay-dam catchment pockets; **not** enough to resolve individual excavation-scale hollows.
6. **Usable vs processing:** AWS terrarium = **directly usable online** (decode RGB→elevation client-side, or hillshade). For **offline** (this is an offline-first PWA) you must pre-download SRTM/terrarium tiles for the Opalton bbox → bundle. Slope/flow-accumulation derivation = raster processing (e.g. gdaldem/whitebox) → bundle as tiles or contour GeoJSON.
7. **HONEST VERDICT:** **AWS terrarium is v0.1-ready for online terrain.** SRTM download for offline slope/drainage is a **later processing task**. The 5 m LiDAR "clay-dam pocket at excavation scale" dream is **not available** at Opalton — set expectations at ~30 m.

---

## 5. Hydrography (drainage network; palaeochannels)

**5a. BoM Geofabric (Surface Hydrology)**

1. **What/agency:** Australian Hydrological Geospatial Fabric (Geofabric) — national stream network, catchments, waterbodies — Bureau of Meteorology.
2. **Endpoint:** ⚠️ The classic OGC **WFS/WMS (v2.1.1) at `geofabric.bom.gov.au` was DECOMMISSIONED 30 Nov 2023.** The live, working route is the **ArcGIS FeatureServer** (BoM-published, Digital Atlas):
   `https://services-ap1.arcgis.com/ypkPEy1AmwPKGNNv/arcgis/rest/services/Geofabric_Surface_Hydrology_Network/FeatureServer`
   Layers include: 4 = *AHGF Network Stream — Major, Named*; 5 = *Network Stream — All*; 1 = *Catchment*; 6/7 = *Waterbody*; 8 = *Water Storages*.
3. **Coverage over Opalton:** ✅ **Verified** — service extent spans continental Australia (−44°S to −9°S, to 154°E); 142.7°E/−23.75°S is inside it.
4. **Licence:** CC-BY 4.0. `copyrightText`: *"© Commonwealth of Australia (Bureau of Meteorology) 2022"*.
5. **Resolution:** Derived from the 9-second/1-second DEM drainage; stream lines are regional, adequate for "which gully drains the Winton scarp".
6. **Usable vs processing:** Query the FeatureServer (`/4/query` or `/5/query`, bbox, `f=geojson`) → clip → bundle GeoJSON. Straightforward.
7. **HONEST VERDICT:** **Usable, minor processing.** The one gotcha to remember: **don't wire to the old `geofabric.bom.gov.au` WFS — it's dead.** Use the FeatureServer.

**5b. Palaeovalley / palaeochannel (GA)**

1. **What/agency:** GA "Palaeovalley Groundwater Resources" mapping.
2. **Endpoint:** product page `https://www.ga.gov.au/about/projects/water/palaeovalley-groundwater-resources` (data on data.gov.au).
3. **Coverage over Opalton:** ❌ **No.** GA's palaeovalley mapping covers **arid/semi-arid WA, SA and NT** — **not Queensland.** Opalton is outside it.
4. **Licence:** CC-BY 4.0 (where data exists).
5–6. N/A for Opalton.
7. **HONEST VERDICT:** **Not usable — genuine gap.** There is no ready national palaeochannel layer over Opalton. Any palaeodrainage favourability would have to be **inferred** from DEM + magnetics, not pulled from a dataset. Flag as aspirational/DIY.

---

## 6. Historical mining claims / tenements (legal overlay — CRITICAL)

1. **What/agency:** Current mining/exploration permits, Geological Survey of Queensland / Dept of Resources. This is **both** the historical-working-density proxy **and** the legal-status source. Opalton opal is worked under **Mining Leases (ML)** and **Mining Claims (MC)**; recreational digging is under the Designated Fossicking Land + a Fossicking Licence.
2. **Endpoints (ArcGIS REST):**
   - **Granular (recommended):** `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Economy/MinesPermitsCurrent/MapServer` — updated nightly. Confirmed layers: **44 ML granted / 45 ML surface granted / 46 ML access granted; 36 MC granted / 37 MC access granted; 3 EPM granted** (plus application variants 40–42, 33–34, 2, etc.).
   - **Simple:** `https://spatial-gis.information.qld.gov.au/arcgis/rest/services/Economy/MineralTenement/MapServer` — single `MineralTenement` polygon layer (GDA2020) if you want all tenure in one call and filter by type attribute.
   - Both also expose OGC WMS via `/WMSServer`.
3. **Coverage over Opalton:** ✅ **Verified** — MineralTenement extent 138–153.5°E, −29 to −10.5°S (whole of QLD, includes Opalton); MinesPermitsCurrent extent likewise covers 142.7°E/−23.75°S.
4. **Licence:** CC-BY 4.0. `copyrightText`: *"© State of Queensland (Department of Natural Resources and Mines, Manufacturing and Regional and Rural Development) 2024"* / *"© State of Queensland (Department of Resources) 2024"*. Attribute: **"© State of Queensland, CC-BY 4.0"**.
5. **Resolution:** Cadastral tenement boundaries (survey-accurate polygons).
6. **Usable vs processing:** **Directly usable** as a WMS overlay for the legal display, **or** query REST → GeoJSON to also read tenure type/holder/status attributes (better for an offline legal advisory). Nightly currency means bundle-refresh matters for offline.
7. **HONEST VERDICT:** **v0.1-ready and non-negotiable — this is the legal backbone.** Use MinesPermitsCurrent for the ML/MC/EPM split; it covers Opalton and is authoritative. Historical-density can be approximated from the density of ML/MC polygons around the field.

**6b. QLD Designated Fossicking Land (Opalton)**

- Opalton **is** a gazetted **Designated Fossicking Land** ("Western Opal Fields"), ~124 km SW of Winton — so a legal fossicking framework exists and its boundary is mappable. QLD lists a **"Designated fossicking land"** layer in the Queensland Globe / QSpatial catalogue (Mining category).
- ⚠️ **Unverified:** I could not confirm the **exact WMS/REST layer name or service path** for the fossicking-areas polygon. Do **not** invent one — locate it via QSpatial search ("designated fossicking land") at `https://qldspatial.information.qld.gov.au/catalogue/` before wiring it. Licence is almost certainly CC-BY 4.0 (QLD default) but confirm on the catalogue record.

---

## 7. Faults + lineaments (structural controls)

1. **What/agency:** Structural geology (faults, folds, lineaments), GSQ.
2. **Endpoints (same ArcGIS REST servers as §1):**
   - **1:100k detailed:** `.../GeoscientificInformation/GeologyDetailed/MapServer` — **Layer 4 = "Detailed faults and shear zones"**, Layer 5 = folds, Layer 8 = **lineaments**, Layer 6 = dykes/veins/sills, Layer 3 = geological boundaries. All polyline vectors.
   - **Statewide 1:2M:** `.../GeoscientificInformation/GeologyState/MapServer` — **Layer 3 = "State Faults"**, Layer 4 = "State Folds", Layer 2 = boundaries.
   - GA-derived magnetic lineaments: no single confirmed vector product; derive from `magmap_v7_2019_RTP`/`_VRTP_1VD` (§2) if needed.
3. **Coverage over Opalton:** ✅ Yes — same servers that returned the Winton Formation polygon carry the coincident structure layers.
4. **Licence:** CC-BY 4.0 (© State of Queensland).
5. **Resolution:** 1:100k line-work (detailed) down to 1:2M (state).
6. **Usable vs processing:** Query REST → GeoJSON → bundle (light). Or WMS overlay.
7. **HONEST VERDICT:** **v0.1-ready** as a vector overlay. Winton Formation structure is subtle (flat-lying Cretaceous), so faults may be sparse at Opalton — but the layer is real, free, and covers the area. Magnetically-derived lineaments are a DIY derivation, not a ready product.

---

## 8. Cultural heritage (RESTRICTED — advisory only)

1. **What/agency:** Aboriginal & Torres Strait Islander Cultural Heritage Database and Register (ACHRIS), administered under the *Aboriginal Cultural Heritage Act 2003* by the Queensland department responsible for First Nations partnerships (formerly DATSIP).
2. **Endpoint:** Public portal `https://www.culturalheritage.qld.gov.au/achris/` (register look-up + application-for-advice). **There is no open WMS/WFS/REST feed of heritage site locations, and there must not be.**
3. **Coverage:** Statewide register exists; **site locations are not public spatial data.**
4. **Licence:** **NOT open data. Restricted.** The public **register** is viewable per-record via the portal; the **database** (which holds sensitive site detail) is released only to land users who need it to meet their **cultural heritage duty of care**, on application.
5. **Resolution:** N/A — do not map.
6. **Usable vs processing:** **Do not ingest. Do not display. Do not cache.**
7. **HONEST VERDICT:** **Never ingest heritage data into the app.** The app must carry a **plain-text advisory only** — e.g. *"You have a cultural heritage duty of care under the Aboriginal Cultural Heritage Act 2003. Check ACHRIS and consult the relevant Aboriginal party before any ground disturbance: culturalheritage.qld.gov.au."* Linking out is fine; embedding site data is both a licence breach and culturally wrong.

---

## Recommended v0.1 layer stack (genuinely ready to ship now)

These four are verified over Opalton, correctly licensed (CC-BY 4.0), and need little or no processing:

1. **GSQ Detailed Surface Geology 1:100k** (`GeologyDetailed` MapServer, layer 15) — the Winton Formation (Kw) favourability base. Query→GeoJSON, clip to bbox, bundle. *Verified: returns "Winton Formation" at the claim.*
2. **QLD MinesPermitsCurrent** (`Economy/MinesPermitsCurrent` MapServer, ML/MC/EPM granted layers) — the legal + historical-working overlay. *Verified: covers Opalton.*
3. **GA magnetics WMS** (`geophys:magmap_v7_2019_RTP`) and **GA radiometrics WMS** (`geophys:radmap_v4_2019_filtered_ternary_image` / `_pctk`) — direct WMS image overlays, ironstone + weathering. *Verified: GetMap returns imagery over Opalton.*
4. **AWS terrarium terrain tiles** — online hillshade/terrain context. *Verified: tile loads over QLD.*

Add **GSQ faults (GeologyDetailed layer 4)** and the **BoM Geofabric FeatureServer streams** as easy fifth/sixth layers — both covered, both CC-BY, light processing.

## Deferred to later

- **SRTM 1-second offline tiles** + derived slope/flow-accumulation for clay-dam pockets — download + raster processing + tile-bundle (offline-first). ~30 m ceiling.
- **GA magnetic/radiometric grid rasters** (eCat/GADDS GeoTIFF download) for on-device thresholding — the WMS endpoint has **no WCS**, so this is a manual download, not a live service.
- **QLD Designated Fossicking Land polygon** — real and gazetted for Opalton, but the exact service layer name is **unverified**; locate via QSpatial before wiring.
- **GA Surface Geology 1:1M** — national fallback only.

## Things I could NOT verify (flagged honestly)

- Exact WMS/REST **layer name for QLD Designated Fossicking Land** (confirmed the layer *exists* in QLD Globe/QSpatial; did not confirm the service path).
- A resolvable **WCS/download URL for SRTM** as a live service (ELVIS is a UI/clip-download, not a WCS I could hit).
- The **`magmap_v7_2019_RTP` LatLon bounding box** from capabilities (XML was truncated) — but the **GetMap over Opalton succeeded**, so coverage is empirically confirmed even though I couldn't read the bbox element.
- Whether the **national 5 m LiDAR DEM** has any tile over Opalton — GA states it's survey-limited (245,000 km²) and remote CW QLD was not surveyed; treat as **not covered**.
