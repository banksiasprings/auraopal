# tools/

## build_site.sh
Assembles the publishable static site. GitHub Pages branch-source only serves `/` or `/docs`,
so we flatten `www/` + `data/` + `icons/` into `_site/`. Used by both local preview and the
deploy workflow (`.github/workflows/deploy.yml`).

```bash
bash tools/build_site.sh
cd _site && python3 -m http.server 8099   # http://localhost:8099/
```

## Refetching the bundled overlays

Both bundled GeoJSONs come from the **QLD Spatial ArcGIS server**
(`spatial-gis.information.qld.gov.au`), CC-BY 4.0. Re-run these to refresh
(`f=geojson`, `maxAllowableOffset` generalises geometry to keep the files small).

### Winton Formation footprint → `data/winton_formation.geojson`
Source: `GeoscientificInformation/GeologyState/MapServer/6` (State Surface Geology, polygons),
filtered to `ru_name='Winton Formation'` (map symbol `Kw`, Cretaceous).

```bash
BASE="https://spatial-gis.information.qld.gov.au/arcgis/rest/services"
curl -s "$BASE/GeoscientificInformation/GeologyState/MapServer/6/query?\
where=ru_name%3D%27Winton%20Formation%27&\
geometry=142.30,-24.20,143.20,-23.30&geometryType=esriGeometryEnvelope&inSR=4326&\
spatialRel=esriSpatialRelIntersects&\
outFields=ru_name,map_symbol,lith_summary,age&returnGeometry=true&\
maxAllowableOffset=0.0008&outSR=4326&f=geojson" -o data/winton_formation.geojson
```

### Mining tenements → `data/tenements_opalton.geojson`
Source: `Economy/MineralTenement/FeatureServer/0`. Opal = `tenmineral='OP'`; tenure types in
`tentype` (Mining lease / Exploration permit minerals), status in `tenstatus`.

```bash
BASE="https://spatial-gis.information.qld.gov.au/arcgis/rest/services"
curl -s "$BASE/Economy/MineralTenement/FeatureServer/0/query?\
where=1%3D1&geometry=142.45,-24.05,143.05,-23.45&geometryType=esriGeometryEnvelope&inSR=4326&\
spatialRel=esriSpatialRelIntersects&\
outFields=tenname,tentype,tenmineral,tenowner,tenstatus,fileid&returnGeometry=true&\
maxAllowableOffset=0.0003&outSR=4326&f=geojson" -o data/tenements_opalton.geojson
```

## Icons
The opal-gem PWA icon set (`icons/`) was generated once with PIL (faceted diamond +
play-of-colour over an ironstone rounded square). Regenerate only if the brand mark changes.
