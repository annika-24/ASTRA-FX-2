# NASA source register — ASTRA-FX

## 1. Historical musculoskeletal outcomes integrated in the app

**NASA Human Integration Design Handbook (HIDH)**  
Document: NASA/SP-2010-3407/REV1  
Revision date: June 5, 2014  
Table: 5.2-3, “Pre- and Postflight Musculoskeletal Data from Mir and ISS Missions 1–6”  
PDF: https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf

NASA states that the Mir and ISS mission data were pooled and reports the following group means ± standard deviations:

| Mission group | Measure | Pre-flight | Post-flight | Marked significant? |
|---|---|---:|---:|---|
| Mir | Whole-body lean mass | 60.5 ± 1.6 kg | 58.4 ± 5.5 kg | No asterisk |
| Mir | Leg lean mass | 19.6 ± 0.7 kg | 18.3 ± 0.9 kg | Yes, P < 0.05 |
| Mir | Knee-extension peak torque | 179 ± 17 N·m | 131 ± 16 N·m | Yes, P < 0.05 |
| Mir | Knee-flexion peak torque | 103 ± 12 N·m | 79 ± 10 N·m | Yes, P < 0.05 |
| ISS | Whole-body lean mass | 56.1 ± 2.9 kg | 54.9 ± 3.4 kg | No asterisk |
| ISS | Leg lean mass | 18.7 ± 1.0 kg | 18.0 ± 1.3 kg | Yes, P < 0.05 |
| ISS | Knee-extension peak torque | 176 ± 10 N·m | 136 ± 10 N·m | Yes, P < 0.05 |
| ISS | Knee-flexion peak torque | 106 ± 6 N·m | 74 ± 7 N·m | Yes, P < 0.05 |

The handbook footnote defines the asterisk as a statistically significant change from before flight to after flight (P < 0.05), citing Lee et al. (2004).

**Implementation method:** the application displays the source means and SDs as reported. Percent change is calculated as `(post-flight mean − pre-flight mean) / pre-flight mean × 100`. This is a change in group means, not a paired individual-level estimate. No sample sizes, individual records, or missing data are inferred.

## 2. Current NASA in-mission muscle-strength requirement

**NASA Spaceflight Human-System Standard, Volume 1: Crew Health**  
Version: Revision C  
Document date: September 15, 2023  
Requirement: V1 4024, In-Mission Skeletal Muscle Strength  
PDF: https://www.nasa.gov/wp-content/uploads/2023/11/nasa-std-3001-vol-1-rev-c-with-signature.pdf  
Standards record: https://standards.nasa.gov/node/238

Requirement text: “Countermeasures shall maintain in-mission skeletal muscle strength at or above 80% of baseline values.”

ASTRA-FX displays this as a separate standards reference. It is not treated as an outcome in the historical Mir/ISS table, a universal requirement for every mission task, or a validation of the prototype Functional Reserve metric.

## 3. NASA research programme context — CIPHER Space Phys

NASA Human Research Roadmap task: “Temporal changes in astronauts muscle and cardiorespiratory physiology pre, during, and post spaceflight (Rivas)”  
Short title: CIPHER Space Phys - ISS  
Principal Investigator listed: Nicole Strock  
NASA task page: https://humanresearchroadmap.nasa.gov/Tasks/task.aspx?i=2406

The task describes aims to quantify time-course changes in aerobic fitness and muscle mass, strength, and endurance before, during, and after missions of 2 months, 6 months, and 1 year, and to quantify individual variability in relation to microgravity exposure, exercise training, and nutritional intake. The task page lists 30 flight subjects and an active, in-progress status at its May 13, 2025 update.

This task description establishes research relevance; it is not itself a public raw dataset. ASTRA-FX does not claim to contain CIPHER subject-level data.

## 4. NASA exercise monitoring context

**NASA OCHMO Technical Brief 031 — Exercise Overview**  
https://www.nasa.gov/ochmo-tb-031-exercise-overview-2/

NASA describes monitoring of crew fitness by Astronaut Strength, Conditioning, and Rehabilitation Specialists, including physiological markers and exercise performance such as time and intensity. This informs the app's framing of longitudinal assessment and countermeasure monitoring, but does not supply the synthetic model's missing measurements or parameters.

## 5. Data availability and limitations

The public sources above support the use of pre/post-flight group-level lean-mass and knee-torque outcomes, NASA's in-mission 80%-of-baseline muscle-strength requirement, and the research rationale for repeated pre/in/post-flight measurements.

They do **not** provide the full individual-level time series required by the current prototype's six-variable longitudinal model. Specifically, the integrated table does not supply individual repeated observations for endurance, fatigue, recovery time, gait variability, or loaded sit-to-stand performance. It also does not provide per-muscle measurements for the schematic anatomy.

Therefore:

- NASA evidence is displayed in its own view and is not converted into synthetic individual records.
- The synthetic data in `data.js` remain explicitly labeled synthetic.
- The prototype's persistence threshold, signature categories, task weights, task requirements, reserve formula, and countermeasure effects remain assumptions pending validation.
