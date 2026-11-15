/* ASTRA-FX data layer.
   The physiological assessment series remains synthetic.
   NASA OSDR/GeneLab study metadata below is real public dataset metadata and is used
   as an evidence/reference layer; it is NOT treated as astronaut measurements. */
const ASTRA_DATA = {
  meta: {
    id: 'ASTRA-FX-OSD225', version: '0.2.0', type: 'SYNTHETIC_PLUS_NASA_REFERENCE',
    source: 'Synthetic demonstration assessments + NASA OSDR study OSD-225 / GeneLab GLDS-225 (GSE93838).',
    limits: 'The dashboard assessment values are illustrative. NASA OSD-225 is a rat soleus transcriptomics ground study, not human astronaut telemetry.'
  },
  nasa_reference: {
    agency: 'NASA',
    repository: 'NASA Open Science Data Repository / GeneLab',
    study_id: 'OSD-225',
    genelab_id: 'GLDS-225',
    geo_accession: 'GSE93838',
    doi: '10.26030/yw1m-z014',
    title: 'Expression profiling of soleus muscle under the effect of simulated spaceflight',
    organism: 'Rattus norvegicus',
    tissue: 'Soleus muscle',
    assay: 'DNA microarray / Affymetrix Rat Gene 1.0 ST',
    design: 'Three pooled samples representing irradiation-only, hindlimb-unloading + irradiation, and denervation + irradiation conditions.',
    groups: [
      {sample:'GSM2463679', label:'Muscle-C', condition:'Irradiation control', hindlimb_unloading:false, denervation:false, radiation_mSv:50},
      {sample:'GSM2463680', label:'Muscle-D', condition:'Denervation + irradiation', hindlimb_unloading:false, denervation:true, radiation_mSv:50},
      {sample:'GSM2463681', label:'Muscle-S', condition:'Hindlimb unloading + irradiation', hindlimb_unloading:true, denervation:false, radiation_mSv:50}
    ],
    published_findings: {
      common_DEGs: 144,
      tail_suspension_DEGs_gt2x: 364,
      denervation_DEGs_gt2x: 615,
      interpretation: 'Energy-metabolism and oxidative-phosphorylation pathways were suppressed, while slow-twitch contractile programs decreased and fast-twitch programs increased.'
    },
    links: {
      nasa_osdr: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-225',
      nasa_open_data: 'https://data.nasa.gov/dataset/expression-profiling-of-soleus-muscle-under-the-effect-of-simulated-spaceflight',
      geo: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE93838'
    }
  },
  subject: 'Synthetic demonstration subject',
  metrics: {
    strength:    {short: 'Strength',    label: 'Peak knee-extension torque', unit: 'N·m', dir: 1, dec: 0},
    endurance:   {short: 'Endurance',   label: 'Repetitions to failure at 50% of peak torque', unit: 'reps', dir: 1, dec: 0},
    fatigue:     {short: 'Fatigue',     label: 'Torque decline across 30 contractions', unit: '%', dir: -1, dec: 0},
    recovery:    {short: 'Recovery',    label: 'Time to regain 90% of peak torque', unit: 's', dir: -1, dec: 0},
    consistency: {short: 'Movement consistency', label: 'Gait cycle-time variability (CV)', unit: '%', dir: -1, dec: 1},
    performance: {short: 'Functional performance', label: 'Loaded 5× sit-to-stand time', unit: 's', dir: -1, dec: 1}
  },
  assessments: [
    {date: '2027-01-12', day: 0, tag: 'Pre-flight baseline', q: 'complete', v: {strength: 180, endurance: 32, fatigue: 28, recovery: 95, consistency: 4.2, performance: 11.0}},
    {date: '2027-02-11', day: 30, tag: 'Assessment 1', q: 'complete', v: {strength: 176, endurance: 32, fatigue: 28, recovery: 96, consistency: 4.2, performance: 11.1}},
    {date: '2027-03-13', day: 60, tag: 'Assessment 2', q: 'complete', v: {strength: 168, endurance: 31, fatigue: 29, recovery: 98, consistency: 4.3, performance: 11.5}},
    {date: '2027-04-12', day: 90, tag: 'Assessment 3', q: 'partial', v: {strength: 159, endurance: 29, fatigue: 30, recovery: 99, consistency: 4.4, performance: 11.9}},
    {date: '2027-05-12', day: 120, tag: 'Assessment 4', q: 'complete', v: {strength: 151, endurance: 28, fatigue: 31, recovery: 101, consistency: 4.4, performance: 12.3}},
    {date: '2027-06-11', day: 150, tag: 'Assessment 5', q: 'complete', v: {strength: 145, endurance: 27, fatigue: 31, recovery: 102, consistency: 4.5, performance: 12.6}},
    {date: '2027-07-11', day: 180, tag: 'Assessment 6', q: 'complete', v: {strength: 139, endurance: 26, fatigue: 32, recovery: 104, consistency: 4.6, performance: 13.0}}
  ]
};
