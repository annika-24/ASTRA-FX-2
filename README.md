# ASTRA-FX

**Adaptive Functional Reserve & Countermeasure Experiment** is a browser-based research prototype exploring how longitudinal functional measurements might be translated into mission-relevant physical-performance context.

## Start the app

Open `index.html` in a modern browser with an internet connection. Chart.js and Three.js are loaded from cdnjs. The 3D anatomy view requires WebGL.

## Two deliberately separate evidence layers

### 1. NASA Evidence

The **NASA EVIDENCE** tab contains real values transcribed from Table 5.2-3 of NASA's *Human Integration Design Handbook*, NASA/SP-2010-3407/REV1. The table reports pre- and post-flight group means ± standard deviations for Mir and ISS mission groups:

- Whole-body lean mass
- Leg lean mass
- Knee-extension peak torque
- Knee-flexion peak torque

The source table marks statistically significant pre/post differences with an asterisk (P < 0.05). ASTRA-FX preserves those markings. Percent changes displayed in the app are calculated from the published group means.

These are **group-level summaries**, not individual astronaut records. The source table does not provide the individual-level repeated assessments required to reconstruct a personal longitudinal timeline. It also does not contain all six variables used by the synthetic demonstration model.

The NASA Evidence tab also links to NASA-STD-3001 Volume 1, Revision C, requirement V1 4024, which states that countermeasures shall maintain in-mission skeletal muscle strength at or above 80% of baseline values. This standards reference is presented separately from the historical Mir/ISS dataset. It is not used as a universal mission-task requirement or as a validated functional-reserve threshold.

### 2. Synthetic case and prototype model

The **SYNTHETIC CASE**, **3D ANATOMY**, **SIGNATURES**, **FUNCTIONAL RESERVE**, **WHAT-IF LAB**, and **FLOWCHART** tabs continue to use the hand-authored synthetic dataset in `data.js` and the assumptions in `model.js`.

The synthetic series is not NASA data, is not derived from an astronaut, and is not output from a validated physiological model. The task requirement fractions, weights, persistence threshold, signature groupings, region-to-variable associations, and countermeasure effect sizes are prototype assumptions. The functional-reserve value is not an official NASA metric or operational readiness standard. The countermeasure projections are illustrative what-if scenarios, not exercise-effect predictions.

The 3D anatomy view is a procedural schematic, not a licensed anatomical scan or segmented medical image. Its highlighted regions are conceptual associations with functional variables, not measured muscle-specific changes.

## Research question

Can individualized longitudinal functional-performance data be used to identify meaningful patterns of physical change and translate those changes into mission-specific functional-readiness and countermeasure decision support?

## Current evidence gap

The NASA Human Research Roadmap describes work to quantify time-course changes in astronaut aerobic fitness and muscle mass, strength, and endurance before, during, and after missions, including individual variability. That is the kind of longitudinal evidence needed to develop and validate an individualized model. The public NASA table currently integrated here is not a substitute for those individual-level data.

## Files

- `index.html` — application shell and external library loading
- `style.css` — interface styling
- `app.js` — interface, NASA evidence view, charts, anatomy schematic, flowchart
- `data.js` — synthetic demonstration dataset
- `model.js` — prototype analysis and simulation assumptions
- `NASA_Sources.md` — source details and provenance notes

## Limitations

ASTRA-FX is a research and educational prototype. It is not a medical device, clinical decision-support system, astronaut fitness assessment, exercise prescription tool, or operational mission-readiness system. No personal or identifiable astronaut health records are included.
