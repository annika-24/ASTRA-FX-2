/* ASTRA-FX analysis model. Pure functions, no DOM. All parameters below are
   PROTOTYPE ASSUMPTIONS, not validated values. */
const M = (() => {
  const D = ASTRA_DATA, A = D.assessments, keys = Object.keys(D.metrics);
  let THR = 0.10; const NPERSIST = 2, SIGFLOOR = 0.05;

  const base = k => A[0].v[k];
  // deficit: positive = worse than personal baseline (fraction of baseline)
  const deficit = (k, v) => D.metrics[k].dir > 0 ? (base(k) - v) / base(k) : (v - base(k)) / base(k);
  // ratio: capability as a fraction of baseline capability (1 = baseline, lower = worse)
  const ratio = (k, v) => D.metrics[k].dir > 0 ? v / base(k) : base(k) / v;
  const change = (k, v) => (v - base(k)) / base(k);
  const def = (k, i) => deficit(k, A[i].v[k]);
  const persist = (k, i) => {
    if (i < NPERSIST) return false;
    for (let j = i - NPERSIST + 1; j <= i; j++) if (def(k, j) <= THR) return false;
    return true;
  };
  const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);

  const SIGS = {
    strength:    {label: 'Strength-dominant decline',       vars: ['strength', 'performance']},
    fatigue:     {label: 'Fatigue-dominant decline',        vars: ['fatigue', 'endurance']},
    recovery:    {label: 'Recovery-dominant decline',       vars: ['recovery']},
    consistency: {label: 'Movement-consistency decline',    vars: ['consistency']}
  };
  function signatures(i) {
    const out = Object.entries(SIGS).map(([id, s]) => {
      const parts = s.vars.map(k => ({k, d: def(k, i), p: persist(k, i)}));
      return {id, label: s.label, parts, score: mean(parts.map(p => p.p ? p.d : 0))};
    }).sort((a, b) => b.score - a.score);
    return {list: out, dominant: out[0].score >= SIGFLOOR ? out[0] : null};
  }

  // Modeled task requirements: fraction of personal baseline capability needed (req) and weight (w).
  const TASKS = {
    surface:     {label: 'Surface mobility',      req: {strength: .60, endurance: .70, fatigue: .75, recovery: .65, consistency: .80, performance: .65}, w: {strength: .20, endurance: .20, fatigue: .15, recovery: .10, consistency: .20, performance: .15}},
    eva:         {label: 'EVA',                   req: {strength: .75, endurance: .80, fatigue: .85, recovery: .75, consistency: .75, performance: .75}, w: {strength: .20, endurance: .25, fatigue: .20, recovery: .10, consistency: .10, performance: .15}},
    egress:      {label: 'Emergency egress',      req: {strength: .85, endurance: .50, fatigue: .60, recovery: .50, consistency: .80, performance: .85}, w: {strength: .30, endurance: .05, fatigue: .05, recovery: .05, consistency: .20, performance: .35}},
    maintenance: {label: 'Equipment maintenance', req: {strength: .55, endurance: .65, fatigue: .70, recovery: .60, consistency: .90, performance: .70}, w: {strength: .15, endurance: .15, fatigue: .15, recovery: .05, consistency: .35, performance: .15}}
  };
  function reserveFrom(task, r) {
    const T = TASKS[task], sw = keys.reduce((s, k) => s + T.w[k], 0);
    const rows = keys.map(k => {
      const margin = r[k] - T.req[k];
      return {k, cap: r[k], req: T.req[k], margin, w: T.w[k], contrib: T.w[k] * margin / sw, below: margin < 0};
    });
    return {rows, total: rows.reduce((s, x) => s + x.contrib, 0), sw};
  }
  const ratiosAt = i => Object.fromEntries(keys.map(k => [k, ratio(k, A[i].v[k])]));
  const reserve = (task, i) => reserveFrom(task, ratiosAt(i));

  // Illustrative countermeasure effects: fraction of the observed decline slope that is offset.
  const STRATS = {
    current:    {label: 'Current prescription', eff: {strength: 0,  endurance: 0,  fatigue: 0,  recovery: 0,   consistency: 0,  performance: 0}},
    resistance: {label: 'Resistance-focused',   eff: {strength: .5, endurance: .1, fatigue: .1, recovery: 0,   consistency: .1, performance: .3}},
    endurance:  {label: 'Endurance-focused',    eff: {strength: .1, endurance: .5, fatigue: .5, recovery: .5,  consistency: .1, performance: .2}},
    combined:   {label: 'Combined',             eff: {strength: .4, endurance: .4, fatigue: .4, recovery: .35, consistency: .2, performance: .35}}
  };
  // Mean change in capability ratio per 30 days over the last three assessments.
  function slopes(i) {
    const j = Math.max(0, i - 2), dt = (A[i].day - A[j].day) / 30;
    return Object.fromEntries(keys.map(k => [k, dt > 0 ? (ratio(k, A[i].v[k]) - ratio(k, A[j].v[k])) / dt : 0]));
  }
  // Only continued decline is modeled; a strategy can slow it, never reverse it.
  function simulate(task, i, sid, o) {
    const s = slopes(i), e = STRATS[sid].eff, r0 = ratiosAt(i), out = [];
    for (let t = 0; t <= o.H; t++) {
      const r = {};
      keys.forEach(k => {
        const offset = Math.min(1, e[k] * (o.scale / 100) * (o.adh / 100));
        r[k] = Math.max(0.05, r0[k] + Math.min(s[k], 0) * (1 - offset) * t);
      });
      out.push({t, r, res: reserveFrom(task, r).total});
    }
    return out;
  }

  // Conceptual association of regions with measured variables (not per-muscle measurement).
  const REGIONS = {
    quads:     {label: 'Quadriceps',      m: ['strength', 'endurance']},
    hams:      {label: 'Hamstrings',      m: ['strength', 'consistency']},
    calves:    {label: 'Calves',          m: ['endurance', 'recovery']},
    glutes:    {label: 'Gluteal muscles', m: ['strength', 'performance']},
    abs:       {label: 'Abdominals',      m: ['fatigue', 'consistency']},
    back:      {label: 'Back muscles',    m: ['fatigue', 'consistency']},
    shoulders: {label: 'Shoulders',       m: ['strength', 'endurance']},
    arms:      {label: 'Upper arms',      m: ['strength', 'fatigue']}
  };
  const regionDeficit = (r, i) => mean(REGIONS[r].m.map(k => def(k, i)));

  const NASA = D.nasa_reference || null;
  return {keys, NASA, get THR() { return THR; }, setThr: v => { THR = v; }, NPERSIST, SIGFLOOR, base, deficit, ratio, change, def, persist, signatures, SIGS, TASKS, reserve, reserveFrom, STRATS, simulate, slopes, REGIONS, regionDeficit, mean};
})();
