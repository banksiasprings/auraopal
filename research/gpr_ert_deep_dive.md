# GPR + ERT Deep Dive — Imaging Steven's Opalton Boulder-Opal Lease

**Scope.** A decision document for one person: Steven, running one ~15 ha boulder-opal
**mining lease** at Opalton, Central-West Queensland. The question is narrow and practical —
*how does he get a picture of the subsurface (0–8 m) of his own ground before the dozer goes in,
and what should he actually spend to do it?* Two technologies are on the table: **ground-penetrating
radar (GPR)** and **electrical resistivity tomography (ERT)**. Steven's explicit ask is that the
answer might be **both, used together**, not either/or — and after working the physics against his
specific stratigraphy, that ask is correct.

**How this doc relates to the others.** The main research file
(`opal_favourability_data_sources.md`, "Active exploration techniques") already ranked the whole
menu of on-claim geophysics (GPR, ERT, TDEM/Loupe, passive seismic, reflection seismic) and put
GPR + ERT at the top. **This document goes one level deeper on just those two** — the physics, and
then every way to actually get the gear: build it, buy it new, buy it used, rent it, or pay a
contractor — with AUD figures and honest verdicts throughout.

**Site facts baked into every recommendation below:**

| Fact | Value | Why it matters |
|---|---|---|
| **Stratigraphy** | Sandstone overburden → 3–4 ironstone layers (the opal-bearing target) → basal clay floor | Sets what each method "sees" and in what order |
| **Target depth** | 0.3 m (surface finds) → ~4 m (in-situ opal on the clay) → ~8 m (isolated boulders) | Fixes the depth-vs-resolution window: **~5–10 m** |
| **The complication** | "**False clay pockets**" appear inside the sandstone/ironstone — not just at the base | Creates GPR **dead-spots mid-section**, unpredictably. This is the crux (see §1.3) |
| **Lease size** | ~15 ha (one lease, not a basin) | Small enough to survey properly; too small to justify big mobilisation |
| **Location** | Remote CW QLD, ~3 h drive from Winton, no grid power | Kills mains-powered gear; inflates any contractor mobilisation cost |
| **Season** | Winter only (summer heat) | ~1 field window per year → the 12-month runway is really *one* shot at fieldwork |
| **Operator** | Solo tradie, hobby budget, willing to learn, hands-on | DIY and self-operated rental are genuinely on the table; big capex is not |

> **One honest framing up front, carried over from the main doc and true for everything below:**
> **no surface geophysics finds opal.** Opal is a tiny, erratic target with no reliable
> geophysical signature. What GPR and ERT can do is map the **host architecture** — depth to the
> clay floor, the ironstone levels sitting on it, and the structural pockets that pond
> silica-rich water — so Steven digs the *right* ground instead of the whole paddock. That is the
> realistic prize, and it's a big one.

> **⭐ The genesis insight that sets the survey target — Steven's field observation from months of
> digging; treated here as strong ground truth.** The basal clay is not merely the floor the
> signal dies on. It is **the single best predictor of where the thick, good opal sits.** The
> mechanism Steven has read directly off the ground:
> 1. The clay basement is uneven, and its **low points form little dams** that trap silica-rich
>    groundwater into standing **pools**.
> 2. That silica-rich water, acting on the organic-bearing mudstone over geological time,
>    **converts the mudstone into ironstone.**
> 3. **Ironstone sitting immediately above a clay-basement pool grows the thickest, best-quality
>    opal.** Opal forms in the higher ironstone layers too, but thinner. **Proximity to the
>    clay-basement low points is the thickness control** — a separate axis from colour.
>
> **Therefore the real thing a survey should optimise for is the *topography of the clay basement*
> — the local low points where water ponded — plus the ironstone package immediately above them.**
> This sharpens every recommendation below:
> - **ERT is the natural instrument for mapping the clay-basement contour** — clay-conductive vs
>   ironstone/sand-resistive is a textbook-perfect signal for exactly this, so ERT rises from
>   "the dependable one" to **the primary tool**.
> - **GPR's highest-value job is narrowed and sharpened:** not "image any ironstone" but
>   **image the ironstone-on-clay boundary and measure the ironstone thickness directly over the
>   lows ERT found.**
> - The winning combination falls straight out of the genesis: **ERT finds the pools; GPR
>   characterises the ironstone above them.** (§1.5 designs this survey; §7 costs it.)
> - For the future favourability model, **"proximity to the basal-clay low points" deserves its
>   own weight** — arguably the heaviest thickness driver.

---

## Part 1 — Technology fundamentals

### 1.1 Physical principle — what each instrument actually measures

**GPR = an echo-sounder for the ground, using radio waves.** A transmit antenna fires a very
short electromagnetic pulse (nanoseconds long, in the ~10 MHz–2 GHz band depending on the antenna)
down into the earth. Wherever the pulse crosses a boundary between two materials with a different
**dielectric permittivity** (loosely, how the material stores electrical energy — controlled mostly
by water content and, secondarily, by porosity and mineralogy), part of the energy reflects back
up to a receive antenna. The instrument records the **two-way travel time** of every echo. Move the
antenna along a line, stack the traces side by side, and you get a **radargram**: a vertical
cross-section where the horizontal axis is distance along the ground and the vertical axis is
travel time, which converts to depth once you know the wave velocity. It is, quite literally, a
sonar-style picture of the layer-cake — exactly the image a miner wants. GPR responds to
**contrasts in dielectric/water content**; a sharp, dry sand → ironstone → clay sequence is a
strong series of dielectric steps, so it reflects well *as long as the pulse can reach it*.

**ERT = mapping how easily the ground passes an electrical current.** You push a line of metal
stakes (electrodes) into the ground at a fixed spacing. The instrument injects a controlled DC-ish
current between one pair of electrodes and simultaneously measures the resulting **voltage** across
another pair. Ohm's law plus the array geometry converts each current/voltage reading into an
**apparent resistivity** for the patch of ground that pair "sees". A modern system has a switch box
that automatically cycles current and voltage through hundreds or thousands of electrode
combinations, sampling progressively deeper and wider patches. A computer then runs an **inversion**
— it iteratively solves for the 2-D (or 3-D) distribution of *true* resistivity in the ground that
best explains all those apparent-resistivity readings. The output is a colour cross-section of
**resistivity vs depth**. ERT responds to **bulk electrical conductivity**, which in this ground is
dominated by clay content and pore-water salinity: **clay = conductive (low resistivity, "cold"
colours); dry sandstone = very resistive (high, "hot"); ironstone = intermediate-to-resistive.**

**The key difference in one line:** GPR gives you a **high-resolution picture but only where the
signal can travel**; ERT gives you a **lower-resolution but far more robust picture almost
anywhere**, because current always finds a path even through conductive clay. That trade sits at
the heart of why, on Steven's ground, they complement each other rather than compete.

### 1.2 Depth vs resolution — the fundamental trade-off, with numbers for a 5–10 m target

Both methods force the same choice: **you cannot have maximum depth and maximum detail at once.**
They just expose the knob differently.

**GPR — the knob is antenna frequency.**
- **Higher frequency (400 MHz–1 GHz+):** short wavelength → **sharp** resolution (can separate
  features a few centimetres apart) but **shallow** penetration (often 1–3 m, less in anything
  conductive). This is the "utility-locating / concrete-scanning" band. *Too shallow for Steven.*
- **Lower frequency (100–250 MHz):** longer wavelength → **coarser** resolution (resolves features
  tens of centimetres apart) but **deeper** reach — in dry, resistive ground, roughly **5–10 m**.
- **Rule of thumb:** vertical resolution ≈ ¼ to ½ of the wavelength in the ground. At 250 MHz in
  dry sandstone (velocity ~0.10–0.12 m/ns), wavelength is ~0.4–0.5 m, so you can resolve layers
  roughly **10–25 cm** apart. That is *just* fine enough to separate 3–4 ironstone bands if they're
  not touching, and to pick the depth-to-clay cleanly.
- **The verdict for Opalton's 5–10 m window: 200–250 MHz is the sweet spot.** 100 MHz buys more
  depth margin but starts to blur the thin ironstone bands; 400 MHz is sharper but may not reach
  the 8 m boulder level. If Steven ever runs GPR, a **200–250 MHz antenna** is the target spec.
  (Dual-frequency systems that carry, say, 200 + 600 MHz give both a deep-coarse and a
  shallow-sharp view in one pass — genuinely useful here.)

**ERT — the knob is electrode spacing and line length.**
- **Depth of investigation ≈ 1/5 to 1/3 of the total array length** (array-dependent; deeper for
  some configurations). So to reliably "see" to ~8–10 m you want a spread on the order of
  **~40–60 m** or more of laid-out line.
- **Shallow detail is set by the electrode spacing** — the tightest layer you can resolve is
  roughly the electrode spacing itself. **1–2 m spacing** gives metre-scale layer resolution to
  ~8 m, which is exactly the granularity Steven needs (depth-to-clay, thickness of the ironstone
  package). Tighter spacing (0.5–1 m) sharpens the near-surface but needs more electrodes to keep
  the same depth.
- **Concrete recipe for his target:** a **48-electrode line at 1 m spacing = 47 m long, ~8–10 m
  depth of investigation, ~1 m layer resolution.** Roll that line across the lease on a grid, or
  run a couple of orthogonal lines through a known dig, and you have a resistivity model of the
  whole profile. Very achievable on 15 ha.
- **The trade in one line:** wider spacing/longer line = deeper but coarser; tighter spacing =
  sharper but shallower for the same electrode count. ERT's coarser *inherent* resolution (it can't
  match GPR's centimetres) is the price you pay for it working even where GPR dies.

**Head-to-head at 5–10 m:** GPR wins on **resolution** (cm-to-decimetre layer detail — a real
picture), ERT wins on **reliability of reaching depth** (it will always return *a* model to 8 m;
GPR only does if the ground lets the pulse through). Hold that thought — §1.3 is where Steven's
specific ground decides it.

### 1.3 Signal-loss sources at Opalton — the decisive section

This is where a generic "GPR vs ERT" comparison meets Steven's actual dirt. The stratigraphy is
unusually **favourable for GPR in the common case** and unusually **forgiving for ERT in every
case** — but the *false clay pockets* are the wildcard that decides the whole recommendation.

**What each material does to a GPR pulse:**

| Material at Opalton | Effect on GPR | Notes |
|---|---|---|
| **Dry sandstone overburden** | 🟢 **Excellent** — low loss, fast, clean propagation | Radar's ideal medium. The pulse travels far and returns crisp reflections. |
| **Ironstone layers (the target)** | 🟢 **Strong reflector** — high dielectric/mineralogical contrast against sandstone | Shows up as bright, continuous reflectors — this is the layer-cake Steven wants to read. A boulder appears as a discrete hyperbola (point-reflector arc). |
| **Basal clay floor (bottom)** | 🟡 **Signal killer — but it's UNDER the target** | Wet/fine clay attenuates radar at ~50–300+ dB/m; the pulse dies in it. But because it sits *below* the ironstone, GPR has already imaged the target before hitting it. The clay reads as "the depth where the signal goes dark" = a usable **floor pick**. |
| **False clay pockets (mid-profile)** | 🔴 **The problem — dead-spots in the middle of the section** | A lens of clay *inside* the sandstone/ironstone absorbs the pulse before it reaches the target beneath that spot. On the radargram it looks like a shadow: everything below the lens goes blank. **You can't tell in advance where these are, and you can't see through them.** |

**The false-clay-pocket problem, in full (this is the heart of Steven's ask).**
In the textbook Opalton profile — sandstone → ironstone → basal clay — GPR is close to ideal: it
fires through clean resistive sandstone, lights up the ironstone bands, and only dies at the basal
clay *beneath* what matters. If that were the whole story, GPR would win outright. **But Steven's
ground truth is that clay doesn't only live at the base — false clay lenses appear as pockets
scattered through the sandstone and ironstone.** Each such pocket is, to a radar pulse, a local
wall: it absorbs the energy, and **everything directly below it on the radargram goes dark**. The
result is a survey that is crisp and readable across most of a line and then has **blind columns**
where a shallow clay lens sits — and crucially, *those blind columns can hide exactly the
ironstone-on-clay geometry Steven is hunting.* You cannot predict where they are from the surface,
and no amount of processing recovers data the clay never let through. GPR alone, on this ground,
gives you an excellent picture with **unpredictable holes in it**.

- **Can the dead-spots be mitigated within GPR?** Only partially. Lower frequency (100 MHz)
  penetrates conductive material a little better, so a shallow, thin lens *might* be punched
  through at the cost of resolution — but a thick or wet lens still blocks it. Multi-frequency
  passes, denser line spacing (so a pocket blocks fewer lines), and careful gain processing help
  you *recognise* a dead-spot for what it is, but they don't let you see beneath it. **The honest
  answer: GPR cannot reliably image through a mid-profile clay lens, and that's a physics limit,
  not a technique or settings problem.** The mitigation that actually works is *a second method
  that doesn't care about the lens* — which is ERT.

**What each material does to an ERT reading:**

| Material at Opalton | Effect on ERT | Notes |
|---|---|---|
| **Dry sandy overburden** | 🟡 **High resistivity → the challenge for ERT** | Very dry, resistive ground makes it hard to inject current — you get weak signals and need good electrode contact (water the stakes, use enough current). This is ERT's weak point here, and it's manageable. |
| **Ironstone layers** | 🟢 **Moderate-to-resistive — a distinct middle value** | Reads as an intermediate resistivity band between the resistive sand and the conductive clay — i.e. it *separates cleanly* on the section. |
| **Basal clay floor** | 🟢🟢 **Perfect target — low resistivity, the strongest signal ERT gets, AND the thing most worth mapping** | Conductive clay is the *easiest* thing for ERT to map. The clay floor lights up as a continuous low-resistivity base. Current flows *toward* it, so it's imaged, not shadowed. **Per the genesis insight, the *shape* of this low-resistivity base is the prize map — its low points are the pools that grow the thick opal.** ERT reads that contour directly. |
| **False clay pockets** | 🟢 **Imaged, not shadowed — the key advantage** | A mid-profile clay lens is a local low-resistivity blob. ERT current flows around and through it and the inversion places it in the section. **Where GPR goes blind, ERT sees a bright spot.** This is precisely the failure mode ERT covers. |

**Which technology is more forgiving at Opalton's specific stratigraphy?** **ERT, decisively —
on robustness.** ERT's physics keys directly off the single most important contrast in this ground
(clay-conductive vs everything-else-resistive), it does not get shadowed by clay lenses (it images
them), and it always returns a model to depth. Its only real weakness here — very dry, resistive
sand making current injection hard — is a nuisance you solve with water and contact, not a
showstopper. **GPR is more forgiving on resolution but far *less* forgiving on completeness:** it
gives a beautiful picture in clean ground and unpredictable holes wherever a clay lens hides. So:
**ERT is the dependable framework; GPR is the high-resolution detail layer that works where the
ground is clean.** That asymmetry is the entire argument for using both.

### 1.4 What each technology sees *clearly* at Opalton

**GPR sees clearly (in clean, uncapped ground):**
- **Layer boundaries** — the sandstone/ironstone interfaces and the top of the clay, at
  decimetre resolution. The actual layer-cake, as a picture.
- **Discrete subsurface objects** — an isolated boulder shows up as a characteristic hyperbola;
  channels, slumps, and fault offsets show as breaks and dips in the reflectors.
- **The depth-to-clay floor** — read directly as the depth where reflections stop.
- **What it does *not* see:** anything beneath a false clay pocket (dead-spot), and fine internal
  detail below ~8–10 m regardless.

**ERT sees clearly (everywhere):**
- **Bulk resistivity contrast** between the three players — a clean three-tone section: resistive
  sand (hot), intermediate ironstone, conductive clay (cold).
- **The clay floor's depth and shape — the single highest-value output.** This resistivity
  contour *is* the clay-basement topography from the genesis insight: the local low points are
  where silica-rich water ponded, so they are the thick-opal targets. ERT maps them across the
  whole lease in one survey. Reading this map, then digging the lows (and the ironstone directly
  above them), is the core payoff of the whole exercise.
- **False clay lenses** — as discrete conductive blobs in the section, *including the ones GPR
  can't see past.*
- **What it does *not* see:** thin individual ironstone bands as separate lines (they blur into
  one intermediate zone unless well separated), and it won't pick a single small boulder — its
  resolution is metre-scale, not decimetre.

**The picture, combined:** ERT draws the reliable **structural skeleton** (where's the clay floor,
where are the pockets, where's the resistive ironstone package) across the whole lease; GPR fills
in **high-resolution anatomy** (exact layer depths, individual bands, boulders) wherever the sand
is clean enough to let it. Neither alone answers Steven's question; together they do.

### 1.5 Combining GPR + ERT — the standard cross-validation practice, done economically

Running two methods over the same ground is not gold-plating — it is **standard near-surface
geophysics practice**, precisely because each method's blind spot is the other's strong point.
Here's how to do it without doubling the cost:

1. **ERT is the reconnaissance / framework survey; GPR is the targeted detail survey.** Don't run
   both densely everywhere. Run **ERT lines on a coarse grid** across the whole 15 ha (or the part
   that's prospective) to map the clay floor and find the pockets. That's your map of *where the
   architecture is interesting*.
2. **Then run GPR only on the ERT-flagged targets** — the lines where ERT shows a shallow clay
   floor with ironstone sitting on it, or a suggestive pocket. GPR turns those into
   high-resolution cross-sections you can read boulder-by-boulder. You spend the expensive,
   slower, dead-spot-prone method only where it will pay off.
3. **Cross-validate at co-located lines.** Run at least one GPR line directly along one ERT line.
   Where they agree, you trust the picture. Where GPR goes dark but ERT shows a conductive blob,
   **you've just positively identified a false clay pocket** — the disagreement is itself the
   information. This is the classic use of two methods: the mismatch tells you what's there.
4. **Same grid, same GPS, one mobilisation.** If you own/rent both, or a contractor brings both,
   do them in one field trip on the same survey grid so the sections line up and you only pay to
   get to Opalton once. For a remote winter-only site, **the single biggest saving is doing
   everything in one visit.**
5. **Depth calibration for free.** Every trench or existing dig on the lease is a ground-truth
   point. Tie an ERT/GPR line across a known dig where Steven already knows the depth-to-clay, and
   you calibrate the resistivity/velocity values for the *whole* survey off that one control point.

**Economic bottom line of combining:** the marginal cost of adding the second method is small if
you plan them onto one grid and one trip — a modest amount of extra field time — and the payoff is
that you convert GPR's biggest weakness on this ground (invisible dead-spots) into a *detected,
mapped feature.* For Steven's specific stratigraphy, **GPR + ERT together is not the luxury option;
it is the technically correct one**, and §7 turns that into a spending plan.

---
