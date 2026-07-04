# DIY ERT Build Project — Build Your Own Resistivity Imager, Prove It on the Farm, Take It to Opalton

**What this is.** A complete, end-to-end build-and-operate guide for one person: Steven — hands-on
QLD tradie, comfortable with electronics and a soldering iron, **zero formal geophysics** — who wants
to **build his own electrical resistivity tomography (ERT) instrument**, learn to run it, and use it
to see into the ground before the dozer does. It is the sequel to the decision document
(`gpr_ert_deep_dive.md`), which already did the hard thinking and landed on a clear answer: for
Steven's ground and budget, **ERT is the right tool, and building an OhmPi is the right way to get
one.** This document assumes that decision and answers the next question in full: *how do I actually
do it?* — from ordering parts to reading a finished subsurface image.

**How to read it.** It's long because it's meant to be your **sole reference from decision to first
successful survey.** Skip around: §1 is the physics in plain language; §2–§4 are the build; §5 is the
software; §6 is how to run a survey; §7 is your specific jobs; §8 is the honest cost-and-time budget;
§9 is where to get help; §10–§11 are extensions and safety; **§12 is the one-page summary — read that
first if you read nothing else.**

**Two honest framings carried over from the decision doc, true for everything below:**

> **1. No survey finds opal (or water, or ore) directly.** ERT maps the *host architecture* — the
> clay basement, the weathered profile, the rock surface, the fracture zones — so you dig the right
> ground instead of the whole paddock. At Opalton the prize is the **clay-basement topography**
> (its low points are the pools that grew the thick opal); at Banksia Springs the prize is
> **depth-to-fresh-granite** and the **clay/fracture zones**. Those are the realistic wins, and
> they're big ones.

> **2. This is a real electronics + Linux + Python project, not a kit.** It is genuinely buildable
> by a competent DIY builder, it is peer-reviewed and actively supported, and the payoff — a
> reusable instrument that cost ~10× less than commercial and that you can repair yourself — is
> excellent. But the OhmPi team put a stern safety disclaimer on every page for a reason (it injects
> up to ~80 V pulses), the assembly docs assume you can read a schematic, and there is **no single
> costed shopping list** you can just click "buy" on. Go in expecting a project, not an afternoon.

**Dollar convention (same as the decision doc).** Every figure is flagged **[VERIFIED]** (from a
cited, resolving source) or **[ESTIMATE]** (reasoned, with basis stated). FX as of **July 2026:
US$1 ≈ A$1.55, €1 ≈ A$1.65** — stated wherever a conversion is used. No price or product is invented;
where a link could not be confirmed it is flagged.

---

## §1. How ERT works — the physical principle in plain language

### 1.1 What ERT actually measures

Electrical Resistivity Tomography measures one thing: **how hard it is to push electrical current
through the ground**, patch by patch, and builds a cross-sectional picture from thousands of those
measurements.

The raw physics is Ohm's law — the same law in every electrical circuit: **voltage = current ×
resistance**. Push a known current into the ground through two metal stakes, measure the voltage that
appears across two *other* stakes, and you can calculate the resistance of the lump of ground the
current flowed through. Multiply that resistance by a geometric factor (which depends only on where
the four stakes sit) and you get **apparent resistivity** — a number in ohm-metres (Ω·m) describing
how resistive that patch of ground is, independent of the array size.

Why "apparent"? Because the ground isn't uniform. The single number you measure is a **weighted
average** of everything the current passed through — dry sand, clay, a boulder, groundwater, all
blended. It's the resistivity the ground *would* have if it were uniform and gave that same reading.
The real subsurface has different resistivities at different depths and positions, and untangling the
true distribution from a whole set of apparent-resistivity readings is the job of **inversion**
(§1.4).

**Why resistivity maps geology at all.** Different earth materials pass current very differently, and
the spread is enormous — over five orders of magnitude:

| Material | Typical resistivity (Ω·m) | Why |
|---|---|---|
| Clay (moist) | ~1–100 | Clay minerals + held water conduct well → **low resistivity** |
| Saturated sand / gravel | ~50–500 | Pore water carries current |
| Weathered granite / "deco" | ~100–1,000 | Partly broken down, holds some clay + moisture |
| Dry sand / dry overburden | ~1,000–10,000 | Little water, poor conductor → **high resistivity** |
| Fresh granite / bedrock | ~5,000–100,000+ | Dense, dry, unfractured → **very high resistivity** |
| Ironstone (Opalton target) | intermediate–resistive | Sits between conductive clay and resistive sand |

*(Indicative ranges; a properly cited table with a reference is in §6.9. Real ranges overlap and
depend heavily on water and clay content — which is exactly what makes them a useful signal.)*

The single fact that makes ERT so useful for both of Steven's jobs: **clay and water are conductive;
dry rock and fresh bedrock are resistive.** So an ERT section lights up clay pods, weathered/deco
zones and the water table as *cool colours* (low resistivity) against the *hot colours* (high
resistivity) of dry sand and fresh rock. At Opalton the clay basement reads cold, the ironstone/sand
above it reads warmer, and the boundary draws itself. At BSF it's the same contrast upside-down:
conductive weathered deco over resistive fresh granite.

### 1.2 The current-injection cycle — what happens in one measurement

One reading is a four-electrode cycle:

1. **Inject.** The instrument drives a controlled current (OhmPi: a short DC pulse, a few mA up to
   tens of mA) out of one electrode (**A**, the positive current electrode) and back into another
   (**B**, the negative current electrode). Current spreads through the ground between them in a 3-D
   pattern of curved flow lines.
2. **Measure.** At the same instant, it measures the tiny voltage difference between two *potential*
   electrodes (**M** and **N**) sitting between or around A and B. That voltage is what the injected
   current "costs" to flow through that patch of ground.
3. **Reverse and stack.** Good instruments flip the current polarity and repeat, averaging several
   pulses to cancel natural ground voltages (self-potential) and electrode drift. This is why ERT
   uses **pulsed DC**, not steady DC — a steady current polarises the electrodes and soil and
   corrupts the reading.
4. **Compute apparent resistivity.** ρ = k × (V ÷ I), where k is the **geometric factor** set purely
   by the A-M-N-B spacing. Store it.

Then the multiplexer (§1.3) picks a *different* four electrodes and does it all again — hundreds to
thousands of times, sampling shallow-narrow patches through to deep-wide ones, until it has a full
dataset covering the whole section under the line.

### 1.3 Multiplexing — how you turn 4 electrodes into a tomography machine

A single four-electrode reading is an old technique (a "resistivity sounding," done by hand for a
century). What makes it **tomography** — an image — is doing it automatically across a whole line of
electrodes in every useful combination. That's what the **multiplexer** does.

Lay out (say) 32 electrodes in a straight line at 1 m spacing. A multiplexer is a bank of electronic
switches (relays) that can connect *any* electrode to the A, B, M or N role on demand. The controller
runs through a pre-planned list — the **sequence** or **protocol** — of four-electrode combinations:

- Close-spaced sets (electrodes 1-2-3-4) sample a **shallow, narrow** patch.
- Wider sets (1-4-7-10, then 1-8-15-22 …) push current deeper → **deeper, broader** patches.
- Sliding each pattern along the line (2-3-4-5, 3-4-5-6 …) covers the whole length at each depth.

Run the full sequence and you have a grid of apparent-resistivity readings, each tagged with a
horizontal position and a rough depth. The multiplexer is exactly the subsystem a commercial box
charges tens of thousands of dollars for and that OhmPi builds from a stack of ~$5 relays — **it is
the heart of the DIY win.**

### 1.4 From voltages to a picture — inversion, and the pseudosection

You now have (say) 400 apparent-resistivity readings. Two steps turn them into an image:

**Step 1 — the pseudosection (raw, automatic).** Plot each reading at its horizontal midpoint and at
a pseudo-depth proportional to the electrode spacing, colour by apparent resistivity, and you get a
rough cross-section. This is *not* the real ground — depths are only nominal and each point is still a
blurred average — but it's an instant field sanity check: "conductive stuff here, resistive stuff
there." OhmPi's web GUI draws it live as the survey runs.

**Step 2 — the inversion (the real image).** Inversion is the mathematical heavy lifting. The
software models the subsurface as a grid of cells, each with an unknown true resistivity, then loops:

1. **Guess** a resistivity for every cell (start uniform).
2. **Forward-model:** simulate what apparent-resistivity readings that guessed ground *would* produce,
   for the exact array and sequence you used.
3. **Compare** simulated vs measured. The mismatch is the **RMS error** (root-mean-square, a %).
4. **Adjust** the cell resistivities to shrink the mismatch, and repeat.

After a handful of iterations the model stops improving — simulated matches measured to within the
noise — and *that* model is your resistivity image: a true cross-section of Ω·m vs depth and distance.
A healthy inversion converges to a **few percent** RMS misfit; if it can't get below ~10–15%, your
data is noisy or you're forcing the model (§6.8).

**The honest caveat every geophysicist lives with:** inversion is **non-unique** — more than one
subsurface can explain the same readings, so the software leans on a "smoothness" assumption to pick
the least-surprising model. ERT images are therefore **smoothed and slightly blurred**: real
boundaries are fuzzier than the picture suggests, and a thin layer can smear into a gradient. This is
why **ground truth** (a dig, a bore, a known trench) is worth more than any processing trick — it
pins the colours to reality (§6.10).

### 1.5 The three array geometries — Wenner, Schlumberger, dipole-dipole

The *pattern* in which the four electrodes are chosen (the array type) trades signal strength against
resolution against depth. You don't pick one and live with it — a DIY sequence usually runs more than
one and the inversion uses them all — but know what each is for.

**Wenner** — four electrodes **equally spaced**: A — M — N — B, each gap = `a`. Move the group along,
then increase `a` for the next depth level.
- **Strong signal** (potential electrodes sit close to the current ones → big, clean voltage), so
  it's the **most tolerant of noise and of poor ground contact** — exactly the problem in dry,
  resistive ground. **The array to start with at BSF and Opalton.**
- **Good vertical resolution** — excellent at flat-lying layers and depth-to-a-contact (depth-to-clay,
  depth-to-rock). Weaker at narrow vertical features and lateral detail.
- Shallowest depth-of-investigation per unit line length of the three.

**Wenner-Schlumberger** — the two potential electrodes (M, N) stay close together in the middle while
the current electrodes (A, B) move progressively **wider apart**.
- A **good all-rounder**: nearly Wenner's signal strength, better depth reach, and a sensible mix of
  vertical and lateral resolution. The standard "if in doubt" choice and a good second array to add
  to a Wenner survey.

**Dipole-dipole** — the current pair (A, B) sit close together as one "dipole"; the potential pair
(M, N) sit close together as another, and the **two dipoles are separated by a growing distance**.
- **Best lateral resolution and best at deeper features** — the array for hunting *vertical*
  structure: the edges of a clay pod, a fault, a filled channel, the flank of a palaeo-low. At
  Opalton this resolves the *shape* of the clay basement and the fault, not just its depth.
- **Weakest signal** (potential electrodes far from the current ones → small voltage), so it's the
  **most sensitive to noise and needs good contact and enough current** — its Achilles heel in dry
  ground.

**Practical rule for Steven:** run a **Wenner** pass for a solid, noise-tolerant layered picture
(depth-to-clay / depth-to-rock), then add a **dipole-dipole** (or Wenner-Schlumberger) pass over the
same line when you need lateral detail — the low points, pod edges, the fault. ResIPy and PyGIMLi
happily invert Wenner and dipole-dipole data together for the best of both.

### 1.6 Depth vs electrode spacing — the fundamental trade

Two knobs, one section:

- **Electrode spacing sets the shallow detail.** The thinnest layer you can resolve is roughly the
  electrode spacing. 1 m spacing → ~1 m near-surface resolution. Tighter (0.5 m) sharpens the
  near-surface but, for the same electrode count, gives a shorter line and less depth.
- **Total array length sets the depth.** Depth-of-investigation ≈ **15–25% of the total laid-out line
  length** (array-dependent; Wenner at the shallow end, dipole-dipole deeper). To "see" ~8–10 m you
  want a spread of **~40–60 m**.
- **The trade:** wider spacing / longer line = deeper but coarser; tighter spacing = sharper but
  shallower for the same electrode count. You buy depth *or* detail with a fixed number of electrodes
  — the only way to get both is more electrodes (a longer line at tight spacing). That's exactly why
  64-electrode capability matters: it reaches the ~8 m boulder level at Opalton while keeping
  metre-scale resolution.

**Concrete recipe** (carried from the decision doc): a **48-electrode line at 1 m spacing = 47 m long,
≈8–10 m depth of investigation, ≈1 m layer resolution** — the granularity that reads depth-to-clay and
the ironstone package cleanly. A 64-electrode line at 1 m reaches the full ~10–15 m.

### 1.7 One diagram — a Wenner array in action

```
   INSTRUMENT (OhmPi)                  current in ──►        ◄── current out
   ┌───────────────┐                        │                      │
   │  I  source    │══════╗           ╔══════╪══════╗        ╔══════╪
   │  V  meter     │═╗    ║           ║   measure   ║        ║      │
   └───────────────┘ ║    ║           ║   voltage   ║        ║      │
                     ║    ║           ║   here      ║        ║      │
       ground surface║    ▼    a      ▼        a    ▼   a    ▼      ▼
   ────●─────────────╫────●───────────●─────────────●────────●──────────  ...
     (spare)         │    A           M             N        B
                     │    └──── a ────┴──── a ──────┴─── a ──┘
                     │  current      potential    potential  current
                     │  electrode    electrode    electrode  electrode
                     │
       current-flow  │      ╭───────────────────────────────╮
       lines dive    ▼    ╭─╯      the wider A–B is, the      ╰─╮
       deeper the        ╭╯      deeper & broader the patch     ╰╮
       wider A–B is    ╭─╯        of ground being sampled        ╰─╮
   ═══════════════════╧═══════════════════════════════════════════╧═════════
   (clay basement / fresh-granite floor — the low-Ω·m or high-Ω·m boundary you're mapping)

   A,B = current electrodes (inject / return current)   M,N = potential electrodes (measure voltage)
   a   = electrode spacing (equal for all three gaps in a Wenner array)
   Widen a → the sampled patch gets deeper & broader → the next depth level of the pseudosection.
   Slide the whole A-M-N-B group along the line → covers the section horizontally at that depth.
   The multiplexer automates both moves, cycling the full electrode line so you never move a stake.
```

---

## §2. The OhmPi project — deep dive

**One-paragraph verdict.** OhmPi is the real thing: a peer-reviewed, actively-developed, genuinely
open (hardware *and* software) multi-electrode resistivity meter, built and backed by a European
public-geoscience consortium, with all parts sourceable in Australia and a live community behind it.
Nothing else in the DIY world comes close (§3 proves that by elimination). **The honest caveat is
that it's a modular research instrument, not a polished kit** — the docs assume electronics
competence, and there is *no single costed bill of materials* you can just buy. Build it expecting to
price the parts yourself off the project's board files, and to bring real soldering and Linux/Python
skills. For Steven, that's a good fit.

### 2.1 Origin story & governance

OhmPi is developed by a **European public-research consortium**, not a company — which is why it's
fully open and why it's stable, but also why it's documented like a research project rather than a
product. The core authors and their institutions (from the project's "About" page):

- **Rémi Clément, Arnold Imig, Nicolas Forquet** — INRAE (French National Research Institute for
  Agriculture, Food and Environment), REVERSAAL, Villeurbanne
- **Olivier Kaufmann, Arnaud Watlet** — Université de Mons, Belgium
- **Yannick Fargier** — Université Gustave Eiffel (IFSTTAR), Lyon
- **Hélène Guyard** — IGE Grenoble, Université Grenoble Alpes
- **Guillaume Blanchy** — ULiège, Liège (also a ResIPy author — the ecosystem overlaps)

Plus ~10 current and 4 past named contributors. Home: [ohmpi.org](https://ohmpi.org/) · About:
[ohmpi.org/source_rst/introduction/about.html](https://ohmpi.org/source_rst/introduction/about.html).

**Peer-review pedigree — solid but dated, and worth being precise about.** There is **one refereed
journal paper**, and it documents the *old* 2020 design:

> Clément, R.; Fargier, Y.; Dubois, V.; Gance, J.; Gros, E.; Forquet, N. **"OhmPi: An open source
> data logger for dedicated applications of electrical resistivity imaging at the small and
> laboratory scale."** *HardwareX*, vol. 8, e00122, 2020. DOI:
> [10.1016/j.ohx.2020.e00122](https://doi.org/10.1016/j.ohx.2020.e00122) · open-access mirror:
> [PMC9041214](https://pmc.ncbi.nlm.nih.gov/articles/PMC9041214/) · indexed:
> [PubMed 35498256](https://pubmed.ncbi.nlm.nih.gov/35498256/).

Two honesty notes: **(1)** it's published in **HardwareX, not the Journal of Open Hardware** — there
is no JOH paper. **(2)** Everything since 2020 — the 200 V-capable measurement board, the v2024
multiplexer, the web UI — is documented only on the project's own docs site plus **conference
abstracts and a HAL tutorial preprint**, *not* in a refereed journal. The later work is real and
public, but if you want the peer-reviewed anchor, it describes the 32-electrode / 24 V generation.
Later documentation (all verified to resolve):
- Blanchy, Watlet, Clément, Kaufmann — **"OhmPi: learn how to build an open-source resistivity meter,"**
  HAL preprint / *Agriculture and Geophysics* (Zurich, Feb 2024):
  [hal.science/hal-04895699v1](https://hal.science/hal-04895699v1) — a v2024 build tutorial.
- Watlet et al. — **"Latest developments of OhmPi…,"** EGU General Assembly 2023, DOI
  [10.5194/egusphere-egu23-13675](https://meetingorganizer.copernicus.org/EGU23/EGU23-13675.html)
  (notes injection raised to 80 V, multichannel Vmn, a field 3-D water-infiltration monitoring panel).
- Near Surface Geoscience 2023 conference paper, DOI
  [10.3997/2214-4609.202320205](https://www.earthdoc.org/content/papers/10.3997/2214-4609.202320205)
  (page exists; returns 403 to automated fetch — loads in a browser).

### 2.2 Version history — the crux for a builder

OhmPi is **modular**: you mix a *measurement board*, some *MUX (multiplexer) boards*, and a *power
module*, each independently versioned. Reading the repo (`PCB_boards/`) as of mid-2026:

- **Measurement boards:** `mb.2023.x` → **`mb.2024.1.1` (current).**
- **MUX boards:** `mux.2023.x` → **`mux.2024.0.3` (current).**
- **Power:** a plain **12 V battery** (fixed voltage) *or* the **DPH5005** programmable digital supply.

The jump from the 2023 to the 2024 measurement board is the one that matters for Steven's dry,
resistive ground (verified specs from the project's `hw_specs.rst`):

| Parameter | Measurement board v2023 | **v2024 (current)** |
|---|---|---|
| Max permissible injection Vab | 24 VDC | **200 VDC** (board tolerance ceiling) |
| Vmn input impedance | 80 MΩ | **1000 MΩ** |
| Current range | 0.11–40 mA | 0.11–50 mA |
| Operating temperature | 0 to 50 °C | **−25 to 50 °C** |
| Pulse duration | 50 ms – 15 s | 50 ms – 15 s |

**Two corrections to earlier notes, so you build with the right numbers:**
1. The older board's real *max permissible* injection is **24 VDC**, not 12 V (12 V was the *supply
   rail* and the injection voltage used in the 2020 paper).
2. The stock **DPH5005 supply injects up to ~50 V**; the **200 VDC is the mb.2024 board's rated
   tolerance**, reached only with a *different* high-voltage source, not the stock build. Recent dev
   work runs injection up to ~80 V. **In practice, a stock OhmPi Lite v2024 gives you ~50 V of
   injection** — plenty for the near-surface, and the higher input impedance + wider temperature
   range are the real upgrades.

**MUX board options:** `mux.2023` = 64 electrodes/board in a single role (so 4 boards for A/B/M/N);
`mux.2024` = **8–16 electrodes/board** (16 in 2-role mode, 8 in 4-role mode), built in multiples of 8,
with both IDC ribbon and screw terminals — friendlier to wire.

**Current release:** the **v2024** line (software tag `v2024.0.38`, Jan 2026; the software repo is
active to at least July 2026).

**➜ The recommended DIY target today** — the project's own flagship tutorial build:

> **OhmPi Lite v2024, 32 electrodes = 1× `mb.2024` measurement board + 4× `mux.2024` MUX boards +
> 1× DPH5005 power module + a Raspberry Pi.**
> Assembly guide:
> [ohmpi.org/…/assembling_mb2024_MUX_2024_dph5005.html](https://ohmpi.org/source_rst/hardware/assemble_ohmpi/assembling_mb2024_MUX_2024_dph5005.html)

A **16-electrode Lite** (2 MUX boards) is the cheapest way to prove the build; a **64-electrode full
build** (`mb.2024` + `mux.2023`) is the scale you'd want for the deepest Opalton/bore lines. Start at
32, scale to 64 if a line proves too short — the boards are additive.

### 2.3 Hardware architecture in plain language

Four functional blocks, wired together (not a single Pi-HAT — separate PCBs joined by ribbon/IDC and
screw terminals):

- **Controller — a Raspberry Pi.** Runs the software; talks to every board over the **I²C** bus
  (two wires, SDA/SCL). The 2020 paper used a **Pi 3B**; the v2024 docs are Pi-model-agnostic — a
  **Pi 4** is the sensible current choice. You enable I²C once in `raspi-config`.
- **Measurement board (transmit + receive in one).** Injects current at A–B and measures the voltage
  at M–N, flipping A/B polarity for stacking. Voltage is digitised by an **ADS1115 16-bit ADC** with
  programmable gain; to read above its ±5 V range the **mb.2024 uses a differential op-amp** (giving
  the 1000 MΩ input impedance). Current is read across a **2 Ω shunt**. Polarity is switched by
  relays driven by an **MCP23008** GPIO expander.
- **Multiplexer (MUX) boards.** Banks of relays that route the A/B/M/N roles to any electrode,
  addressed over I²C. This is what makes it tomography rather than a single sounding.
- **Power / injection.** Either a plain **12 V SLA battery** (simple, fixed voltage — but Vab isn't
  measured, so ~10% uncertainty) or the **DPH5005 programmable DC-DC** (USB-controlled, injects up to
  ~50 V, lets you push more current into dry ground — **worth it for Opalton/BSF**). The measurement
  board switches the supply on and off between injections.

### 2.4 Firmware / software on the device

- **Language: Python**, on Raspberry Pi OS (Linux). The code is the `ohmpi/` package —
  `ohmpi.py` (the main `OhmPi` class), `hardware_system.py`, `sequence.py`, plus a
  `hardware_components/` sub-package with **one driver file per board version** (this is why one
  codebase supports the whole board matrix).
- **Install:** `git clone https://gitlab.com/ohmpi/ohmpi.git` → run `./install.sh` (it builds a
  Python virtualenv, installs dependencies, sets up a local MQTT broker, configures I²C).
- **Configuring a survey — two layers:**
  1. **`config.py`** describes *how your hardware is wired* — which board versions, how many MUX
     boards, the electrode ranges, the power model. A helper `python setup_config.py` interviews you
     and picks the right pre-baked file from `configs/` (it ships ~45 ready-made configs with names
     like `config_mb_2024_0_2__4_mux_2024_2roles_dph5005.py` — find yours and you're most of the way
     there).
  2. **Sequence files** are the actual electrode plan — plain text, one `A B M N` quadrupole per
     line, in `sequences/`. It ships Wenner sequences (`wenner1-16.txt` … `wenner49-64.txt`) and
     dipole-dipole files, so you don't write them by hand.
  3. **`settings/*.json`** holds acquisition parameters (pulse time, stacks).
- **Three ways to drive it** (`interfaces.rst`): **(a) Web GUI** — `./run_http_interface.sh`, browse
  to `http://localhost:8000`; shows a live pseudosection, a **contact-resistance check**, and
  full-waveform view; the Pi can run as its own Wi-Fi hotspot so your phone/laptop connects in the
  field. **(b) Python API** — `import` the `OhmPi` class and script it. **(c) MQTT/IoT** — for
  embedding in a monitoring rig. **For Steven: the web GUI is the on-ramp** — no code needed to run a
  survey.

### 2.5 Schematic + PCB — and how to get boards made

**Full KiCad design files and Gerbers are in the repo — you can send them straight to a fab house.**
Each board folder (e.g. `PCB_boards/measurement_boards/mb.2024.1.1/`) contains the KiCad schematics
(`.kicad_sch`), the PCB layout (`.kicad_pcb`), a **`gerbers/` folder**, and an **interactive BOM**
(`ibom.*.html`) plus a spreadsheet listing every component. The MUX folders have the same set.

- **Licence:** software = **GNU GPLv3**; hardware = **CERN-OHL-S v2** (the strong-reciprocal open
  hardware licence — you can freely fabricate and modify, share-alike). (The README mentions CERN-OHL-P
  in one spot but the file actually shipped is the **-S** variant.)
- **Getting PCBs made:** upload each board's `gerbers/` zip to **JLCPCB** or **PCBWay** — both ship to
  Australia (costs and AU landed price in §4.4). The boards are 2-layer, ~10×10 cm, which lands in the
  cheapest fab tier.
- **Good news on soldering:** the Lite v2024 build is friendlier than "open-hardware" usually implies.
  The **relays are through-hole** (Omron G5LE — you hand-solder them, ~2–4 hours per MUX board), and
  the trickiest chips come as **plug-in modules** — the ADS1115 on an off-the-shelf breakout, and the
  current shunt+amplifier as a **pre-soldered MikroBus "Current-Sense Click" module** — so you do
  **not** need a hot-air/reflow station or to reflow bare fine-pitch chips. A temperature-controlled
  iron and patience are enough. There are some SMD passives on the boards, but you can hand-place those
  or pay JLCPCB/PCBWay to assemble them if you'd rather. KiCad familiarity helps for any modification.

### 2.6 Documentation quality — honest assessment

Docs live at [ohmpi.org](https://ohmpi.org/) (self-hosted on GitLab Pages — note
`ohmpi.readthedocs.io` **does not exist**, despite the Read-the-Docs look). The source is a separate
repo, `gitlab.com/ohmpi/ohmpi-doc`.

- **Strong:** the *conceptual* hardware explanation (`hw_info.rst`) is genuinely excellent for a
  non-geophysicist — it explains the ADC, gain, op-amp vs divider, shunt, relay switching and I²C in
  plain language. The software/config/interfaces pages are clear and current. There's a getting-started
  page, a troubleshooting page, a field-installation checklist PDF, a gallery, and a web-GUI demo
  video ([youtu.be/bY9xKfqTJUc](https://youtu.be/bY9xKfqTJUc)).
- **Weak / patchy — go in knowing this:** the **assembly guides are essentially photo sequences** with
  terse captions — fine if you're competent, but *not* an idiot-proof step-by-step with a checklist and
  torque specs per step. **There is no consolidated, costed BOM** (the single biggest documentation
  gap — see §2.7). Some pages have rough edges (stray lock/backup files, a README licence mismatch).
  Every page repeats a **stern safety disclaimer** — "must be assembled by people competent in
  electronics… not responsible for damage" — because it injects up to ~80 V.
- **Currency:** docs track v2024 and are maintained alongside the code (activity through mid-2026).

### 2.7 Community & adoption

- **Repo:** canonical on **GitLab** — [gitlab.com/ohmpi/ohmpi](https://gitlab.com/ohmpi/ohmpi) (GitHub
  [github.com/ohmpi/ohmpi](https://github.com/ohmpi/ohmpi) is a one-way mirror). Metrics look modest
  (~5 stars, 7 forks) **but that's a namespace artefact** — the project moved off INRAE's institutional
  GitLab (`reversaal.gitlab.irstea.page`) to `gitlab.com/ohmpi` in **January 2024**, so the star count
  reset; the real history is **3,269 commits, 39 tags**, active to mid-2026.
- **Chat:** an **active Discord** — [discord.gg/2SCKQZBzXh](https://discord.gg/2SCKQZBzXh) (verified
  live) — plus **GitLab Issues** (the dev workflow is issue-driven). This is the single best place to
  get unstuck (§9).
- **Development model:** a clear branch cadence (`alpha` → `beta` → `rc` → `master`) — a sign of a
  maintained project, not an abandoned one.
- **Adoption:** the 2020 HardwareX paper is *the* widely-cited low-cost open-ERT reference; the fork
  network shows active external contributors (e.g. Benjamin Mary maintains a notable fork). *Honesty
  flag:* I confirmed the ecosystem and contributor activity but did **not** verify a specific named
  third-party hobbyist/thesis build end-to-end — the Discord + multi-institution contributor list
  strongly imply external builds, but treat "lots of hobbyists have built one" as *likely, not proven*.

### 2.8 The biggest risks a builder should walk in knowing

1. **No costed BOM.** You must price the parts yourself off the interactive-BOM/spreadsheet files. §4
   does this for Australia, but every dollar below the 2020 paper's `<US$500` figure is an **estimate**
   until you price the exact v2024 board revisions.
2. **Hand-soldering, but a lot of it.** No reflow needed (relays are through-hole; the fiddly chips
   are breakout/Click modules — §2.5), but you'll hand-solder ~64 relays plus headers across the
   boards. It's volume, not difficulty. Budget the hours (§8).
3. **It's HV-adjacent.** ~50–80 V injection is above the extra-low-voltage line (§11.2). Respect it.
4. **Linux/Python/I²C debugging.** If a board doesn't show up on the I²C bus, you're reading
   `i2cdetect` output and checking addresses — normal for the hobby, but real work.

None of these is a showstopper for a hands-on tradie who solders and isn't afraid of a Raspberry Pi.
They're the honest "expect a project" list.

---

## §3. Alternative DIY paths — honest comparison

The decision doc named OhmPi as the pick; the brief asked whether that survives a real search for
alternatives. **It does — decisively.** Two credible independent open designs exist and deserve a
mention, one genuinely cheaper *manual* path exists for a different job, and several "projects" that
get name-dropped in this space **turn out not to exist.** Here's the honest landscape.

### 3.1 The candidates that are real

**OhmPi (the reference).** Covered in §2 — multiplexed to 32/64 electrodes, `<US$500`-class,
peer-reviewed, active Discord, all parts AU-sourceable, KiCad+Gerbers open. **Nothing found beats it
for automated tomography.**

**Geo-Resistivity Meter — National Observatory, Rio de Janeiro (Cruz Júnior et al. 2023).** A genuine,
independent, fully-open automated resistivity meter — **peer-reviewed in *Geoscientific
Instrumentation, Methods and Data Systems* (Copernicus), Jan 2023**, with circuits and firmware
released on Zenodo. Microcontroller-driven electromechanical switching, **24 electrodes**,
programmable arrays (tested with Schlumberger VES). Paper:
[gi.copernicus.org/articles/12/15/2023/](https://gi.copernicus.org/articles/12/15/2023/) · code (DOI):
[10.5281/zenodo.7411844](https://doi.org/10.5281/zenodo.7411844).
- *vs OhmPi:* similar electrode count and automation, commodity parts (AU-sourceable), but **much
  thinner community and documentation** — a paper + a Zenodo drop, no Discord, no forum. A good
  *reference design* to cross-check OhmPi against, not a better path.

**Vega et al. 2021 — low-cost automated resistivity meter (CONICET, Argentina).** Open, low-cost,
programmable, modular; validated with **dipole-dipole, Wenner-Schlumberger and Wenner**. Published in
AGU's *Earth and Space Science*:
[agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020EA001575](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2020EA001575).
- *vs OhmPi:* comparable ambition and multi-array support, but **weaker community and the build files
  are harder to find** (the paper asserts an open release; the specific repo URL wasn't exposed in
  open mirrors — flag as unconfirmed). Again a reference, not a replacement.

**Clark & Page — "A Simple Resistivity Meter" (2011) + the humanitarian redesign (Page et al. 2021).**
This is the one genuinely *cheaper* alternative, for a *different* job. It's an ultra-low-cost open **DC
resistivity meter for groundwater / humanitarian use** — but it is **manual 4-electrode (VES /
soundings), with no multiplexer** — a hand-moved sounding tool, not an imaging array. **Verified
published costs: the 2011 build `<US$250`; the 2021 redesign `US$177` meter + `US$108` Raspberry-Pi
logger.** 2011 paper:
[researchgate.net/publication/272489114](https://www.researchgate.net/publication/272489114_A_Simple_Resistivity_Meter);
2021 (SEG *Geophysics*): [library.seg.org/doi/10.1190/geo2021-0058.1](https://library.seg.org/doi/10.1190/geo2021-0058.1).
- *vs OhmPi:* **cheaper and simpler, but manual** — you move the electrodes and take one sounding at a
  time; there's no automated 2-D image. **Worth knowing about as the "how cheap can I prove the
  physics?" option** (it's essentially the §4.1 bench-test path, scaled to a fieldable box), but it
  won't map a clay basement across a grid. If you only ever wanted vertical soundings at a few points,
  this would do — but Steven wants images, so OhmPi wins.

**Open EIT / medical Electrical Impedance Tomography.** Real and open (e.g. the OpenEIT / ExploreEIT
boards), but **not adaptable to this job.** Medical EIT drives *milliamp AC currents through a ring of
electrodes a few centimetres apart around a chest or arm* to image at centimetre scale over centimetre
depths, using a fundamentally different (impedance-spectroscopy, ring-geometry) measurement. Adapting
it to push current metres into the ground at DC would mean redesigning the front end, the electrode
model, the geometry and the inversion — i.e. rebuilding it into an OhmPi. **Interesting cousin,
wrong tool.**

**Arduino/microcontroller one-offs and hobbyist earth testers.** A scattering of these exist as
single conference papers or blog builds (e.g. Fatahillah & Darsono 2019, an Arduino MEGA + shift-
register relay bank:
[ui.adsabs.harvard.edu/abs/2019JPhCS1153a2022F](https://ui.adsabs.harvard.edu/abs/2019JPhCS1153a2022F/abstract);
the Elektor "Earth Resistance Meter 150084":
[elektormagazine.com/labs/earth-resistance-meter-150084](https://www.elektormagazine.com/labs/earth-resistance-meter-150084)).
Honest read: these are **design references, not buildable community projects** — no released repo, no
support, and the Elektor unit is a *single-electrode ground-resistance meter*, not a 4-pole array, so
it isn't even directly repurposable. A commercial 4-pole earth tester (e.g. Kyoritsu KEW 4106) *is*
Wenner-capable and could take manual soundings, but it's a closed commercial instrument, not DIY.

**SimPEG (software, not hardware).** Worth a bookmark: [github.com/simpeg/simpeg](https://github.com/simpeg/simpeg)
— a very active MIT-licensed geophysical inversion library (DC/IP/EM/gravity/magnetics) with the
largest open-geophysics community and a Discourse forum. It's an *inversion* tool you'd run after
collecting data (an alternative to PyGIMLi for the advanced user, §5), **not a meter.**

### 3.2 The "projects" that don't actually exist — debunked, so you don't chase them

The decision doc flagged a couple of half-remembered names; a rigorous search settled them, and turned
up a few more phantoms. **None of these is a real open resistivity project — don't waste time hunting
them:**

- **SEP1000 — myth.** Zero GitHub/repo results. "SEP" is the **Stanford Exploration Project**, a
  *seismic* imaging consortium ([sep.sites.stanford.edu](https://sep.sites.stanford.edu/)); the
  closest real hardware is the **commercial ABEM Terrameter SAS1000** (a likely mishearing). No
  open-source "SEP1000" exists.
- **FRED ("Free Resistivity Electrode Device") — myth.** Zero results; the acronym is saturated by
  medical defibrillators (Schiller "FRED") and an aneurysm flow-diverter. Invented name.
- **PROMIS — not open.** It's IRIS Instruments' **commercial PROMIS-10**, a frequency-domain
  *electromagnetic* system — not resistivity, not open.
- **"Res-check" / "IRIS-clone community" — don't exist.** No DIY resistivity project by that name; no
  Syscal-clone community. OhmPi *is* the de-facto open answer to a Syscal, but it's a fresh design,
  not a clone.

### 3.3 Verdict

**OhmPi stays the top pick, and it isn't close.** It's the only mature, multiplexed, community-backed,
peer-reviewed open ERT *imager* that exists. The two real alternatives (Brazilian Geo-Resistivity
Meter, Argentine Vega meter) are honourable independent designs worth citing and cross-referencing but
have a fraction of OhmPi's documentation and support. The Clark & Page humanitarian meter is a real,
cheaper *manual sounding* tool — genuinely useful as the ultra-budget "prove the physics" step, but it
doesn't image. Everything else is either a software package, a wrong-domain cousin (medical EIT), an
unsupported one-off, or a name that doesn't correspond to a real project. **Build the OhmPi.**

---

## §4. Full build guide — the OhmPi Lite v2024 path

This is the shopping list, the tools, and the assembly, at the level a competent DIY electronics
builder can follow. Target: **OhmPi Lite v2024, 32 electrodes** (§2.2) — the project's flagship
tutorial build, scalable to 64 later. Every price is Australian, dated **July 2026 (US$1 ≈ A$1.55,
€1 ≈ A$1.65)**, and flagged **[VERIFIED]** (live URL confirmed) or **[ESTIMATE]** (basis stated).

### 4.1 Bill of materials — 32-electrode build (AUD)

| Component | AU source | AUD ea | Qty | Line | Status |
|---|---|---|---:|---:|---|
| Raspberry Pi 4 Model B 4GB | [Core Electronics](https://core-electronics.com.au/raspberry-pi-4-model-b-4gb.html) | 163.22 | 1 | 163 | [VERIFIED] |
| ADS1115 16-bit ADC breakout | [Core Electronics](https://core-electronics.com.au/ads1115-16-bit-adc-4-channel-with-programmable-gain-amplifier.html) | 27.60 | 1 | 28 | [VERIFIED] |
| DPH5005 programmable buck (injection supply) | [eBay AU listing](https://www.ebay.com/itm/323299223592) | ~78 | 1 | 78 | [ESTIMATE] (US$44 module + post ×1.55; anti-bot blocked exact fetch) |
| Omron relay **G5LE-14 DC12** (SPDT 10A, through-hole) | [DigiKey AU](https://www.digikey.com.au/en/products/detail/omron-electronics-inc-emc-div/G5LE-1-DC12/280366) | ~2.58 | ~64 | ~165 | [VERIFIED] (see note ⚠) |
| MCP23008/23017 I²C GPIO expander | [Core Electronics](https://core-electronics.com.au/mcp23017-i2c-16-input-output-port-expander.html) | 13.60 | 5 | 68 | [VERIFIED] |
| INA282 current-sense (as MikroBus Click module) | [DigiKey (INA282AID)](https://www.digikey.com/en/products/detail/texas-instruments/INA282AID/2354703) | ~9.80 | 1 | 10 | [ESTIMATE] (US$6.32 ×1.55; buy as pre-soldered Click, don't reflow) |
| 12 V 7.2 Ah SLA battery | [Jaycar SB2486](https://www.jaycar.com.au/12v-7-2ah-sla-back-up-battery-nbn-alarm-ufb/p/SB2486) | 32.95 | 1 | 33 | [VERIFIED] |
| PCBs (5× 2-layer ~10×10 cm, landed) | [JLCPCB](https://jlcpcb.com/) | — | 5 | ~35 | [VERIFIED] (US$2 base + AU post; duty-free) |
| **Electrodes** — 316L stainless TIG rod 1.6×500 mm, 20-pk | [Bunnings Bossweld](https://www.bunnings.com.au/bossweld-1-6-x-500mm-stainless-steel-316l-tig-rod-20-stick_p6380100) | 19.45 | 2 pk | 39 | [VERIFIED] (~$0.97/electrode) |
| **Cable** — heavy-duty fig-8, ~260 m (disciplined reuse) | [Jaycar WB1708](https://www.jaycar.com.au/heavy-duty-fig-8-speaker-cable/p/WB1708) | 1.29–1.55/m | ~260 m | 130–335 | [VERIFIED] (rate); [ESTIMATE] (metreage) |
| Connectors — spade crimp pack 160-pc + alligator clips | [Jaycar PT4530](https://www.jaycar.com.au/quick-connect-crimp-connector-pack-160-pieces/p/PT4530) | ~15 + ~15 | — | ~30 | [ESTIMATE] (listings live, price fetch blocked) |
| Enclosure — sealed ABS 222×146×55 mm (IP-rated) | [Jaycar HB6013](https://www.jaycar.com.au/tools-test-equipment/enclosures-panel-hardware/plastic-boxes/abs/c/7HA3) | 29.50 | 1 | 30 | [VERIFIED] |
| **32-electrode subtotal** | | | | **≈ $765–970** | (cable spread is the swing) |

**⚠ Two load-bearing procurement notes from the pricing pass:**
1. **The Omron `G5LE-1 DC12` is end-of-life/last-stock at DigiKey — order the still-current
   `G5LE-14 DC12` (≈A$2.58) instead.** Same footprint, through-hole. Check OhmPi's iBOM for the exact
   part before ordering ~64 of them.
2. **The board uses the `MCP23008`; the stocked Australian breakout is the `MCP23017`** (drop-in
   equivalent for this use). Confirm against the board's interactive BOM.

*Because there is no official costed BOM (§2.8), generate the definitive list from each board's
`ibom.*.html` / `.xlsx` in the repo before you buy — the table above is a verified-price starting
point, not a substitute for pricing the exact board revisions you fab.*

### 4.2 Scaling to 64 electrodes

Add 4 more MUX boards' worth: ~64 more relays (~$165), ~4 more MCP expanders (~$54), a second PCB set
(~$30), 2 more electrode packs (~$39), and — the swing factor — **a lot more cable** (a centre-fed
64-electrode line at 1 m is on the order of ~1,000 m of cumulative run → **$300–$1,290** depending on
layout discipline). **64-electrode all-in ≈ $1,200–$2,200.** The DPH5005, Pi and enclosure carry over.
Buy 32 first, prove it, then scale — the boards are additive.

### 4.3 Tools — what you need, and what you can skip

The single most useful finding for a builder: **the Lite v2024 needs only two tools you must own, and
neither an oscilloscope nor a hot-air station is required.**

| Tool | Required? | AU band | Verdict |
|---|---|---|---|
| **Temperature-controlled soldering iron** | ✅ **Required** | $60–150 | You'll hand-solder ~64 through-hole relays + headers. |
| **Multimeter (true-RMS)** | ✅ **Required** | $50–120 ([Jaycar QM1321 $49.95](https://www.jaycar.com.au/)) | The only mandatory *instrument* — continuity, relay/takeout checks, calibration. |
| Hot-air / reflow station | ❌ Not needed | $150–250 | Only for reflowing bare SMD — the build avoids that (breakouts/Click modules). |
| Bench power supply | 🟡 Nice-to-have | ~$180–260 | The DPH5005 + 12 V battery *is* your programmable supply; a bench PSU just eases board bring-up. |
| Oscilloscope | ❌ Not needed | $200–600+ | The build/calibration guide never calls for one; the ADS1115 telemetry over I²C is your "scope." |

**If starting from zero, budget ~$130 in tools (iron + multimeter).** Most tradies own both.

### 4.4 The expensive part — cables — and why

**Cable is the sleeper cost and, at 64 electrodes, can rival the entire electronics bill.** In a
commercial ERT system the multi-core takeout cable is *the* priciest consumable; DIY doesn't escape
that, it just makes it cheap fig-8 instead of moulded survey cable. Two ways to wire it:
- **Individual runs back to the box** (simplest, most reliable) — each electrode gets its own
  conductor to the MUX board. Cumulative length grows fast with electrode count (~n²/2 metres for a
  centre-fed line), which is why 64 electrodes needs ~1,000 m.
- **A single multi-core "takeout" cable** with a tail every 1 m — tidier in the field but harder to
  source/make cheaply; the fig-8 approach is the pragmatic DIY choice.
- **Discipline saves the most money:** buy 100 m rolls, keep the spread tidy, roll it up and reuse it
  line-to-line rather than cutting fixed lengths. Label every conductor at both ends.

**PCB manufacturing detail:** **JLCPCB** is cheapest — 5× 2-layer ≤100×100 mm boards from **US$2 base**
(~A$3.10) + AU postage → **~A$25–40 landed**; **PCBWay** is US$5/5. Australia's **A$1,000 low-value
import threshold** means a hobby PCB order is **duty/GST-free** in practice
([JLCPCB customs help](https://jlcpcb.com/help/article/customs,-duties-and-taxes)). Lead time ~2 days
build + 3–7 days DHL (or 1–2 weeks economy).

### 4.5 Electrode design — stainless, not copper

- **Use 316 stainless steel, not copper.** Copper electrodes *polarise* — they build up a chemical
  self-potential that injects DC noise straight into your millivolt-level measurement. Stainless is
  the standard non-polarising-enough, corrosion-resistant, cheap choice. (True non-polarising
  Cu/CuSO₄ "pot" electrodes exist for ultra-precise IP/SP work, but they're overkill here.)
- **Cheap and workable:** 316L stainless **TIG welding rod** (1.6 mm × 500 mm, ~$0.97 each) — genuine
  316L, fine for shallow survey; a bit thin/flimsy in hard ground.
- **Sturdier for Opalton's hard, dry ground:** heavier **6 mm × 1.2 m 316 stainless threaded rod**
  ([Bunnings Macsim](https://www.bunnings.com.au/macsim-6mm-x-1-2m-stainless-steel-threaded-rod_p2410334),
  ~$8–12/stick [ESTIMATE], cut into ~4 electrodes) — drives in better, the thread grips soil and takes
  an alligator clip well. **Worth the upgrade for the field trip.**
- **Commercial stainless ERT electrodes** exist (moulded takeout, tidy) but cost many times the DIY
  rod and aren't necessary.

### 4.6 Assembly — the sequence

Follow the project's photo-by-photo guide
([assembling mb2024 + MUX 2024 + DPH5005](https://ohmpi.org/source_rst/hardware/assemble_ohmpi/assembling_mb2024_MUX_2024_dph5005.html))
alongside these stages:

1. **Fab or buy the boards.** Upload the `gerbers/` zips to JLCPCB/PCBWay (§4.4). While they ship,
   flash Raspberry Pi OS and get the Pi on your network.
2. **Populate the measurement board** — solder the through-hole parts and headers; plug in the ADS1115
   breakout and the Current-Sense Click module; fit the polarity relays. Work methodically; check each
   joint.
3. **Populate the MUX boards** — the repetitive part: ~16 relays per board × 4 boards, plus the MCP
   I/O expander and screw terminals/IDC headers. **~2–4 hours per board.** Do one, test it, then batch
   the rest.
4. **Set the DPH5005** — flash/configure it; **change its default serial baud from 9600 to 19200**
   (OhmPi drives it over Modbus at 19200 — a known gotcha), fit its case and the USB link to the Pi.
5. **Wire the stack** — measurement board ↔ MUX boards over I²C (SDA/SCL) with each MUX at its
   configured I²C address; DPH5005 → measurement board; 12 V battery in. Mount it all in the enclosure
   with the electrode screw terminals accessible.
6. **Install the software** — `git clone https://gitlab.com/ohmpi/ohmpi.git`, run `./install.sh`, then
   `python setup_config.py` and pick the matching config (e.g.
   `config_mb_2024_0_2__4_mux_2024_2roles_dph5005.py`).

### 4.7 First power-on — smoke test

1. **Before applying 12 V**, re-check for solder bridges and correct relay orientation with the
   multimeter (continuity). This is where a five-minute check saves a fried board.
2. **Power the Pi, enable I²C** (`raspi-config`), then run `i2cdetect -y 1`. **Every board must appear
   at its expected I²C address** (the measurement board's MCP, each MUX's expander). A missing address
   = a wiring/solder fault on that board — fix before going further.
3. **Bring up the web GUI** (`./run_http_interface.sh`, browse to `http://localhost:8000`). It should
   load and show the controls.
4. **First live test — the two-resistor bench check (§4.8)**, *not* a paddock. Prove it reads a known
   resistor correctly before it ever touches dirt.

### 4.8 Calibration against known resistors — the cheap confidence check

You don't need a lab; you need a handful of **precision resistors** (1%, e.g. 100 Ω, 1 kΩ, 10 kΩ).

- **Wire a known resistor across a quadrupole** (in place of the ground) and take a reading. The
  instrument should report a transfer resistance R equal to the resistor's value, within a percent or
  two. Step through several values to confirm it's linear across the range.
- **A resistor network** (a "resistor board" — a ladder of known resistances mimicking a layered
  earth) is the classic ERT bench phantom: run your full sequence into it and invert the result; you
  should recover the known "layers." This proves the *whole chain* — hardware, sequence, and inversion
  — before you trust a field section.
- **Log the calibration** so you can re-check after any repair. This resistor check is also your first
  troubleshooting tool whenever a field survey looks wrong (§4.9).

### 4.9 Failure modes & debugging

| Symptom | Likely cause | Fix |
|---|---|---|
| A board missing from `i2cdetect` | Solder bridge / cold joint / wrong I²C address / cable | Reflow suspect joints; check the address in `config.py`; check ribbon. |
| All readings noisy / zero current | Can't inject — high contact resistance (dry ground) or a broken A/B path | Water/salt the electrodes, run the **Rc check** (§6.5), verify the DPH5005 is outputting. |
| One electrode always bad | Dead takeout conductor, corroded clip, or that MUX relay | Swap the clip; multimeter the conductor end-to-end; test the relay. |
| Readings offset / drifting | Copper electrode polarisation, or DPH5005 baud still 9600 | Use stainless; confirm DPH baud = 19200. |
| Inversion won't converge (RMS >15%) | Noisy data / bad electrodes / wrong geometry in the file | Filter bad quadrupoles, re-check electrode positions, re-run with more stacks. |
| DPH5005 not responding | Default 9600 baud, or wrong USB port | Set baud 19200; check the serial device path. |

**Where to get unstuck:** the **OhmPi Discord** ([discord.gg/2SCKQZBzXh](https://discord.gg/2SCKQZBzXh))
and **GitLab work-items/issues** — the maintainers and other builders answer there (§9).

---

## §5. Software stack — turning readings into an image

**The recommendation in one line:** install **ResIPy** to get your first pictures (a click-driven
GUI — no code, no geophysics degree), and **graduate to PyGIMLi** when you want repeatable, scripted
surveys. OhmPi feeds both natively, so **there is no converter to write.** Everything here is
open-source and free; the only paid tool (Res2DINV) is named only so you recognise it when a
contractor uses it.

### 5.1 ResIPy — start here

- **What it is:** an intuitive open-source **GUI + Python API** for 2-D/3-D DC-resistivity *and* IP
  inversion and forward modelling. It handles import, filtering, error modelling, mesh generation,
  inversion and plotting — the whole chain, by pointing and clicking.
- **Current version:** **3.6.6** (released 26 Nov 2025 —
  [PyPI](https://pypi.org/project/resipy/)). Canonical repo is GitLab
  [gitlab.com/hkex/resipy](https://gitlab.com/hkex/resipy); GitHub
  [hkexgroup/resipy](https://github.com/hkexgroup/resipy) is a mirror. Docs: [resipy.org](https://resipy.org/).
- **Under the hood:** it's a friendly shell around **Andrew Binley's R2 / cR2 / R3t / cR3t** codes
  (R2/R3t = DC 2-D/3-D; cR2/cR3t = complex/IP) — the long-established academic inversion engines.
- **Citation:** Blanchy, G.; Saneiyan, S.; Boyd, J.; McLachlan, P.; Binley, A. (2020). *"ResIPy, an
  intuitive open source software for complex geoelectrical inversion/modeling."* **Computers &
  Geosciences 137, 104423.** DOI:
  [10.1016/j.cageo.2020.104423](https://doi.org/10.1016/j.cageo.2020.104423) (open-access author copy:
  [Lancaster EPrints 141169](https://eprints.lancs.ac.uk/id/eprint/141169/)). (Note: Guillaume Blanchy
  is also an OhmPi author — the tools are built by overlapping people to work together.)
- **The one macOS gotcha — read this before you install.** The GUI runs on Mac, but the R2-family
  inversion engines are **Windows `.exe` files**, so ResIPy runs them through **Wine**. On
  **Apple-Silicon** Macs, Wine is x86-64 and therefore runs **under Rosetta 2** — it works, but it's a
  translation-on-emulation stack, and it's the slowest layer. Practical notes: install Wine +
  XQuartz first (`brew install xquartz` then `brew install --no-quarantine wine-stable`); if macOS
  flags the app "damaged," clear quarantine with `xattr -cr /Applications/ResIPy.app`. There is **no
  native arm64 engine** — this is the price of the friendly GUI.

### 5.2 PyGIMLi — graduate to this

- **What it is:** **pyGIMLi** (Geophysical Inversion and Modelling Library) — a mature open-source
  **Python library** for forward modelling and inversion across methods. Not a GUI; you write scripts.
- **Current version:** **1.6.0** (~May 2026, [PyPI](https://pypi.org/project/pygimli/); requires
  Python ≥3.10). Site [pygimli.org](https://www.pygimli.org/); repo
  [github.com/gimli-org/pyGIMLi](https://github.com/gimli-org/pyGIMLi).
- **Why bother, once you have ResIPy:** total control — custom meshes, forward modelling, **joint
  inversion** (ERT + seismic refraction + more), region/constraint control, and above all **scripting
  a repeatable pipeline**: ingest `measure.csv`, invert with *fixed* parameters, emit a comparable
  section every time — no clicking, diffable, version-controllable. That's what you want once you're
  re-running the *same* claim survey each winter.
- **Citation:** Rücker, C.; Günther, T.; Wagner, F.M. (2017). *"pyGIMLi: An open-source library for
  modelling and inversion in geophysics."* **Computers & Geosciences 109, 106–123.** DOI:
  [10.1016/j.cageo.2017.07.011](https://doi.org/10.1016/j.cageo.2017.07.011).
- **macOS install:** via conda/mamba — `conda create -n pg -c gimli -c conda-forge "pygimli>=1.6.0"`.
  Use **miniforge/mambaforge** (arm64-native) rather than base Anaconda. **Apple-Silicon caveat:** the
  3-D meshing dependency (`tetgen`) historically lagged on arm64, so *3-D* solves could fail on older
  pins; **2-D ERT — what you'll do 95% of the time — is fine** on current 1.6.0 builds, and it's
  native (no Wine).

### 5.3 Honest ResIPy vs PyGIMLi, for Steven

| | **ResIPy** | **PyGIMLi** |
|---|---|---|
| Interface | **GUI** (click) + API | Python library only |
| Learning curve | **Gentle — your day-one tool** | Real curve; needs Python + some jargon |
| Best for | First images, filtering, "what's down there?" | Repeatable scripted surveys, full control |
| macOS reality | Inversion runs on **Wine → Rosetta 2** (extra moving parts, slowest) | **Native arm64**, no Wine |
| Rough edge | GUI docs lag the code; Wine can break on macOS upgrades | No GUI; 3-D can fight arm64 |

**Start with ResIPy** (OhmPi even has a `run_inversion()` that calls it directly). **Add PyGIMLi**
when you outgrow the presets and want a script. You don't have to choose — keep ResIPy in a pip venv
and PyGIMLi in its own conda env; don't mix them.

### 5.4 Skip these (but know what they are)

- **BERT / pyBERT** — the older geoelectric package by the PyGIMLi authors; **folded into PyGIMLi's
  `ert` module.** Its docs literally say "for simple ERT inversion you don't need BERT anymore." Its
  only lasting legacy is the **`.ohm` unified data format**, which PyGIMLi reads/writes natively. Use
  PyGIMLi.
- **Res2DINV / RES2DINVx64** — the classic **commercial** 2-D ERT+IP standard (M.H. Loke, now Aarhus
  GeoSoftware: [aarhusgeosoftware.dk/res2dinv](https://www.aarhusgeosoftware.dk/res2dinv)). Paid,
  Windows-only. You won't buy it — but it's what most **rental/contractor** rigs output to, and its
  **`.dat` "general array" format is the lingua franca** of ERT (ResIPy and PyGIMLi both read it), so
  it's your bridge if you ever exchange data with a contractor. *(A limited demo has historically
  circulated but I could not confirm a current official free trial on the Aarhus page — treat as
  commercial-only.)*

### 5.5 Data formats — the OhmPi → inversion path (no converter needed)

This is the interoperability win, and it's better than expected:

- **OhmPi output:** measurements land in **`measure.csv`** — columns for the quadrupole **A, B, M, N**
  and **R** (transfer resistance, Ω). Sequences are read from a plain `A B M N` text file.
- **OhmPi exports natively.** Its software has a built-in `export(ftype=...)`:
  - `ftype='bert'` or `'pygimli'` → the **`.ohm`** unified format → straight into `pygimli.physics.ert`.
  - `ftype='protocol'` → the **ResIPy/R2 ProtocolFile** → straight into ResIPy.
  - `ftype='ohmpi'` → native.
  There's even a **`run_inversion()`** that calls ResIPy from OhmPi. **So the documented path is:
  OhmPi `export()` → `.ohm` for PyGIMLi, or Protocol for ResIPy. No custom code.**
- **If you ever need a manual bridge**, ResIPy's **Custom Parser** tab eats an arbitrary columnar CSV
  (i.e. raw `measure.csv`), and the **Res2DInv `.dat` general-array** format is read by everything.
  (OhmPi API/formats: [ohmpi.org/…/api.html](https://ohmpi.org/source_rst/software/api.html); OhmPi
  paper on HAL: [hal.inrae.fr/hal-02910097](https://hal.inrae.fr/hal-02910097).)

### 5.6 Visualisation

- **2-D pseudosections + inverted sections:** built into both via **matplotlib** (ResIPy
  `showPseudo()`, `showResults()`; PyGIMLi `pg.show()` / the `ert` manager's `showResult()`). Export
  PNG/PDF/SVG.
- **3-D → ParaView:** both export mesh + values to **`.vtk`**; open in **[ParaView](https://www.paraview.org/)**
  (free) for a rotatable 3-D resistivity volume. PyGIMLi also has an inline **PyVista** 3-D viewer for
  quick looks without leaving Python.

### 5.7 Version-pinned macOS install recipe

```bash
# ── Prereqs (Apple Silicon: run natively arm64) ─────────────────────────
# Homebrew (if not present):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# On Apple Silicon, ensure Rosetta 2 is present (Wine below is x86-64):
softwareupdate --install-rosetta --agree-to-license

# ── ResIPy: GUI + engine (your first images) ────────────────────────────
brew install xquartz
brew install --no-quarantine wine-stable          # R2 engine is a Windows .exe
# Easiest: download the ResIPy 3.6.6 macOS .dmg from the GitLab Releases tab
#   https://gitlab.com/hkex/resipy  → drag ResIPy.app to /Applications
#   if macOS says "damaged":  xattr -cr /Applications/ResIPy.app
# Or via pip (Python API + can launch the GUI from source):
python3 -m pip install "resipy==3.6.6"

# ── PyGIMLi: scripted inversion (own conda env; native arm64) ───────────
# Install miniforge (arm64-native conda) if you don't have conda, then:
conda create -n pg -c gimli -c conda-forge "pygimli>=1.6.0"
conda activate pg
python -c "import pygimli as pg; print(pg.__version__)"   # expect 1.6.x

# ── 3-D viewing (optional) ──────────────────────────────────────────────
brew install --cask paraview                       # opens .vtk exports
```

Keep ResIPy (pip venv) and PyGIMLi (conda env) separate. On Apple Silicon, ResIPy inversions run
x86-64-Wine-under-Rosetta (fine, just not native); PyGIMLi runs native arm64.

---

## §6. Field operation — from pegging out to a finished image

This is the part that actually matters: the electronics are a means to this end. A single ERT line,
start to finish, is roughly: **peg out → prepare electrodes → roll out cable and connect →
contact-resistance check (go/no-go) → run the sequence → save and back up → invert on the laptop →
read the image → dig to confirm.** Budget a **half to full day per line** for your first few; an hour
once you're practised.

### 6.1 Site selection

Pick first lines where you already know the answer, so the picture can be checked against truth:
- A spot where you've **already dug** and know the depth-to-clay (Opalton) or depth-to-rock (BSF).
  That dig is your calibration and your confidence-builder.
- Ground with a **real contrast to find** — a known clay pocket, a creek flat against a granite rise.
  If the first survey is over dead-flat uniform ground, you learn nothing about whether it works.
- **Away from buried services and steel** (fences, pipes, buried cable) — they corrupt the data and
  are a safety issue (§11.5). Run Before You Dig first.

### 6.2 Array layout — pegging out the electrodes

- **Decide spacing and length from the target depth (§1.6).** Depth-of-investigation ≈ 15–25% of the
  total line length. To see ~8 m, lay ~40–60 m of line. At 1 m spacing that's 40–64 electrodes; a
  32-electrode line at 1 m is 31 m long and reaches ~6–8 m; at 2 m spacing it's 62 m and reaches
  ~12–15 m but at coarser (2 m) resolution. **1 m spacing is the right default** for both the Opalton
  clay basement and BSF deco — metre-scale resolution to ~8 m.
- **Run a tape down the line and peg every electrode position** — accuracy matters, because the
  inversion assumes the geometry you tell it. A crooked line or a mis-measured gap smears the image.
  Use a string line for straightness on longer spreads.
- **Orientation:** run lines **perpendicular to the structure you're mapping** — across a suspected
  clay-low or across the fault, not along it — so the section cuts the feature. For reconnaissance,
  run a **grid** of parallel lines (5–10 m apart) plus one or two orthogonal ties.
- **Mark the line ends with GPS** so you can re-occupy the exact line next season (for monitoring) and
  place the section on the AuraOpal map.

### 6.3 Ground preparation — the make-or-break step in dry ground

This is where dry, resistive ground (Opalton sand, BSF granite in a dry winter) either cooperates or
fights you. The whole game is **getting current into the earth**; a bad electrode contact starves the
reading.

- **Drive each electrode 10–20 cm in**, firm and vertical. Deeper contact = lower contact resistance.
- **Water the electrodes.** Pour a cup of water — better, **salty water** — around each stake and let
  it soak. This is the single most effective fix for dry ground and is standard practice, not a hack.
  Carry a jerry can and a bucket.
- **Bentonite mud** around a stubborn electrode lowers contact resistance further (a fistful of
  drilling/pottery bentonite mixed to a paste). Useful on the worst rocky/sandy contacts.
- **Avoid roots, rock and loose fill** at the electrode position — nudge the peg 10–20 cm to find
  soil, and record the offset if it's significant.
- **Clean the electrode-to-clip contact** — corrosion on a stainless stake or a dirty alligator clip
  adds resistance right where you can least afford it.

### 6.4 Cable roll-out and connection

- Roll the takeout cable along the pegged line; clip or screw each electrode's wire to its stake in
  order (electrode 1 at one end → electrode N at the other). **Label or colour-code** so you never
  cross two — a swapped pair produces nonsense that's hard to spot later.
- Keep the cable off sharp rock; a nicked conductor shorts to ground and kills that electrode.
- Connect the takeout to the OhmPi's screw terminals / IDC headers per your `config.py` electrode
  numbering. Double-check electrode 1 is where the software thinks electrode 1 is.

### 6.5 Contact-resistance check — the go/no-go before you spend an hour

**Do not run a survey until you've checked contact resistance.** OhmPi's web GUI has a built-in
**contact-resistance (Rc) test** that measures every electrode and flags the bad ones. This is your
five-minute go/no-go:

- **Aim for contact resistance in the low kΩ or less.** A few hundred Ω to a few kΩ is healthy. **Tens
  of kΩ** is marginal; **hundreds of kΩ or "open"** means that electrode isn't really connected — the
  reading through it will be noise.
- **Fix the bad ones before proceeding:** re-water, drive deeper, add bentonite, re-seat the clip, or
  move the peg. Re-run the check. It's far cheaper to fix now than to discover a dead electrode after
  the inversion looks wrong.
- High contact resistance *everywhere* = the whole ground is too dry → water the entire line, or
  accept you need more injection voltage (the DPH5005 lets you push harder). This is exactly the
  Opalton dry-sand risk the decision doc flagged — the mitigation is water + patience, and the Rc
  check tells you whether it worked.

### 6.6 Running the survey

- **Load the sequence** — OhmPi ships ready-made Wenner sequences (`wenner1-16.txt` …
  `wenner49-64.txt`) and dipole-dipole files in `sequences/`. Start with a **Wenner** run (robust,
  noise-tolerant — best for dry ground and a first survey), then add a **dipole-dipole** or
  **Wenner-Schlumberger** run over the same layout when you want lateral detail (§1.5).
- **Set acquisition parameters** (`settings/*.json`): pulse time (start ~0.5–1 s), number of **stacks**
  (repeats to average — 3–4 is a good start; more = cleaner but slower), and let it flip polarity
  automatically.
- **Press go and let it cycle.** The multiplexer steps through every quadrupole. **Timing:** each
  reading is a few seconds (pulse × stacks × polarity flips). A full Wenner set on 32 electrodes is a
  few hundred readings → **~15–40 minutes**; a 64-electrode line with Wenner + dipole-dipole can be
  **1–3 hours**. Single-channel (OhmPi) does one quadrupole at a time, so more electrodes/arrays =
  proportionally longer. Watch the **live pseudosection** in the web GUI — the first sanity check that
  the data is sane (smooth, not wildly scattered).
- **Keep clear of the electrodes while it's injecting** (§11.3) — up to ~50–80 V pulses.

### 6.7 Data logging and safe transfer

- OhmPi writes results to **`measure.csv`** (A, B, M, N, R) on the Pi; full-waveform data can go to a
  separate CSV.
- **Back it up immediately** — copy off the Pi to a laptop (scp/USB, or the web GUI's `download_data`).
  One copy on the Pi in the field is one copy too few.
- **Log metadata by hand too:** line ID, GPS ends, spacing, array(s) run, date, ground moisture, and
  any electrodes you had to move or that read badly. Six months later this is what makes the data
  interpretable.

### 6.8 Inversion workflow — ResIPy, step by step

The concrete first-image path on the Mac (install: §5.7):

1. **Export from OhmPi** — `export(ftype='protocol')` writes a ResIPy ProtocolFile directly (or
   `ftype='bert'` for a PyGIMLi `.ohm` file). **No converter to write.**
2. **Open ResIPy**, start a new 2-D project, set electrode spacing/geometry (it can read the layout
   from the file).
3. **Import the data** (Protocol/Syscal/Res2DInv read natively; hand-rolled CSV → Custom Parser tab).
4. **Filter/clean** — drop obviously bad readings (negative apparent resistivities, wild outliers,
   readings from Rc-flagged electrodes). Use reciprocal-error filtering if you collected reciprocals.
5. **Build the mesh** (triangular; accept defaults to start).
6. **Fit an error model** (linear/power-law) — tells the inversion how much to trust the data.
7. **Invert.** It runs Binley's R2 engine (on Mac via Wine → Rosetta 2). Watch the **RMS misfit** fall.
   **Target: a few percent.** If it won't get below ~10–15%, your data is noisy — filter harder or
   accept a coarser model; **don't force it.**
8. **View the section** — inverted resistivity, Ω·m vs depth/distance, hot = resistive, cool =
   conductive. Export PNG/PDF; export `.vtk` for 3-D in ParaView if you ran a grid.

### 6.9 Reading the image — and a resistivity cheat-sheet

**What the colours mean on Steven's ground:**
- **A conductive clay pod / clay basement** = a **cool (low-Ω·m) blob or basal band.** At Opalton the
  clay floor is the low-resistivity base; its **low points** (dips in that cool band) are the pools
  that grow thick opal — *the whole target of the survey*. At BSF a clay pocket is a cool lens inside
  warmer deco.
- **A deco → fresh-rock contact (BSF)** = **cooler up top** (weathered, moister, some clay)
  transitioning to **hot below** (fresh, dry granite). The depth where it turns hot is your
  depth-to-rock — the number that matters before the dozer.
- **Dry sand / overburden (Opalton)** = **hot (high-Ω·m)** near-surface; **ironstone** reads as an
  **intermediate** band between the hot sand and the cool clay.
- **Noise / artefacts to distrust:** exaggerated colour at the **line ends and bottom corners** (edge
  effects — least data there, so ignore the outer ~15% and the deepest fringe); **"pant-leg" streaks**
  dipping from a near-surface object (a dipole-dipole signature — not real dipping layers); and
  **smooth vertical smearing** (the inversion's smoothness assumption blurring a sharp boundary). A
  high RMS misfit (>10–15%) means treat the whole image with suspicion.
- **Absolute values are a guide, not gospel** — an uncalibrated section gets the *pattern* right
  (conductive vs resistive) more reliably than the exact Ω·m. Hence ground truth (§6.10).

**Resistivity cheat-sheet** — indicative ranges compiled from **Palacky, G.J. (1988),
*"Resistivity characteristics of geologic targets,"* in Nabighian (ed.), *Electromagnetic Methods in
Applied Geophysics, Vol. 1*, SEG, pp. 53–129** (the origin of nearly every such chart; reproduced with
a reusable figure at SDSU's [Earth Electromagnetic Properties](https://emgeo.sdsu.edu/emrockprop.html)
page). Ranges span orders of magnitude and overlap — treat as indicative, not diagnostic:

| Material | Approx. resistivity (Ω·m) | Reads as |
|---|---|---|
| Clay / clay-rich soil | ~1–100 (often 1–20) | **cold** (the target) |
| Groundwater (fresh) | ~10–100 | cold |
| Saturated sand & gravel / alluvium | ~10–800 | cool–mid |
| Shale / mudstone | ~20–2,000 | mid |
| Weathered / altered granite ("deco") | ~100–1,000s | cool–mid |
| Sandstone (wet → dry) | ~1 – 10⁸ (very wide) | mid–hot |
| Ironstone / silicified sandstone (Opalton) | intermediate–resistive | mid–hot |
| Fresh (unweathered) granite / basement | ~5,000 – 10⁶+ | **hot** |

The method works on Steven's ground precisely because the **target (clay, ~1–100 Ω·m) sits at the
opposite end of the scale from the host (ironstone/fresh basement, thousands+)** — a huge contrast,
which is exactly what ERT resolves best.

### 6.10 Ground-truth verification — the step that makes it real

**Dig (or bore) where the image predicts a feature, and confirm.** Non-negotiable, and it's the payoff:
- Tie your first line **across a known dig** so you can match a colour to a known depth-to-clay/rock —
  that pins the resistivity scale for every other line.
- When a line predicts a clay low at, say, 4 m at a certain position, **dig there** and check. A hit
  builds trust; a miss teaches you how *your* ground reads (maybe the "clay" was a moisture zone).
- Log every ground-truth check against the section. After a handful you'll read the images with real
  confidence — which is the whole reason to prove it on the farm first (§7).

---

## §7. Steven's use cases — worked survey plans

Four concrete jobs, in the order to do them: **prove it on the farm, then take it to Opalton.**

### 7.1 BSF deco mapping — the first proving ground

**Why here first.** Banksia Springs sits on the New England Batholith — Ruby Creek Granite /
Stanthorpe Adamellite, with traprock belts. The weathering profile is a **textbook-perfect ERT
target**: conductive **weathered granite ("deco" — decomposed granite, clay-rich, moist) over
resistive fresh granite**. That contrast is *larger and cleaner* than Opalton's, so it's the ideal
place to learn to trust the instrument and your inversions — and it has real farm value: **depth-to-
rock is exactly what an earthmoving operator wants to know before the dozer goes in** (rippability,
dam sites, foundations, trenching).

- **Target:** map depth-to-fresh-granite and any clay/deco thickness variation across a paddock.
- **Where:** pick a paddock with visible variation — a granite outcrop ridge running into a lower,
  loamier flat (the farm has exactly this: outcrop ridges vs alluvial flats). Run the line **from the
  outcrop down the slope into the flat**, perpendicular to the slope contours, so the section shows
  the rock surface diving under deepening deco.
- **Array:** 32-electrode Wenner at **1 m spacing** (31 m line, ~6–8 m depth) for the first go; step
  to 2 m spacing (62 m, ~12–15 m) if the rock is deeper than 8 m. Add a dipole-dipole pass for the
  lateral detail of the rock surface.
- **Expected resistivities:** moist deco/weathered granite ~**100–1,000 Ω·m** (cooler); fresh granite
  **>5,000 Ω·m** (hot). The boundary should be obvious — a clear hot floor rising to the outcrop.
- **Ground truth:** you already dig and rip this country — tie a line across a **cut or dam bank**
  where you know the rock depth, and confirm. Fast, free calibration.
- **Success = the section shows the rock surface where you know it is.** Once it does, you trust the
  tool. That's the deliverable of the whole farm phase.

### 7.2 BSF clay mapping — white clay and other pockets

The Granite Belt weathering profile drops **clay pockets** (kaolinite from feldspar breakdown —
"white clay") in the lower profile and along the traprock. These read **strongly conductive** (clay +
held water, ~1–100 Ω·m) against the resistive granite — an even easier ERT target than the deco
contact.

- **Target:** locate and map clay pockets — useful for **dam sealing** (a clay lens is free liner
  material) and for understanding paddock drainage/waterlogging.
- **Array:** same 32-electrode 1 m Wenner + dipole-dipole. Clay pods show as **discrete cool blobs**;
  the dipole-dipole pass resolves their edges.
- **This is directly analogous to the Opalton false-clay-pocket problem.** Learning to recognise a
  conductive clay blob in a BSF section is exactly the skill you'll use to read the Opalton clay
  basement. **BSF is the rehearsal; Opalton is the performance.**

### 7.3 Water-bore siting at BSF — the bonus application

On the Granite Belt, groundwater sits in **fractured and weathered granite** — the deeper,
more-weathered zones and fracture/fault traces hold water, while massive fresh granite is dry. ERT is
a classic, proven bore-siting tool for exactly this hard-rock setting.

- **Target:** find a deep weathered/fractured zone (a "cool" low-resistivity trough reaching down) to
  site a bore, rather than drilling blind into dry massive granite.
- **Array:** longer/deeper — 64 electrodes at 2 m (126 m line, ~20–30 m depth) to reach realistic bore
  depths; Wenner-Schlumberger for the depth reach. Run **2–3 parallel lines** across the suspected
  fracture trend to confirm it's continuous, not a one-line fluke.
- **Read it:** a **vertical or dipping low-resistivity zone** cutting down through the resistive
  granite = a weathered/fractured (water-bearing) zone = a bore target. Drill the deepest, most
  continuous low.
- **Value:** a dry bore is thousands wasted; ERT-sited bores materially lift the hit rate on hard
  rock. **This application alone can pay for the whole build.**

### 7.4 Opalton clay-basement mapping — the main event

Everything above is training for this. Per the genesis insight (decision doc), the prize at Opalton is
the **topography of the clay basement** — its low points are the pools that grew the thick opal — plus
the ironstone package immediately above them. **ERT reads that contour directly.**

- **Target:** map the clay-basement surface (basal *and* productive false/intermediate clay layers)
  across the prospective ground, and find the local lows.
- **Where to start:** the **~40×40 m gem box west of the fault** (Aug-2025 ground truth) and its
  margins, and the **main-patch cluster mid-claim (~142.7346°E, −23.7470°S, ~258 m)**. Don't try to
  cover 15 ha in one hit — map the known-prospective boxes first.
- **Array & spacing:** 48–64 electrodes at **1 m** (47–63 m line, ~8–12 m depth, metre resolution) —
  reaches the 0.3 m → 4 m → 8 m opal window and resolves the ironstone/clay boundary. Run **Wenner**
  for the robust basement pick, then **dipole-dipole** for the lateral shape of the lows and the fault.
- **Orientation — the fault question:** run the primary lines **perpendicular to the fault trend** so
  each section cuts *across* the fault and the basement lows, showing their shape and any offset. Then
  a few **tie lines parallel to the fault** to correlate lows between sections. (Running only parallel
  to the fault would hide the very cross-structure you're mapping.)
- **Grid & duration:** a reconnaissance grid of parallel lines ~5–10 m apart over a ~50×50 m box is
  ~6–10 lines. At ~1–2 hours per line (64-el, two arrays) plus layout, that's **~3–5 field days** for a
  proper box — very doable in one winter window, and re-runnable as you open new ground. A full 15 ha
  would be weeks of lines; **don't — survey the prospective boxes, not the paddock.**
- **Ground truth:** tie lines across existing trenches/digs with known depth-to-clay to calibrate the
  resistivity scale, then dig the mapped lows to confirm. The decision doc's winning workflow: **ERT
  maps the pools → optional hired GPR characterises the ironstone above them.**
- **Contact resistance is the risk here** (dry Opalton sand). Carry water, salt and bentonite; run the
  Rc check religiously; use the DPH5005's higher injection voltage. This is precisely why you proved
  the water-the-electrodes workflow at BSF first.

---

## §8. Time and cost budget — realistic

### 8.1 Total build cost (AUD, itemised)

| Item | 32-electrode | 64-electrode |
|---|---|---|
| Core electronics (Pi, ADS1115, DPH5005, MCP×n, INA282) | ~$347 | ~$660 |
| Relays (Omron G5LE ×64 / ×128) | ~$165 | ~$330 |
| PCBs (JLCPCB, landed, duty-free) | ~$35 | ~$60 |
| Electrodes (316L stainless) | ~$39 | ~$78 |
| **Cable (the swing factor)** | ~$130–335 | ~$300–1,290 |
| Connectors + enclosure + 12 V battery | ~$85 | ~$100 |
| **Build subtotal** | **≈ $765–970** | **≈ $1,200–2,200** |
| Tools if starting from zero (iron + multimeter) | +~$130 | +~$130 |
| Software (ResIPy + PyGIMLi + ParaView) | **$0** | **$0** |

**The honest headline: a working, reusable 32-electrode ERT instrument for well under A$1,000 in
parts** (most tradies already own the tools) — versus ~$40k for the commercial equivalent it maps the
same structure as. Scale to 64 for the deepest Opalton/bore lines when you're ready; **cable is the
line item that moves the total**, so wire it with discipline (§4.4).

### 8.2 Total build time (hours — honest)

| Phase | Hours | Notes |
|---|---|---|
| Sourcing + pricing the BOM off the repo iBOMs | 3–6 | The "no costed BOM" tax (§2.8). |
| Fab wait (PCBs) | — | ~1–2 weeks elapsed, not hands-on. |
| Soldering the MUX boards (~2–4 h × 4) | 8–16 | The repetitive core. |
| Measurement board + DPH5005 + wiring the stack | 6–12 | |
| Software install + config + `i2cdetect` debugging | 4–10 | Linux/I²C fiddling is normal. |
| Smoke test + resistor calibration | 2–4 | |
| Contingency (a board won't enumerate, a cold joint) | 10–20 | Budget it; you'll use some. |
| **Total first build** | **≈ 40–70 hours** | A "several weekends" project, not an afternoon. |

### 8.3 Software learning curve

- **To a first successful inversion:** download ResIPy, run its **example datasets**, invert a sample
  line — **~a few evenings (5–15 hours)** to go from install to reading your own first section with
  confidence. The GUI does the heavy lifting; the learning is *interpretation*, not software.
- **To scripted PyGIMLi surveys:** another **~15–30 hours** of Python if/when you want repeatability.
  Optional, and later.
- **Do this before the hardware is finished** — it's free and it's the real skill wall (§12).

### 8.4 Decision → first useful farm survey (weeks)

Realistic elapsed time, working evenings/weekends: **~4–8 weeks.** Parts + PCB shipping (~2 weeks) runs
in parallel with learning ResIPy; the build is a few weekends; the first BSF deco line and its
ground-truth check is one more. By the end you have a proven instrument and a section you *trust*.

### 8.5 First farm survey → Opalton-ready (months)

**A few months of occasional weekends** — comfortably inside the ~1-year runway to the winter-2027
trip. The path: nail the BSF deco line (§7.1) → map a clay pocket (§7.2) → practise the dry-ground
contact-resistance workflow (water/salt/bentonite) so it's second nature before the remote,
one-shot Opalton window → optionally scale to 64 electrodes → arrive at Opalton already fluent. **The
farm phase isn't a detour; it's what converts a box of electronics into a tool you can rely on 3 hours
from Winton with no one to call.**

---

## §9. Community & support — where to get unstuck

You will get stuck — a board that won't enumerate, an inversion that won't converge, a section you
can't read. Here's the verified directory (all links confirmed to resolve, July 2026), in the order
you'll reach for them.

### 9.1 The DIY builder's home base — OhmPi

- **OhmPi Discord** — [discord.gg/2SCKQZBzXh](https://discord.gg/2SCKQZBzXh) — the single best place;
  the maintainers and other builders are active here. Published in OhmPi's own README.
- **OhmPi GitLab issues** — [gitlab.com/ohmpi/ohmpi/-/work_items](https://gitlab.com/ohmpi/ohmpi/-/work_items)
  (⚠ the old `/-/issues` path 404s — use `/-/work_items`). Repo: [gitlab.com/ohmpi/ohmpi](https://gitlab.com/ohmpi/ohmpi) ·
  Docs: [ohmpi.org](https://ohmpi.org/).

### 9.2 Inversion software support

- **ResIPy** — issues at [gitlab.com/hkex/resipy/-/issues](https://gitlab.com/hkex/resipy/-/issues);
  docs [resipy.org](https://resipy.org/). Your first-images tool (§5).
- **PyGIMLi** — **GitHub Discussions** [github.com/gimli-org/gimli/discussions](https://github.com/gimli-org/gimli/discussions)
  (active Q&A, lots of ERT-inversion threads).
- **SimPEG** — Discourse forum [simpeg.discourse.group](https://simpeg.discourse.group/) (a DC & IP
  category) — the largest open-geophysics community, if you go deep on inversion.

### 9.3 Australian geophysics community — ASEG

The **Australian Society of Exploration Geophysicists** is **hobbyist-accessible** and still
independent (not merged into AusIMM/AIG):
- **Associate membership** — the hobbyist route ("an active interest in the field") — **A$195/yr**
  ([aseg.org.au/membership/join-us](https://www.aseg.org.au/membership/join-us/)). **Student membership
  is free.**
- Nearest thing to a near-surface interest group is its **Environmental & Engineering Geophysics**
  conference stream (AEGC / DISCOVER — [asegdiscover.com.au](https://asegdiscover.com.au/)). No
  standing hobbyist near-surface committee exists.
- Worth it once you want to meet actual practising geophysicists in Australia; not essential to build
  and run the kit.

### 9.4 Q&A communities & videos

- **Earth Science Stack Exchange** — [earthscience.stackexchange.com](https://earthscience.stackexchange.com/)
  (geophysics tag has real resistivity questions).
- **r/geophysics** — [reddit.com/r/geophysics](https://www.reddit.com/r/geophysics/).
- **Real ERT videos (all confirmed to exist):**
  - EarthScope, *"ERT: Imaging Sub-Surface Structures"* — best "understand it first" explainer:
    [youtube.com/watch?v=hf9QUEWAzBQ](https://www.youtube.com/watch?v=hf9QUEWAzBQ)
  - EarthScope, *"How to: Electrical resistivity field setup"* — the physical layout, closest to what
    you'll do: [youtube.com/watch?v=_2Dp0dQUq_E](https://www.youtube.com/watch?v=_2Dp0dQUq_E)
  - Rick Jacobs, *"Soil Resistivity Survey with an AGI SuperSting R1/IP"* — a real end-to-end survey:
    [youtube.com/watch?v=XRJanTTgwoQ](https://www.youtube.com/watch?v=XRJanTTgwoQ)
  - Hydrogeology Project, *"Electrical Resistivity Imaging Survey Field Manual"* — method & gotchas:
    [youtube.com/watch?v=59uLmJBgiyA](https://www.youtube.com/watch?v=59uLmJBgiyA)
  - AGI, *"What is Electrical Resistivity Imaging (ERI)?"* — short vendor explainer of arrays:
    [youtube.com/watch?v=LO9ljx_U1XI](https://www.youtube.com/watch?v=LO9ljx_U1XI)

### 9.5 Read these first (books & the free tutorial)

- **M.H. Loke, *"Tutorial: 2-D and 3-D electrical imaging surveys"*** — **free, and the single best ERT
  primer written.** Download (updated Nov 2025):
  [geotomosoft.com/coursenotes.zip](https://www.geotomosoft.com/coursenotes.zip) (from
  [geotomosoft.com/downloads.php](https://www.geotomosoft.com/downloads.php)); a static older PDF
  mirror (handy on a phone): [Caltech GE111 copy](https://web.gps.caltech.edu/classes/ge111/Docs/ResNotes_Loke.pdf).
  **Start here.**
- **Reynolds, *An Introduction to Applied and Environmental Geophysics*, 2nd ed. (Wiley, 2011)** —
  friendliest broad textbook for a self-taught near-surface person; the one to buy. ISBN 978-0-471-48536-0
  ([Wiley](https://www.wiley.com/en-us/An+Introduction+to+Applied+and+Environmental+Geophysics%2C+2nd+Edition-p-9780471485360)).
- **Binley & Slater, *Resistivity and Induced Polarization* (Cambridge, 2020)** — the modern definitive
  ERT/IP monograph; deeper, exactly your method. ISBN 978-1-108-49274-4
  ([Cambridge](https://www.cambridge.org/core/books/resistivity-and-induced-polarization/A767136D8C584D3820D1A810381891ED)).
  (Andrew Binley wrote the R2 engine ResIPy runs — this is the book behind your software.)
- **Telford, Geldart & Sheriff, *Applied Geophysics*, 2nd ed. (Cambridge, 1990)** — the classic
  all-methods reference. ISBN 978-0-521-33938-4.

---

## §10. Extension paths — for when Steven wants more

Don't build any of these first. They're the "year two" moves once the 32/64-electrode 2-D rig is
proven.

### 10.1 Induced Polarisation (IP) — the most worthwhile add-on

**The current OhmPi v2024 already supports IP** — no new hardware. The software exposes it directly
(`create_sequence(opt_ip=True)` and full-waveform capture via `vab_square_wave()` /
[OhmPi API](https://ohmpi.org/source_rst/software/api.html)). IP measures **chargeability** — how much
the ground briefly "holds charge" after the current stops — which responds to **disseminated clay and
polarisable minerals** that plain resistivity can miss. For the Opalton clay-topography model that's
genuinely relevant: IP can help distinguish clay-rich zones that read similarly on resistivity alone.
*(Honesty note: the foundational 2020 HardwareX paper listed IP as future work; cite the current docs
for IP support, not the paper.)* **Worth turning on once you're fluent with plain resistivity.**

### 10.2 Time-lapse / monitoring — what OhmPi was partly built for

OhmPi was designed with **monitoring** in mind (low cost = you can leave one in the ground). Bury a
fixed electrode line, survey the same array repeatedly over weeks/seasons, and you watch **soil
moisture, a wetting front, or a clay layer change through time** — the resistivity *difference* between
surveys is the signal. Real published examples: the team's **EGU 2023 small-scale 3-D water-infiltration
monitoring panel** ([EGU23-13675](https://meetingorganizer.copernicus.org/EGU23/EGU23-13675.html)),
**EGU 2024 time-lapse acquisition optimisation** ([EGU24-12830](https://meetingorganizer.copernicus.org/EGU24/EGU24-12830.html)),
**3-D soil-moisture monitoring at a karst forest site**, and a broader
[landslide time-lapse ERT review (MDPI)](https://www.mdpi.com/2076-3417/12/3/1425). For BSF this could
mean **watching a paddock's moisture/clay behaviour across a season** — a genuine regen/water-management
tool, not just prospecting.

### 10.3 Bigger arrays — 128+ electrodes

OhmPi scales by adding MUX boards. One `mux.2024` board = 16 electrodes (2-role mode); 4 connect
directly to the measurement board = 32. To go bigger, a **TCA9548A I²C extension board** lets you hang
**up to 32 MUX boards = a 256-electrode system** (the tested practical ceiling;
[MUX 2024 docs](https://ohmpi.org/source_rst/hardware/mux/mux_2024.html)). So "128 electrodes" = 8 MUX
boards behind one I²C extender — well within limits. **The real constraint is I²C bus length** (how far
the control signals reach), not board count. More electrodes = longer lines / higher resolution, at
more cable, more soldering, and longer acquisitions — only worth it when a specific target demands it.

### 10.4 Multichannel acquisition — probably skip

OhmPi is **single-channel**: it measures one quadrupole at a time, so a big survey is slow (§6.6).
Commercial multi-channel meters read several M-N pairs at once — **faster, identical result.** There's
no real DIY multichannel path (the EGU 2023 dev work mentions multi-channel Vmn, but it's not a stock
build), and **for a hobbyist working his own ground at his own pace, speed isn't worth the complexity.**
Let the single channel cycle; go make a cup of tea.

### 10.5 3-D vs 2-D — when the grid is worth it

- **2-D** (one line → a vertical section) is cheaper, faster, and assumes the geology doesn't vary
  *across* the line. It's the right default and answers most of Steven's questions.
- **3-D** (a *grid* of electrodes, or several parallel/orthogonal 2-D lines inverted together → a true
  volume) is needed when the target is laterally complex or you need plan-view geometry — at much
  higher electrode count, layout effort, acquisition time and processing cost.
- **Rule:** start with **parallel 2-D lines** to map an area cheaply; escalate to true 3-D only when the
  2-D sections show strong cross-line variation, or when a target's shape (e.g. a clay palaeo-low
  pocket) genuinely needs 3-D to resolve. For a first Opalton box, a dense set of 2-D lines is the
  right call.

---

## §11. Regulatory & safety

Short version: **ERT is the low-regulation, low-hazard method — no RF licence, and the main risk is
respecting a ~50–80 V injection like any live circuit.** But do the buried-services check.

### 11.1 RF / spectrum licensing — none for ERT

**ERT needs no ACMA radiocommunications licence.** It conducts pulsed DC current into the ground through
electrodes — it is **not a radio transmitter** and radiates no RF, so the *Radiocommunications Act*
framework (licences, class licences, device emission standards) simply doesn't apply. This is the clean
contrast with GPR: **GPR *does* radiate RF and *is* regulated** — authorised under the ACMA
[Low Interference Potential Devices (LIPD) class licence](https://www.acma.gov.au/licences/low-interference-potential-devices-lipd-class-licence)
(no application, no fee, *if* the device meets the emission mask). **None of that touches ERT.** (No one
publishes a rule saying "ERT needs no licence" — the absence of regulation is the point; the reasoning
is that there's no RF emitter to regulate.)

### 11.2 Electrical safety — treat the injection with respect

- Australia's **Extra-Low-Voltage (ELV) ceiling is 50 V AC / 120 V ripple-free DC** (AS/NZS 3000;
  [reference](https://firewize.com.au/definition/extra-low-voltage)). The OhmPi measurement board is
  **rated to 200 V**, the stock DPH5005 injects **~50 V**, and dev builds reach **~80 V** — i.e. at or
  above the ELV line. **This is not guaranteed-safe extra-low voltage; treat it as a genuine shock
  hazard, not a toy.**
- **Touch/step voltage:** injecting current into resistive ground creates a **voltage gradient in the
  soil**, steepest right at the current (A/B) electrodes — and **dry, high-resistivity ground (Opalton)
  makes the gradient worse**
  ([step/touch fundamentals](https://eepower.com/technical-articles/the-basics-of-substation-grounding-step-touch-and-transferred-voltages-part-2-of-3/)).
- **Safe operating practice:** **never touch the electrodes or their leads while a sequence is
  running** — the injector pulses under software control, so keep hands off the whole array during
  acquisition. Connect/disconnect only when idle. Fuse the battery line, and treat the DPH5005 output
  as live.

### 11.3 Livestock & crops — very low risk

**Running an ERT survey through a paddock is low-risk to stock and crops.** The comparison settles it:
agricultural **electric-fence energisers put ~5,000–8,000 V pulses** onto wires in paddocks full of
cattle and sheep, safely and legally (short pulse, tiny current; AS/NZS 60335.2.76;
[reference](https://www.bigredfencing.com.au/what-are-electric-fence-volts-and-joules/)). OhmPi injects
at **~50–80 V and 0.1–50 mA through buried electrodes** — *far* lower voltage, tiny current, pulsed.
A grazing animal or a growing crop is at negligible risk. Sensible prudence (not a demonstrated hazard):
don't run sequences with animals standing on the electrode line, and flag/temporarily fence the array
while it's live.

### 11.4 Where NOT to survey — buried services (do this every time)

**Before pushing electrodes or digging, lodge a free enquiry with Before You Dig Australia (BYDA,
formerly Dial Before You Dig).** Free; online at [byda.com.au](https://www.byda.com.au/) or call
**1100**. It returns asset plans for **power, gas, water and telecoms** from the owners. Two reasons,
both real:
1. **Safety** — driving a steel electrode or a spade into a live power cable or a gas line is a serious
   hazard.
2. **Data corruption** — a buried metal service (pipe, cable, conduit, earth grid) is a huge
   conductivity anomaly that **distorts the inversion and fakes subsurface features.** Even where it's
   safe, **don't run lines over known buried metal** — steel fences, water pipes and reo included. On
   Steven's own lease and paddocks this is usually moot, but check near sheds, bores, pumps and
   fencelines.

---

## §12. One-page executive summary + decision tree

*If you read nothing else, read this.*

### The decisions, settled

| Question | Answer |
|---|---|
| **Build, buy, or hire?** | **Build.** A working reusable ERT rig is **<A$1,000 in parts** vs ~$40k commercial or ~$5–6k per rented survey — and Steven is a hands-on tradie with a soldering iron, a Raspberry Pi comfort level, and a 1-year runway. Building *is* the cheapest path *and* the one that leaves him with permanent, repairable capability and a real understanding of his ground. |
| **OhmPi or an alternative?** | **OhmPi**, decisively (§3). It's the only mature, multiplexed, peer-reviewed, community-backed open ERT *imager* that exists; parts are all AU-sourceable. The real alternatives (Brazilian Geo-Resistivity Meter, Vega meter) are honourable but thinly supported; everything else is software, a wrong-domain cousin, or a name that doesn't correspond to a real project. |
| **Which build?** | **OhmPi Lite v2024, 32 electrodes** (`mb.2024` + 4× `mux.2024` + DPH5005 + Pi 4) → scale to 64 for the deepest Opalton/bore lines. |
| **Which software?** | **ResIPy first** (GUI, your first images — needs Wine→Rosetta on Mac), **PyGIMLi later** (scripted, native). OhmPi exports to both natively — no converter. Both free. |
| **Total cost** | **≈ A$765–970 (32-el)** / **≈ A$1,200–2,200 (64-el)**, + ~$130 tools if starting from zero. Software $0. |
| **Total time** | **~40–70 h to build**, ~5–15 h to a first inversion, **~4–8 weeks decision→first farm survey**, a few months to Opalton-ready — inside the runway. |

### First survey plan — the 60-second version

> Build the 32-electrode OhmPi. Learn ResIPy on its example data while the PCBs ship. Prove the rig on
> a **known BSF cut** — 32 electrodes, 1 m Wenner, water the stakes, run the Rc check, run the
> sequence, invert in ResIPy, confirm the section shows the rock where you *know* it is. Then map a
> clay pocket, then (bonus) site a bore. Arrive at Opalton fluent; map the **gem box** with
> Wenner + dipole-dipole lines *perpendicular to the fault*, dig the clay lows the section reveals.

### The decision tree

```
                        Want to see under Steven's ground (0–8 m)?
                                        │
                        ┌───────────────┴───────────────┐
                   Map STRUCTURE                    Want cm-detail of
              (clay basement, deco,                 ironstone over a
               fracture, depth-to-rock)             KNOWN pool?
                        │                                 │
                     USE ERT  ◄── the workhorse       Hire GPR for a
                        │          (this document)     targeted 2nd pass
              ┌─────────┴─────────┐                    (decision doc §5)
        Build / buy / hire?       │
              │                   │
         BUILD OhmPi  ◄── cheapest, reusable, hands-on, right tool
              │
     32-electrode Lite v2024 (~$800)
              │
     ┌────────┴─────────┐
  Prove on BSF        Then Opalton
  (deco + clay,       (gem box, clay-
   known ground)      basement lows)
              │
     Line too short / too shallow?  ──►  scale to 64 electrodes (+$500–1,300)
              │
     Dry ground won't inject?  ──►  water + salt + bentonite, Rc check, push DPH5005 voltage
              │
     Section won't invert (RMS>15%)?  ──►  filter bad electrodes, re-check geometry, more stacks
              │
     Read the image ──► dig the predicted low ──► confirm ──► trust the tool
```

### The three critical gotchas — know these before you buy a single part

1. **Dry ground is the field make-or-break — not the electronics.** Opalton's dry, resistive sand (and
   BSF granite in a dry winter) fights current injection. The rig can be perfect and still return
   garbage if the electrodes can't pass current. **The fix is mundane and non-negotiable: water — better,
   salty water — and bentonite around every stake, and run the contact-resistance check as a hard
   go/no-go every time (§6.5).** Prove this workflow on the farm, because at Opalton you get one winter
   window and no one to phone.

2. **It maps structure, not opal — and the image is smoothed, not gospel.** ERT will draw the
   clay-basement contour, the deco/rock surface, the fracture zones — *the host architecture that tells
   you where to dig*. It will **not** "ping" a boulder of opal, and because inversion is **non-unique
   and smoothing**, the picture is a bit blurred and the absolute Ω·m values are approximate. **Ground-
   truth everything** — tie lines across known digs, then dig the predicted lows and confirm (§6.10).
   The map earns trust by being checked, not by being pretty.

3. **It's a real project, and the sleeper costs are cable and your hours — not the meter.** There's **no
   click-to-buy costed BOM** (price it off the repo's iBOM files), it's **~40–70 hours** of mostly
   repetitive soldering, and — exactly as in the commercial world — **cable is the cost that balloons**
   (up to ~$1,300 at 64 electrodes if you're undisciplined). Budget the hours, wire with discipline, and
   learn the free software *before* the hardware is finished, because interpretation is the real skill
   wall. None of it is beyond a hands-on tradie — but go in expecting a project, not a kit.

---

*Sources & method: this document's build, software, pricing, field-procedure, safety and community
findings were gathered by parallel research passes against the OhmPi GitLab repo and docs
([ohmpi.org](https://ohmpi.org/)), the HardwareX 2020 paper and later OhmPi conference abstracts,
ResIPy/PyGIMLi/SimPEG repos and papers, Australian retailers (Core Electronics, Jaycar, DigiKey AU,
Bunnings), JLCPCB/PCBWay, ACMA/AS-NZS/BYDA primary references, Loke's tutorial and the Palacky (1988)
resistivity reference, ASEG, and verified YouTube field walk-throughs. **Every dollar figure is
`[VERIFIED]` against a resolving source or flagged `[ESTIMATE]` with its basis; no price, product,
paper or URL is invented.** Links flagged as unconfirmed in-line are where a page blocked automated
fetching or a version detail couldn't be pinned — noted honestly rather than papered over. Companion
documents: `gpr_ert_deep_dive.md` (the build-vs-buy-vs-hire decision) and
`opal_favourability_data_sources.md` ("Active exploration techniques"). Load-bearing numbers a builder
should re-confirm before spending: (1) the exact v2024 board BOM totals, priced from the repo iBOM/xlsx
files; (2) current Omron relay part number/stock (G5LE-14 DC12) and DPH5005 landed AU price; (3) total
cable metreage for the chosen array layout.*
