# Decisions (ADR-lite)

Short records of choices worth not re-litigating. Newest at top.

## D3 — Winton Formation from GeologyState (1:2M), not GeologyDetailed (1:100k) — v0.1
**Decision:** the footprint overlay uses QLD `GeologyState` L6 (state surface geology).
**Why:** at v0.1 we want a clean regional *footprint* around Opalton (necessary-condition
context), not fine-scale detail — 8 generalised polygons (133 KB) beat a heavy detailed bundle,
and remote CW QLD 1:100k coverage is patchy. `GeologyDetailed` L15 (which the research doc
confirms returns "Winton Formation, Kw" at the claim) is the higher-res upgrade for v0.2 when we
model geology contacts, not just presence.

## D2 — App in `www/`, deployed via an assembling Pages workflow — v0.1
**Decision:** source lives in `www/` (index.html/sw.js/manifest.json) with top-level `data/` +
`icons/`; `tools/build_site.sh` flattens all three into `_site/` and a GitHub Actions workflow
uploads that as the Pages artifact.
**Why:** the task asked for the `www/` layout, but Pages branch-source only serves `/` or
`/docs`. An assembling Actions workflow honours the requested structure AND gives a clean
`banksiasprings.github.io/auraopal/` URL. Rejected: serving from repo root like AuraGold (would
contradict the `www/` request); putting data/ inside www/ (splits the canonical data location).

## D1 — Data-visualisation first, no favourability scoring at v0.1 — v0.1
**Decision:** v0.1 renders raw, honestly-labelled layers (magnetics is "a raw signal", not a
forecast) and Steven's ground truth. No composite favourability score.
**Why:** Steven's methodology — *data first → correlations → specialists*. Build the honest data
layer before any prediction. Scoring needs the deferred layers (radiometrics, terrain/drainage,
faults) wired and a calibration pass against the Aug 2025 ground truth (the 40×40 m gem cluster
= a positive example; fault-adjacent potch = a structural-but-low-quality negative). Deferred to
a later version with an explicit rule registry (thresholds + rationale + source + last-reviewed).
