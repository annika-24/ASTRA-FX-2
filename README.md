ASTRA-FX

Adaptive Functional Reserve & Countermeasure Experiment is a browser-based research prototype exploring how longitudinal functional measurements might be translated into mission-relevant physical-performance context.

Live prototype: https://astra-horizon-explorer.lovable.app

Purpose

NASA has published group-level evidence that muscle strength and lean mass decline during spaceflight. The harder question is what such changes mean for one individual performing a specific mission task. ASTRA-FX explores that decision-support step:

Can individualized longitudinal functional-performance data be used to identify meaningful patterns of physical change and translate those changes into mission-specific functional-readiness and countermeasure decision support?

It is a concept demonstration. It does not measure astronauts, diagnose anything, or predict outcomes.

How the project is organised: two separate layers
Layer	What it contains	Real or synthetic
NASA Evidence	Published pre/post-flight group means ± SD for Mir and ISS crews (NASA Human Integration Design Handbook, Table 5.2-3), plus NASA's in-mission strength requirement	Real, published, group-level
Synthetic case and model	One fictional subject with six measures across seven assessments, and the analysis logic applied to it	Synthetic, with assumed parameters

The two layers are never merged. NASA values are not converted into synthetic individual records, and synthetic values are never presented as NASA data.

The tabs
NASA Evidence: charts and a table of the published Mir and ISS results. Percent change is calculated by the app from the published group means. Significance marks (P < 0.05) are preserved from the source table. A separate card shows NASA-STD-3001 Vol. 1 Rev C, requirement V1 4024: countermeasures shall maintain in-mission skeletal muscle strength at or above 80% of baseline.
Synthetic Case: a fictional subject compared with their own baseline across six variables (strength, endurance, fatigue, recovery, movement consistency, functional performance), with a status summary and an assessment selector.
3D Anatomy: a procedural schematic body. Region colours show the decline in the variables conceptually linked to each region.
Signatures: detects changes that persist across consecutive assessments and groups them into four proposed patterns: strength-, fatigue-, recovery- and movement-consistency-dominant.
Functional Reserve: a prototype metric for the modeled margin between current capability and the demands of a selected task (surface mobility, EVA, emergency egress, equipment maintenance), with the full derivation shown.
What-If Lab: illustrative comparison of hypothetical exercise strategies (current, resistance-focused, endurance-focused, combined) with adjustable adherence and effect-size assumptions.
Flowchart: the nine-stage process from functional assessment to reassessment. Each stage shows the data required, the calculation, the output and the limitations.
How Functional Reserve is calculated

For each variable, capability is expressed relative to the person's own baseline:

capability = current / baseline        (higher-is-better variables)
capability = baseline / current        (lower-is-better variables)
margin     = capability - task requirement
Functional Reserve = sum( weight x margin ) / sum( weight )     (percentage points of baseline)

Task requirements and weights are prototype assumptions defined in model.js. They are not derived from NASA task analyses.

Data and provenance
NASA Evidence (real, published)

The values in the NASA Evidence tab were transcribed from Table 5.2-3, "Pre- and Postflight Musculoskeletal Data from Mir and ISS Missions 1-6", in NASA/SP-2010-3407/REV1 (Human Integration Design Handbook, revision of June 5, 2014). The table reports whole-body lean mass, leg lean mass, knee-extension peak torque and knee-flexion peak torque. The handbook attributes the underlying data to Lee et al. (2004).

These are group-level summaries, not individual astronaut records. No sample sizes or individual observations are inferred. The values were entered by hand, so they should be checked against the source PDF before being cited elsewhere.

Synthetic case (not NASA data)

The subject's seven assessments in data.js are hand-authored. They are not derived from any astronaut and are not the output of a validated physiological model. The synthetic strength series begins near the published knee-extension values, but the trajectory between assessments is invented.

NASA OSD-225 metadata (present, not used)

data.js also contains descriptive metadata for NASA OSDR study OSD-225 (GLDS-225, GSE93838), a rat soleus gene-expression study using ground-based simulated spaceflight. It is not human data. It is not displayed in the interface and is not used in any calculation. It is retained only as a reference record of a candidate public dataset.

Assumed parameters

The persistence threshold (10% on 2 consecutive assessments), signature groupings, task requirements and weights, countermeasure effect sizes, and region-to-variable associations are assumptions in model.js. They are not validated and are not NASA values.

Current evidence gap

NASA's Human Research Roadmap describes work to quantify time-course changes in astronaut aerobic fitness and muscle mass, strength and endurance before, during and after missions, including individual variability. That is the kind of longitudinal evidence an individualized model needs. The public table integrated here is not a substitute for those individual-level data, and individual-level NASA data is not publicly downloadable. Access is by request through NASA's Life Sciences Portal.

Running locally

Open index.html in a modern browser with an internet connection. Chart.js and Three.js load from cdnjs, and the 3D view requires WebGL. To serve it locally:

python3 -m http.server 8000

then visit http://localhost:8000.

Files
index.html: application shell and external library loading
style.css: interface styling
app.js: interface, NASA evidence view, charts, anatomy schematic, flowchart
data.js: synthetic demonstration dataset and OSD-225 reference metadata
model.js: prototype analysis and simulation assumptions
NASA_Sources.md: source details and provenance notes
Limitations

ASTRA-FX is a research and educational prototype. It is not a medical device, a clinical decision-support system, an astronaut fitness assessment, an exercise prescription tool, or an operational mission-readiness system. Functional Reserve, the decline signatures and the countermeasure projections are experimental concepts developed for this project and are not official NASA metrics. The 3D anatomy is a schematic, not a segmented medical image, and its highlighted regions are conceptual associations rather than measured muscle changes. No personal or identifiable astronaut health records are included.
