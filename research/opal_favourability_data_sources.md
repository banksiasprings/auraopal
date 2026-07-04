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
   - **⚠️ Signal caveat — read "Geophysics over Opalton — honest signal assessment" below** before over-trusting this layer: the national mag grid is probably too coarse to see a couple of metres of shallow Winton ironstone, and its real value here is structural (fault/lineament trends), best pulled out with the 1VD / tilt-derivative layers.

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

---

## Active exploration techniques (site-scale, over the claim)

Everything above (§1–8) is **passive, open, basin-to-regional** data you pull from a government server. This section is different: it's the **active geophysics you (or a contractor) run ON Steven's 15 ha claim** to try to map the thin, shallow (0.3–8 m) ironstone/clay profile *before the dozer goes in*. The target is nasty for geophysics: **thin layers (ironstone bands are 10s of cm each), shallow (a few metres), and — the killer — a conductive basal CLAY layer.** Clay is the single fact that decides which technique works. It kills the obvious one (radar) and hands the job to the electrical ones (resistivity / EM), which actually *love* a clay-vs-ironstone contrast.

One honest framing up front: **no surface geophysics finds opal.** Opal itself is a tiny, erratic target with no reliable geophysical signature. What these techniques can do is map the **host architecture** — the depth to the clay "floor", the ironstone levels sitting on it, and faults/slumps that pond silica-rich water — so Steven digs the right ground instead of the whole paddock. That's the realistic prize.

### 1. Ground-penetrating radar (GPR) — the obvious candidate, hobbled by clay

**How it works.** A transmit antenna fires a short EM pulse into the ground; reflections come back off boundaries where the dielectric constant changes (e.g. dry sandstone → ironstone → clay). Two-way travel time × velocity = depth. You drag/roll it along lines and stack the traces into a vertical "radargram" cross-section — exactly the kind of layer-cake picture Steven wants.

**Depth vs resolution trade-off for THIS target.** Antenna frequency sets both: **low frequency = deep but blurry, high frequency = shallow but sharp.** As a rule of thumb in *favourable* (dry, resistive) ground: ~100–250 MHz reaches roughly 5–10 m with layer resolution of tens of cm; 400+ MHz gives crisp sub-10-cm resolution but often only 1–3 m depth. For a 5–8 m target with 3–4 thin ironstone bands, **200–250 MHz is the sweet spot** — *if* the ground cooperates.

**The clay problem (critical caveat).** It usually won't. **Clay is the worst common material for GPR.** Wet/conductive clay attenuates the signal at ~50–300+ dB/m and can drop penetration to **under 1 m** — the pulse dies before it reaches the very clay-dam floor that's the whole point. Even dry clay attenuates because of its charged platy structure. The QOMA (Queensland Opal Miners Association) mining notes say this out loud for Winton boulder opal: GPR "reflects more from the clay interface, which can sometimes mask a boulder level" — i.e. you may see the top of the clay but not the ironstone/opal levels above or in it. **Verdict for Opalton: GPR is worth a trial in the driest part of the year on the most sand-capped ground, but expect the basal clay to be a hard ceiling. Do not buy a rig on the assumption it'll image 8 m here.**

**Portability.** All three form factors exist: **hand-carried/handheld** (small shielded antenna, walk it), **hand-cart / push-cart** (survey wheel, most common for systematic grids), and **ute-towed** (antenna in a sled dragged behind a vehicle for fast coverage). For a 15 ha claim a push-cart is the practical unit; ute-tow only helps if the ground is smooth enough.

**Commercial units (brand + model).** **GSSI** SIR-4000 / SIR-30 controllers with 200 MHz & 350–400 MHz antennas; **Sensors & Software** pulseEKKO (100/250 MHz) and Noggin carts; **Guideline Geo / MALÅ** (GX, ProEx, Ground Explorer HDR); **IDS GeoRadar / Leica** (Opera Duo, dual-frequency). All reputable; antenna frequency choice matters more than brand.

**Published use for opal / shallow regolith.** Yes — GPR is named repeatedly for Winton/Opalton boulder opal ("opal is found by gamma-ray logging, ground-penetrating radar, magnetic surveying…"), and QOMA describes it detecting "faults, slips and slides and sub-strata layers and sometimes even the boulder levels." So it's a *real, used* method here — just an unreliable one because of clay.

**Cost (AUD, ballpark).** DIY rental of a GPR system in Australia is roughly **$300–$800/day** plus bond (unverified — varies by hire house and antenna set). Contractor GPR is commonly quoted at **~$150–$450/hr** or **~$1,200–$3,600/day** including a basic report (Australian market figures; treat as indicative, not a quote). Buying a mid-range dual-frequency system new is well into **tens of thousands of AUD** — not sensible for a single claim.

### 2. Rio Tinto "ute-dragged" surface system — what Steven is probably remembering

Steven recalls Rio Tinto "dragging something behind a ute for density mapping." Here's the honest disambiguation, because two different things are getting conflated:

**What "dragged behind a ute" almost certainly is: a towed ground EM/TEM conductivity array — NOT a Rio Tinto density tool.** There's a whole real class of systems where a **transmit/receive coil frame is towed behind a quad, ute or ATV** and logs near-surface **electrical conductivity** continuously as you drive. These are genuinely "dragged behind a vehicle." Confirmed examples:
- **tTEM** (Aarhus/HydroGeophysics) — coils towed behind an ATV, images the **top ~70 m** in continuous mode, ~50 km/day. Purpose-built for detailed near-surface 3D resistivity.
- **AgTEM / "Wallaby"/"Wallaroo"** (Groundwater Imaging, Australian) — a towed TEM frame on non-metallic wheels, used in Australia for **paddock-scale salinity/conductivity** mapping since the early 2000s.
- **Towed EM31/DUALEM-style conductivity meters** and **Geonics/GEM-2** frequency-domain instruments, also commonly quad-towed for soil/regolith conductivity.

That family maps **conductivity contrasts** — which is exactly the clay-vs-ironstone contrast Steven cares about — so it's the *useful* thing to chase (see §6 TDEM below).

**What Rio Tinto actually uses for "density" — and why it's probably NOT a towable consumer tool.** Rio Tinto's public orebody-density / grade tech in the Pilbara is a different animal:
- **Downhole/blasthole gamma & density logging** — probes lowered *into drilled holes* (grade control), not dragged across the surface.
- **Muon tomography** (partnership with Ideon at Kennecott/Bingham Canyon) — density mapping via detectors in **boreholes**, not a towed rig.
- **Airborne** magnetics/radiometrics/gravity flown over tenements — aircraft, not utes.

So: **I could NOT confirm any specific Rio Tinto "ute-dragged density mapper," and there is no evidence of a scaled-down consumer version of one.** My honest read (moderate confidence): Steven is remembering the **towed-EM-conductivity-array** concept (which is real, is dragged behind a vehicle, and *is* buy/hire-able) and has attached the "Rio Tinto / density" label to it from separate mining-news memory. The **genuinely available small-operator version of the useful idea is an operator-carried or towed TEM system** — see the Australian **Loupe** system in §6, which is the closest real-world thing to "walk/drive it over the claim and get a conductivity-depth section." **Do not treat "Rio Tinto's ute tool" as a purchasable product — it isn't a confirmed single thing.**

### 3. Electrical resistivity tomography (ERT) — the strongest signal match

**How it works.** You lay out a line of steel electrodes at fixed spacing, inject current through pairs and measure voltage through others; a switching resistivity meter cycles through hundreds of quadripoles and inverts them into a **2-D vertical resistivity cross-section** (a "pseudosection", then an inverted model). **Clay = conductive (low resistivity); ironstone/silcrete = resistive (high).** That is a textbook strong contrast — ERT should light up the clay floor and the ironstone bands sitting on it better than any other surface method here.

**Array types & depth for ~8 m.** Common arrays: **Wenner** (best vertical resolution / signal-to-noise, good for flat-lying layers like this), **dipole-dipole** (better lateral/structural resolution, noisier), **Schlumberger** (a compromise). Depth of investigation ≈ **⅓–½ of the total line length**, and roughly the electrode spacing sets the shallow detail. For an 8 m target: **~1–2 m electrode spacing over a ~40–60 m line** gets you there with metre-scale layer resolution. Very achievable on a 15 ha claim.

**Portability.** **Ute-portable, not vehicle-towed.** You carry the meter (a box), a couple of cable reels, and a bag of electrodes; two people lay and move lines. No towing, no smooth-ground requirement — works on rough claim country.

**Commercial units.** **AGI SuperSting R8** (8-channel, the workhorse), **ABEM Terrameter LS / LS2** (Guideline Geo), **IRIS Instruments Syscal Pro / Kid**, **PASI / GF Instruments** for budget end. All Australian-serviceable.

**Published use for shallow regolith / opal.** Resistivity is explicitly listed among "geophysical surveys using magnetic, resistivity, shallow seismic and ground penetrating radar [that] have been used with varying success" in the opal fields — and it's the one whose physics best matches a clay-dam target. Widely used generally for clay/regolith/palaeochannel mapping.

**Cost (AUD).** Contractor ERT in Australia runs roughly **$2,000–$4,000/day** for field acquisition, plus ~half a day processing per field day (indicative market figures, not a quote). Rental of a resistivity system is possible but less common than GPR hire — **unverified** day-rate; expect it to sit above GPR rental because the kit is dearer. A new SuperSting-class system is a **large five-figure AUD** purchase — contractor-per-day is the sane path for one claim.

### 4. Passive seismic (ambient-noise / HVSR microtremor) — cheap, but likely too coarse

**How it works.** A single 3-component sensor sits and records ambient ground vibration (wind, distant traffic, ocean microseisms). The **horizontal-to-vertical spectral ratio (HVSR)** peaks at a resonance frequency set by the impedance contrast and thickness of a soft layer over a stiff one; f₀ ≈ Vs / 4H lets you back out depth-to-hard-layer. One person, one puck, a few minutes per station — cheapest option here.

**Portability.** **Hand-carried, single station.** The **Tromino** (MoHo/Italy) is the classic — pocket-sized, battery, no cables, no electrodes.

**Realistic resolution at 5–8 m (be honest).** **Probably too coarse.** HVSR shines from a few tens of metres to hundreds of metres of sediment; getting a clean, reliable resonance for a **5–8 m** layer needs a strong impedance contrast and pushes the method to the shallow edge of its useful range (high f₀, easily lost in cultural noise, systematic depth underestimation of ~10–15%). Some studies do resolve <10–40 m sediment thickness, so it's not impossible — but for mapping *3–4 thin ironstone bands* at a few metres it will at best give a fuzzy depth-to-clay, not layer detail. **Verdict: a cheap reconnaissance "how deep is the hard floor here?" tool, not a layer-mapper. Don't expect it to resolve the ironstone levels.**

**Cost (AUD).** A Tromino is a **five-figure AUD** purchase (unverified exact figure); occasional rental/contract HVSR exists but pricing is **unverified**. Cheapest per-station of any method if you already have the instrument.

### 5. Active reflection seismic — overkill, skip it

**How it works.** You put energy into the ground (hammer plate, weight-drop, small vibrator) and record reflections on a spread of geophones; standard for imaging **hundreds of metres to kilometres** deep (oil/gas, coal, deep structure).

**Why it's wrong for 5–8 m.** At a few metres depth the reflections arrive almost on top of the source pulse — you're inside the near-field/ground-roll mess, and the vertical resolution you'd need (sub-metre) demands very high frequencies that don't propagate cleanly. It's **expensive, crew-and-gear-heavy, and mis-scaled** for a shallow claim. (Shallow *refraction* or MASW surface-wave seismic is more appropriate at shallow depth than reflection, but still coarser and pricier than ERT for this job.) **Verdict: not fit for purpose — noted only to rule it out.** Contractor reflection seismic is a **many-thousands-to-tens-of-thousands AUD** mobilisation — wildly disproportionate to a 15 ha opal claim.

### 6. Time-domain electromagnetic (TDEM) — the conductivity mapper, incl. towed versions

**How it works.** A transmit loop energises the ground; the current is switched off sharply and the **decaying secondary field** (eddy currents) is measured over time. Later time = deeper. It returns a **conductivity-vs-depth** sounding — and, like ERT, it keys directly off the **clay (conductive) vs ironstone/sand (resistive)** contrast, so it's a strong physical match for a clay-dam target. Unlike ERT it needs **no electrodes in the ground** (no ground contact), so it's faster to cover area.

**Depth range & the shallow catch.** TDEM's strength is tens to hundreds of metres; the **very shallow (<5–8 m) end is where it's weakest**, because the earliest time-gates (which carry the near-surface signal) are the hardest to record cleanly. Purpose-built *near-surface* systems push this down. This is the class Steven's "dragged behind a ute" memory really belongs to (§2).

**Portable / towed units (this is the practical bit).**
- **Loupe** (Loupe Geophysics, **Australian / Brisbane**) — an **operator-carried** portable TEM: TX backpack (~12 kg) + RX backpack (~10 kg), walk it continuously with RTK GPS, purpose-built for **near-surface conductivity mapping**, works even near powerlines. This is the closest real, buy/hire-able thing to what Steven pictured — you literally walk it over the claim and get conductivity sections. (Depth-of-investigation figure **unverified** from the vendor page — ask them for the near-surface DOI on a clay/ironstone section; pricing **unverified**, contact-for-quote only.)
- **tTEM** (Aarhus) — **ATV-towed**, images top ~70 m, ~50 km/day; the "drag it behind a vehicle" archetype, but a contractor/research rig rather than an off-the-shelf purchase.
- **AgTEM** (Groundwater Imaging, Australian) — towed frame for paddock-scale conductivity/salinity.
- Frequency-domain cousins (**GEM-2**, **DUALEM**, Geonics **EM31/EM34**) — hand-carried or quad-towed ground-conductivity meters; shallower and simpler, good for a quick conductivity map but coarser on depth.

**Published use.** EM/conductivity methods are standard for clay, salinity, regolith and palaeochannel mapping; not as specifically cited for opal as GPR/gamma, but the physics fit is arguably better than GPR's for the clay floor.

**Cost (AUD).** Contractor ground-TEM day-rates are **unverified** but broadly comparable-to-dearer than ERT (specialist kit + processing). Loupe/AgTEM purchase and hire are **contact-for-quote / unverified**. Treat this as "get a quote from Loupe Geophysics (Brisbane) and one ground-EM contractor" rather than a known number.

### Cost + fit summary table

| Technique | Depth fit for 5–8 m | Resolution | Clay-dam signal match | Portability | DIY/rental (AUD) | Contractor (AUD/day) | Verdict |
|---|---|---|---|---|---|---|---|
| **GPR** (200–250 MHz) | ✅ *if* ground dry/resistive | 🟢 High (10s cm) | 🔴 **Poor — clay attenuates, may not reach floor** | Handheld / cart / ute-tow | ~$300–800/day (unverified) | ~$1,200–3,600/day incl. report (indic.) | Trial in the dry on sand-capped ground; expect clay ceiling |
| **ERT** (Wenner, ~1–2 m spacing) | ✅ Ideal | 🟢 Metre-scale layers | 🟢🟢 **Excellent — clay conductive, ironstone resistive** | Ute-portable (carry + lay) | Rental uncommon (unverified) | ~$2,000–4,000/day + processing (indic.) | **Best physical fit; top pick for the claim** |
| **Passive seismic HVSR** (Tromino) | ⚠️ Shallow edge / marginal | 🔴 Coarse (depth-to-floor only) | 🟡 Impedance, not layers | Hand-carried single station | Instrument = 5-fig buy (unverified) | HVSR contract pricing unverified | Cheap recon "how deep is hard floor"; won't map ironstone bands |
| **Active reflection seismic** | 🔴 Overkill / too deep-focused | 🔴 Poor at few m | 🟡 N/A here | Crew + spread, heavy | n/a | Many $1,000s–$10,000s mob (indic.) | **Ruled out — wrong scale** |
| **TDEM / towed EM** (Loupe, tTEM, GEM-2) | ⚠️ Weakest at very shallow; near-surface rigs help | 🟡 Moderate | 🟢 **Strong — conductivity contrast** | Backpack-carried (Loupe) / ATV-towed (tTEM) | Purchase/hire = contact-for-quote (unverified) | Unverified; ≈ ERT+ | Strong match; "the ute-dragged thing"; get Loupe (Brisbane) quote |

**Bottom line for the claim:** **ERT is the single best-fit technique** — its physics matches a conductive-clay-under-resistive-ironstone target, it reaches 5–8 m easily, it works on rough ground, and it's a known, hireable Australian service at roughly **$2,000–4,000/day**. GPR is the obvious-but-flawed runner-up (clay). TDEM/Loupe is the honest home of the "dragged behind a ute" idea and worth a quote. Passive seismic is a cheap reconnaissance extra; reflection seismic is out.

---

## Geophysics over Opalton — honest signal assessment

Steven's scepticism about the free government geophysics layers is **correct**, and this section says why — so the app doesn't oversell them.

### Airborne magnetics (§2) is probably too coarse — and the wrong rock type

Two independent reasons the national mag grid (GA `magmap_v7_2019_*`) is a **weak** signal at Opalton:

1. **Resolution vs target.** The national compilation is gridded at roughly **80 m cell** (≈3 arc-seconds), flown historically on **wide survey lines (often hundreds of metres to kilometres apart)** in remote country. A few metres of thin, shallow Winton ironstone is **far below what an 80 m grid on wide flight lines can resolve.** The magnetic response of that thin, near-surface ironstone is tiny and gets smeared out.
2. **Wrong iron chemistry.** The national mag surveys were flown to find **strongly magnetic ore country** — the Mt Isa Cu/Pb/Zn and magnetite-bearing terranes to the west/north. **Winton Formation ironstone is a weathering/pedogenic ironstone (goethite/hematite-cemented sandstone), chemically low-Fe and only weakly magnetic** compared to primary magnetite ore. So even at good resolution it wouldn't ring the magnetometer the way ore-country iron does. The survey is essentially tuned for a different rock.

### BUT magnetics can still show *structure* — and enhancement filters pull it out

Even a weak field can reveal **faults, lineaments and basement trends**, and those structures matter because they control where the basal clay slumps, folds and ponds silica-rich water into clay-dams. You don't read structure off raw TMI — you apply **enhancement filters**:

- **Reduction-to-Pole (RTP):** shifts anomalies to sit *directly over their source* (corrects for Australia's inclined field). Makes anomaly-to-geology tie-up honest. *GA publishes this as `geophys:magmap_v7_2019_RTP` — already the app's default mag layer (§2).*
- **First Vertical Derivative (1VD):** a high-pass filter — suppresses long (deep) wavelengths, **sharpens short, shallow, near-surface features and edges.** The most useful single "see-the-shallow-structure" layer. *GA publishes `geophys:magmap_v7_2019_1VD` (and VRTP_1VD) as a **separate WMS layer** — **the app could add a 1VD toggle** and it'd be the better structural view than RTP for shallow trends.*
- **Tilt angle / tilt derivative:** an automatic-gain-control-like filter that **equalises strong and weak anomalies**, so faint shallow lineaments show up as clearly as strong ones; its zero-crossings trace source edges. Excellent for **mapping shallow structure and fault edges**. (Not confirmed as a named layer on the GA WMS — may need deriving from the grid; flag as **unverified** on the service.)
- **Analytic signal (AS):** amplitude envelope of the gradients — peaks over source edges regardless of field direction; good for edge/contact location. *Present on the GA service in the VRTP suite (`..._VRTP_AS`).*

So the app's honest move on mag is: **keep it, but relabel it a "structure/lineament" layer, not an "ironstone detector," and add the 1VD layer** (already published, one WMS call) as the sharper shallow-structure view.

### Radiometrics is likely the more useful free layer here

Gamma-ray spectrometry (GA `radmap_v4_2019_*`, §3) reads the **top ~30–40 cm** of the surface — it's a **weathering/alteration** map, and weathering is exactly what makes opal country:

- **K, Th, U** patterns track weathering intensity, clay and silicification even where mag is flat. Depleted-K + specific Th/U signatures often mark the deeply weathered, silicified profiles that host boulder opal.
- **K/Th ratio maps** are a classic tool for highlighting **silicified / altered / clay-altered zones** — arguably the single most opal-relevant free geophysical product for this ground.
- There is a genuine published thread of **gamma radioactivity being used to find precious opal in Australia** (the "opal level" and opal itself are slightly radioactive; gamma logging flags near-miss drill holes). That's a *direct*, opal-specific rationale that magnetics simply doesn't have here.

GA publishes K (`..._pctk`), Th (`..._ppmth`), U (`..._ppmu`), ternary image and the ratio grids (incl. `..._ratio_tk`) on the **same WMS** already wired in §3 — so a **K/Th ratio** or **ternary** layer is a one-call add and is more defensible than mag over Opalton.

### One-line verdict

> **Over Opalton: airborne mag = weak signal (too coarse, wrong iron chemistry — keep it only as a structural/lineament layer via RTP/1VD); radiometrics = moderate signal (real weathering/alteration proxy, with a genuine opal-gamma precedent — prefer the K/Th ratio or ternary); high-res GPR or ERT run over the claim itself = the real geophysical prize.**

Practical app take: **add the GA 1VD mag layer and a K/Th-ratio (or ternary) radiometrics layer**, label both honestly as regional context — and make clear the *actual* pre-dig decision comes from on-claim ERT/GPR, not the free basin data.

---

## Basin-scale context — eastern vs western Eromanga margin (v0.2+ note)

*Future-planning only — not v0.1. Recorded so a later "where else could Steven look" question starts from evidence, not vibes.*

The opal-bearing **Winton Formation** crops out in a ~1,000 km belt down the **eastern margin of the Eromanga Basin**: Winton–Opalton in the north, through Jundah/Yowah/Koroit, to Quilpie in the south. Historical opal mining sits almost entirely on this **eastern** arc. Why?

**Why mining concentrates on the EASTERN margin (weighing the causes):**
1. **Geology/regolith — the dominant real reason.** Opal needs the **weathered, silicified Winton profile at or near surface** (shallow clay floor + ironstone levels within reach). On the eastern margin the Winton Formation **subcrops/outcrops and is deeply weathered** — the opal-hosting regolith is *there and shallow*. Toward the basin **interior/west, the Winton Formation goes deeper under younger cover**, and the near-surface weathered profile that makes boulder opal thins out or is buried. The academic opal-prospectivity work (Landgrebe/Merdith/Müller et al., *Aust. J. Earth Sci.* 2013; Rey 2013 on acidic weathering) frames prospectivity by **the right sequence of deposition + erosion + intense acidic weathering during the mid-Cretaceous Eromanga Sea retreat** — conditions best expressed on the exposed eastern margin. Their model reduces the *whole* Great Artesian Basin to ~6% prospective, concentrated around the known eastern fields with a NW–SE Winton→Quilpie corridor.
2. **Weathering depth & water.** Deep, shallow weathering + a clay layer that dams silica-rich groundwater is the mechanism; that combination is mapped as strongest along the eastern subcrop, not the deeper-cover west.
3. **Access, water, historical accident (secondary but real).** The eastern fields are nearer roads, rail (the historical Winton/Longreach lines) and town water, and opal was *found* there first (Cragg, 1888) — so exploration effort compounded where discoveries already were. This is a genuine bias, but it's a **rider on top of** the geological reason, not a substitute for it.

**Published surveys of the western side?** I found **no dedicated published opal survey of the western Eromanga margin.** The prospectivity modelling is basin-wide (so it "covers" the west mathematically) but the west scores low, and there's no field campaign literature I could locate specifically assessing western-margin opal ground. **Flag as a genuine gap / unverified** — worth a proper GSQ literature check before acting.

**Is the west a real opportunity, or dead ground? — honest lean.** On the evidence, the western margin is more likely **genuinely less favourable than merely under-explored** — because the controlling factor is **shallow weathered Winton Formation**, and that thins/deepens westward under younger basin cover. The concentration of mining in the east looks **mostly geological, not just historical accident.** *However*, confidence is **moderate, not high**: the "it's just under-explored" case isn't zero (access bias is real, and the prospectivity model does extend prospectivity into "northern and southern sectors" beyond the classic fields), and I could not find a study that *directly* tested western-margin ground. **Lean: east is favoured for sound geological reasons; the west is probably deeper/less-weathered dead-ish ground rather than a hidden field — but treat this as a hypothesis to test against GSQ mapping (depth-to-Winton, regolith/weathering-depth maps), not a settled conclusion.**
