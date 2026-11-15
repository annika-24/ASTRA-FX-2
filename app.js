/* ASTRA-FX interface. All numbers come from model.js; this file only renders and wires controls. */
(() => {
'use strict';
const D = ASTRA_DATA, A = D.assessments, K = M.keys, TK = M.TASKS, ST = M.STRATS, RG = M.REGIONS;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const S = {tab: 'nasa', metric: 'strength', region: 'quads', task: 'eva', idx: A.length - 1, strat: 'combined', adh: 80, scale: 100, H: 6, stage: 0};
const pct = x => (x * 100).toFixed(1) + '%';
const sg = x => (x < 0 ? '−' : '+') + Math.abs(x * 100).toFixed(1) + '%';
const pp = x => (x < 0 ? '−' : '+') + Math.abs(x * 100).toFixed(1) + ' pp';
const fmt = (k, v) => v.toFixed(D.metrics[k].dec) + ' ' + D.metrics[k].unit;
const cls = d => d > M.THR ? 'bad' : d > 0.03 ? 'warn' : 'ok';
const seg = (id, items, cur, v) => `<div class="seg ${v ? 'v' : ''}" id="${id}">${items.map(([a, l]) => `<button data-v="${a}" class="${a == cur ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const bind = (id, key, fn) => $$('#' + id + ' button').forEach(b => b.onclick = () => { S[key] = isNaN(b.dataset.v) ? b.dataset.v : +b.dataset.v; $$('#' + id + ' button').forEach(x => x.classList.toggle('on', x === b)); fn(); });
const tbl = (h, r) => `<table class="t"><thead><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${r.map(x => { const o = Array.isArray(x) ? {c: x} : x; return `<tr ${o.k ? `data-k="${o.k}"` : ''} class="${o.cls || ''}">${o.c.map(c => `<td>${c}</td>`).join('')}</tr>`; }).join('')}</tbody></table>`;
const tasks = Object.entries(TK).map(([k, t]) => [k, t.label]);

const charts = {};
function chart(id, cfg) {
  const el = $('#' + id); if (!el) return;
  if (typeof Chart === 'undefined') { el.parentNode.innerHTML = '<p class="err">Chart.js failed to load (check network access to cdnjs.cloudflare.com).</p>'; return; }
  if (charts[id]) charts[id].destroy();
  cfg.options = Object.assign({responsive: true, maintainAspectRatio: false, animation: false}, cfg.options);
  charts[id] = new Chart(el, cfg);
}
if (typeof Chart !== 'undefined') { Chart.defaults.color = '#465462'; Chart.defaults.borderColor = '#dce3e8'; Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'; Chart.defaults.font.size = 12; }

/* ---------- 3D anatomy (procedural, simplified) ---------- */
let GL = null;
const heat = d => {
  const t = Math.max(0, Math.min(1, d / 0.25)), c = new THREE.Color();
  return t < .4 ? c.set(0x3a7d8c).lerp(new THREE.Color(0xd9a441), t / .4) : c.set(0xd9a441).lerp(new THREE.Color(0xc4462f), (t - .4) / .6);
};
const heatCss = d => '#' + heat(d).getHexString();
function glStop() { if (GL) { GL.dispose(); GL = null; } }
function glStart() {
  const el = $('#gl'); if (!el) return;
  if (typeof THREE === 'undefined') { el.innerHTML = '<p class="err">Three.js failed to load (check network access to cdnjs.cloudflare.com).</p>'; return; }
  let r; try { r = new THREE.WebGLRenderer({antialias: true, alpha: true}); } catch (e) { el.innerHTML = '<p class="err">WebGL is unavailable in this browser, so the 3D view cannot render.</p>'; return; }
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); el.prepend(r.domElement);
  const cv = r.domElement, sc = new THREE.Scene(); sc.background = null;
  const cam = new THREE.PerspectiveCamera(35, 1, .1, 100);
  sc.add(new THREE.HemisphereLight(0xffffff, 0x223344, .95));
  const dl = new THREE.DirectionalLight(0xffffff, .7); dl.position.set(3, 5, 6); sc.add(dl);
  const gr = new THREE.GridHelper(4, 16, 0x8e9aa6, 0xbcc6cf); gr.position.y = -1.85; sc.add(gr);
  const ell = (col, x, y, z, a, b, c, region) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshStandardMaterial({color: col, roughness: .7, metalness: 0}));
    m.position.set(x, y, z); m.scale.set(a, b, c); if (region) m.userData.region = region;
    m.add(new THREE.LineSegments(new THREE.WireframeGeometry(m.geometry), new THREE.LineBasicMaterial({color: 0x36424e, transparent: true, opacity: region ? .22 : .16})));
    sc.add(m); return m;
  };
  const G = 0xaab5c0, muscles = [];
  ell(G, 0, 1.55, 0, .16, .2, .17); ell(G, 0, 1.3, 0, .06, .1, .06); ell(G, 0, .65, 0, .33, .5, .17);
  ell(G, 0, .15, 0, .27, .32, .15); ell(G, 0, -.1, 0, .27, .14, .15);
  [-1, 1].forEach(s => {
    ell(G, s * .56, .25, 0, .07, .25, .07); ell(G, s * .2, -.52, 0, .1, .38, .1);
    ell(G, s * .19, -1.3, 0, .07, .3, .07); ell(G, s * .19, -1.75, .08, .08, .05, .16);
    const mk = (reg, x, y, z, a, b, c) => muscles.push(ell(0x3a7d8c, s * x, y, z, a, b, c, reg));
    mk('quads', .2, -.52, .06, .14, .4, .13); mk('hams', .2, -.52, -.07, .13, .38, .11);
    mk('calves', .19, -1.28, -.06, .1, .3, .1); mk('glutes', .17, -.12, -.13, .17, .17, .14);
    mk('abs', .1, .2, .14, .09, .3, .07); mk('back', .14, .55, -.14, .15, .48, .07);
    mk('shoulders', .42, 1.1, 0, .13, .12, .13); mk('arms', .52, .72, 0, .09, .27, .09);
  });
  const sph = {th: .55, ph: 1.4, r: 6.2}, tg = new THREE.Vector3(0, -.1, 0), V = new THREE.Vector3(), xa = new THREE.Vector3(), ya = new THREE.Vector3(), za = new THREE.Vector3();
  const place = () => { cam.position.set(tg.x + sph.r * Math.sin(sph.ph) * Math.sin(sph.th), tg.y + sph.r * Math.cos(sph.ph), tg.z + sph.r * Math.sin(sph.ph) * Math.cos(sph.th)); cam.lookAt(tg); };
  const upd = () => muscles.forEach(m => { const reg = m.userData.region; m.material.color.copy(heat(M.regionDeficit(reg, S.idx))); m.material.emissive.set(reg === S.region ? 0x2b6d7e : 0x000000); });
  const ray = new THREE.Raycaster(), nd = new THREE.Vector2();
  const hit = e => { const b = cv.getBoundingClientRect(); nd.set((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(nd, cam); const h = ray.intersectObjects(muscles, false)[0]; return h ? h.object.userData.region : null; };
  let dn = null, mv = 0;
  cv.addEventListener('contextmenu', e => e.preventDefault());
  cv.addEventListener('pointerdown', e => { dn = {x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey}; mv = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (dn) {
      const dx = e.clientX - dn.x, dy = e.clientY - dn.y; dn.x = e.clientX; dn.y = e.clientY; mv += Math.abs(dx) + Math.abs(dy);
      if (dn.b === 2 || dn.sh) { cam.matrixWorld.extractBasis(xa, ya, za); tg.addScaledVector(xa, -dx * sph.r * .0016).addScaledVector(ya, dy * sph.r * .0016); }
      else { sph.th -= dx * .008; sph.ph = Math.max(.15, Math.min(Math.PI - .15, sph.ph - dy * .008)); }
      place();
    } else { const g = hit(e); cv.style.cursor = g ? 'pointer' : 'grab'; $('#tip').textContent = g ? `${RG[g].label} · associated-variable deficit ${pct(M.regionDeficit(g, S.idx))}` : ''; }
  });
  cv.addEventListener('pointerup', e => { if (dn && mv < 5) { const g = hit(e); if (g) { S.region = g; upd(); V.anatomy.upd(); } } dn = null; });
  cv.addEventListener('wheel', e => { e.preventDefault(); sph.r = Math.max(2.5, Math.min(12, sph.r * Math.exp(e.deltaY * .001))); place(); }, {passive: false});
  const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; if (w && h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } }); ro.observe(el);
  let raf; const loop = () => { raf = requestAnimationFrame(loop); r.render(sc, cam); }; place(); upd(); loop();
  GL = {upd, dispose: () => { cancelAnimationFrame(raf); ro.disconnect(); r.dispose(); cv.remove(); },
    view: v => { if (v === 'reset') { Object.assign(sph, {th: .55, ph: 1.4, r: 6.2}); tg.set(0, -.1, 0); } else { sph.th = v === 'back' ? Math.PI : 0; sph.ph = 1.45; } place(); }};
}

/* ---------- Verified NASA evidence dataset ----------
   Values transcribed from NASA/SP-2010-3407/REV1, Table 5.2-3.
   These are mission-group means ± SD, not individual astronaut records.
   No sample sizes or individual longitudinal observations are inferred here.
*/
const NASA_EVIDENCE = {
  meta: {
    id: 'NASA-HIDH-T5.2-3',
    title: 'Pre- and Postflight Musculoskeletal Data from Mir and ISS Missions 1–6',
    document: 'NASA/SP-2010-3407/REV1',
    revision: 'June 5, 2014',
    underlyingCitation: 'Lee et al. (2004), as cited in NASA Human Integration Design Handbook, Table 5.2-3',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/03/human-integration-design-handbook-revision-1.pdf'
  },
  groups: [
    {id: 'mir', label: 'Mir', measures: {
      wholeBodyLean: {label: 'Whole-body lean mass', unit: 'kg', pre: 60.5, preSd: 1.6, post: 58.4, postSd: 5.5, significant: false},
      legLean: {label: 'Leg lean mass', unit: 'kg', pre: 19.6, preSd: 0.7, post: 18.3, postSd: 0.9, significant: true},
      kneeExtension: {label: 'Knee-extension peak torque', unit: 'N·m', pre: 179, preSd: 17, post: 131, postSd: 16, significant: true},
      kneeFlexion: {label: 'Knee-flexion peak torque', unit: 'N·m', pre: 103, preSd: 12, post: 79, postSd: 10, significant: true}
    }},
    {id: 'iss', label: 'ISS', measures: {
      wholeBodyLean: {label: 'Whole-body lean mass', unit: 'kg', pre: 56.1, preSd: 2.9, post: 54.9, postSd: 3.4, significant: false},
      legLean: {label: 'Leg lean mass', unit: 'kg', pre: 18.7, preSd: 1.0, post: 18.0, postSd: 1.3, significant: true},
      kneeExtension: {label: 'Knee-extension peak torque', unit: 'N·m', pre: 176, preSd: 10, post: 136, postSd: 10, significant: true},
      kneeFlexion: {label: 'Knee-flexion peak torque', unit: 'N·m', pre: 106, preSd: 6, post: 74, postSd: 7, significant: true}
    }}
  ]
};
const nasaPct = m => ((m.post - m.pre) / m.pre) * 100;
const nasaFmt = (x, sd, unit) => `${x.toFixed(unit === 'kg' ? 1 : 0)} ± ${sd.toFixed(unit === 'kg' ? 1 : 0)} ${unit}`;

/* ---------- Views ---------- */
const V = {};
V.nasa = {
  html: () => `<div class="g2">
    <section class="p">
      <h3>NASA-published musculoskeletal outcomes</h3>
      <p class="note">Primary-source evidence · pre-flight vs post-flight group means</p>
      <div id="nasaSummary"></div>
      <h3 style="margin-top:18px">Current NASA strength requirement</h3>
      <div class="standard-card"><strong>≥80%</strong><span>of baseline skeletal muscle strength</span><small>NASA-STD-3001 Volume 1, Revision C · requirement V1 4024</small></div>
      <p>This is a NASA in-mission requirement, shown as a separate standards reference—not a threshold inferred from the historical Mir/ISS group data and not the threshold used by ASTRA-FX's illustrative reserve model.</p>
      <p class="note"><a href="https://www.nasa.gov/wp-content/uploads/2023/11/nasa-std-3001-vol-1-rev-c-with-signature.pdf" target="_blank" rel="noopener">Read NASA-STD-3001 Volume 1, Revision C ↗</a></p>
      <h3 style="margin-top:18px">What the source actually contains</h3>
      <p>NASA reports group-level means and standard deviations for Mir and ISS missions. This is real NASA-published evidence, but it is not a downloadable person-by-person time series.</p>
      <p class="note">The table does not provide individual records, assessment dates, sample sizes, fatigue, recovery, gait variability, or loaded sit-to-stand measurements. Those variables are therefore not fabricated or derived from this source.</p>
    </section>
    <section class="p">
      <h3>Change in peak knee torque</h3>
      <div class="cv"><canvas id="nasaTorque"></canvas></div>
      <h3 style="margin-top:16px">Change in lean mass</h3>
      <div class="cv"><canvas id="nasaMass"></canvas></div>
    </section>
    <section class="p" style="grid-column:1/-1">
      <h3>Source values · mean ± standard deviation</h3>
      <div id="nasaTable"></div>
      <p class="note">An asterisk indicates a statistically significant pre/post difference (P &lt; 0.05), as marked in NASA Table 5.2-3. Percent change is calculated here from the published group means; it is not an individual-level change score.</p>
      <p class="note"><b>Source:</b> ${NASA_EVIDENCE.meta.document}, ${NASA_EVIDENCE.meta.title}, Table 5.2-3, p. 107 (document page 106). ${NASA_EVIDENCE.meta.underlyingCitation}. <a href="${NASA_EVIDENCE.meta.url}" target="_blank" rel="noopener">Open NASA handbook (PDF) ↗</a></p>
    </section>
  </div>`,
  upd() {
    const metricKeys = ['wholeBodyLean', 'legLean', 'kneeExtension', 'kneeFlexion'];
    const labels = {wholeBodyLean: 'Whole-body lean mass', legLean: 'Leg lean mass', kneeExtension: 'Knee-extension torque', kneeFlexion: 'Knee-flexion torque'};
    $('#nasaSummary').innerHTML = NASA_EVIDENCE.groups.map(g => {
      const ext = g.measures.kneeExtension, flex = g.measures.kneeFlexion;
      return `<div class="p" style="margin:10px 0;background:#f7f9fb"><h4>${g.label}</h4><div class="g2"><div><b>${nasaPct(ext).toFixed(1)}%</b><div class="dim">knee-extension peak torque</div></div><div><b>${nasaPct(flex).toFixed(1)}%</b><div class="dim">knee-flexion peak torque</div></div></div></div>`;
    }).join('') + `<p class="note">Both mission groups show lower post-flight mean peak knee torque. These comparisons describe the reported groups, not a prediction for an individual crew member.</p>`;
    const rows = [];
    NASA_EVIDENCE.groups.forEach(g => metricKeys.forEach(k => {
      const m = g.measures[k];
      rows.push([g.label, labels[k], nasaFmt(m.pre, m.preSd, m.unit), nasaFmt(m.post, m.postSd, m.unit), `${nasaPct(m).toFixed(1)}%`, m.significant ? 'Yes (P &lt; 0.05)' : 'Not marked significant']);
    }));
    $('#nasaTable').innerHTML = tbl(['Mission group', 'Measure', 'Pre-flight', 'Post-flight', 'Mean change', 'Significant?'], rows);
    chart('nasaTorque', {type: 'bar', data: {labels: ['Knee extension', 'Knee flexion'], datasets: NASA_EVIDENCE.groups.flatMap(g => [
      {label: `${g.label} · pre`, data: [g.measures.kneeExtension.pre, g.measures.kneeFlexion.pre], backgroundColor: g.id === 'mir' ? '#7ca6bd' : '#9bb6a7'},
      {label: `${g.label} · post`, data: [g.measures.kneeExtension.post, g.measures.kneeFlexion.post], backgroundColor: g.id === 'mir' ? '#326b8a' : '#4d8068'}
    ])}, options: {scales: {y: {beginAtZero: true, title: {display: true, text: 'Peak torque (N·m)'}}}}});
    chart('nasaMass', {type: 'bar', data: {labels: ['Whole-body lean mass', 'Leg lean mass'], datasets: NASA_EVIDENCE.groups.flatMap(g => [
      {label: `${g.label} · pre`, data: [g.measures.wholeBodyLean.pre, g.measures.legLean.pre], backgroundColor: g.id === 'mir' ? '#7ca6bd' : '#9bb6a7'},
      {label: `${g.label} · post`, data: [g.measures.wholeBodyLean.post, g.measures.legLean.post], backgroundColor: g.id === 'mir' ? '#326b8a' : '#4d8068'}
    ])}, options: {scales: {y: {beginAtZero: true, title: {display: true, text: 'Lean mass (kg)'}}}}});
  }
};
V.profile = {
  html: () => `<section class="p case-brief" id="caseBrief"></section><div class="g2"><section class="p"><h3>Functional profile · baseline vs current</h3><div id="ov"></div>
    <h3 style="margin-top:14px">Data provenance</h3><div class="note" id="prov"></div></section>
    <section class="p"><h3 id="pt"></h3><div class="cv"><canvas id="c1"></canvas></div><div id="at"></div></section></div>`,
  upd() {
    const i = S.idx, a = A[i];
    const dominant = M.signatures(i).dominant;
    const persistent = K.filter(k => M.persist(k, i));
    const reserveNow = M.reserve(S.task, i).total;
    const largest = K.slice().sort((x, y) => M.def(y, i) - M.def(x, i)).slice(0, 2);
    $('#caseBrief').innerHTML = `<div class="case-head"><div><span class="eyebrow">ILLUSTRATIVE CASE · SYNTHETIC DATA</span><h3>Functional status snapshot</h3><p>Subject A · ${A.length} assessments across ${A[A.length - 1].day} days · latest assessment ${a.date}</p></div><span class="source-label">NOT A NASA SUBJECT</span></div><div class="case-stats"><div><strong>${dominant ? dominant.label : 'No dominant pattern'}</strong><small>Proposed functional signature</small></div><div><strong>${persistent.length ? persistent.length : 'None'}</strong><small>Persistent variables at current threshold</small></div><div><strong>${pp(reserveNow)}</strong><small>Modeled reserve · ${TK[S.task].label}</small></div><div><strong>${largest.map(k => D.metrics[k].short).join(' / ')}</strong><small>Largest current baseline differences</small></div></div><div class="case-actions"><button class="btn" id="caseSignatures">Review detected changes</button><button class="btn" id="caseReserve">Inspect task reserve</button><button class="btn" id="caseWhatIf">Compare countermeasure scenarios</button></div>`;
    $('#caseSignatures').onclick = () => go('signatures'); $('#caseReserve').onclick = () => go('reserve'); $('#caseWhatIf').onclick = () => go('whatif');
    $('#ov').innerHTML = tbl(['Variable', 'Baseline', 'Current', 'Change', 'Persistent'], K.map(k => ({k, cls: k === S.metric ? 'sel' : '', c: [D.metrics[k].short, fmt(k, M.base(k)), fmt(k, a.v[k]), `<span class="${cls(M.def(k, i))}">${sg(M.change(k, a.v[k]))}</span>`, M.persist(k, i) ? '<span class="bad">yes</span>' : '<span class="dim">no</span>']})));
    $$('#ov tr[data-k]').forEach(t => t.onclick = () => { S.metric = t.dataset.k; this.upd(); });
    $('#prov').innerHTML = `<b>${D.meta.type}</b> dataset ${D.meta.id} v${D.meta.version} · ${D.subject}<br>${D.meta.source}<br>${D.meta.limits}<br>Change shows raw % difference from baseline; "persistent" means worse than baseline by more than ${M.THR * 100}% on ${M.NPERSIST} consecutive assessments.`;
    const k = S.metric, m = D.metrics[k], rows = A.slice(0, i + 1);
    $('#pt').textContent = `${m.label} (${m.unit}) · ${m.dir > 0 ? 'higher is better' : 'lower is better'}`;
    chart('c1', {type: 'line', data: {labels: rows.map(x => 'D' + x.day), datasets: [
      {label: m.short, data: rows.map(x => x.v[k]), borderColor: '#0b7bbd', backgroundColor: '#0b7bbd', tension: 0, pointRadius: 4, pointStyle: rows.map(x => x.q === 'partial' ? 'rectRot' : 'circle')},
      {label: 'Personal baseline', data: rows.map(() => M.base(k)), borderColor: '#8b97a3', borderDash: [4, 4], pointRadius: 0}]}, options: {scales: {y: {title: {display: true, text: m.unit}}}}});
    $('#at').innerHTML = tbl(['Date (synthetic)', 'Day', 'Value', 'vs baseline', 'Data quality'], rows.map(x => [x.date, x.day, fmt(k, x.v[k]), sg(M.change(k, x.v[k])), x.q === 'partial' ? '<span class="warn">partial ◆</span>' : 'complete']));
  }
};

V.anatomy = {
  html: () => `<div class="g2"><section class="p"><h3>Simplified 3D anatomy · drag rotate · wheel zoom · right-drag/shift-drag pan · click to select</h3>
    <div id="gl"><div id="tip"></div><div class="glh">Procedural schematic model · not segmented from imaging<br>colour = deficit of associated variables</div></div>
    <div class="seg" style="margin-top:8px"><button id="vf">Front</button><button id="vb">Back</button><button id="vr">Reset view</button></div></section>
    <section class="p"><h3>Region</h3><div id="rl" style="display:grid;grid-template-columns:1fr 1fr;gap:0 10px"></div><div id="rd"></div><div class="cv" style="height:220px"><canvas id="c6"></canvas></div></section></div>`,
  init() { glStart(); $('#vf').onclick = () => GL && GL.view('front'); $('#vb').onclick = () => GL && GL.view('back'); $('#vr').onclick = () => GL && GL.view('reset'); },
  upd() {
    const i = S.idx;
    $('#rl').innerHTML = `<div class="seg v" id="rg" style="grid-column:1/3;display:grid;grid-template-columns:1fr 1fr;gap:0 6px">${Object.entries(RG).map(([k, g]) => `<button data-v="${k}" class="${k === S.region ? 'on' : ''}"><span class="sw" style="background:${heatCss(M.regionDeficit(k, i))}"></span>${g.label}</button>`).join('')}</div>`;
    bind('rg', 'region', () => { GL && GL.upd(); this.upd(); });
    const g = RG[S.region];
    $('#rd').innerHTML = `<h4>${g.label} · associated measured variables</h4>` + tbl(['Variable', 'Baseline', 'Current', 'Change', 'Persistent'], g.m.map(k => [D.metrics[k].short, fmt(k, M.base(k)), fmt(k, A[i].v[k]), `<span class="${cls(M.def(k, i))}">${sg(M.change(k, A[i].v[k]))}</span>`, M.persist(k, i) ? '<span class="bad">yes</span>' : 'no'])) +
      `<p class="note"><span class="tag m">MEASURED</span>variable values above. <span class="tag s">ASSUMED</span>the region-to-variable association is conceptual; ASTRA-FX cannot measure muscle volume or per-muscle deterioration from functional data.</p>`;
    chart('c6', {type: 'line', data: {labels: A.slice(0, i + 1).map(x => 'D' + x.day), datasets: g.m.map((k, n) => ({label: D.metrics[k].short, data: A.slice(0, i + 1).map(x => M.ratio(k, x.v[k]) * 100), borderColor: n ? '#d98e04' : '#0b7bbd', pointRadius: 3, tension: 0}))}, options: {scales: {y: {title: {display: true, text: 'capability, % of baseline'}}}}});
    GL && GL.upd();
  }
};

V.signatures = {
  html: () => `<div class="g2"><section class="p"><h3>Deficit vs personal baseline · as-of assessment</h3><div class="cv"><canvas id="c2"></canvas></div><div id="pm"></div></section>
    <section class="p"><h3>Proposed functional decline signatures</h3><div id="sg"></div></section></div>`,
  upd() {
    const i = S.idx, sig = M.signatures(i);
    chart('c2', {type: 'bar', data: {labels: K.map(k => D.metrics[k].short), datasets: [
      {label: 'Deficit %', data: K.map(k => M.def(k, i) * 100), backgroundColor: K.map(k => M.persist(k, i) ? '#cf5a42' : '#4a5866')},
      {type: 'line', label: `Persistence threshold (${M.THR * 100}%)`, data: K.map(() => M.THR * 100), borderColor: '#d98e04', borderDash: [5, 4], pointRadius: 0}]}, options: {scales: {y: {title: {display: true, text: 'worse than baseline, %'}}}}});
    $('#pm').innerHTML = '<h4>Persistence matrix (deficit %, red = above threshold)</h4>' + tbl(['Variable', ...A.slice(1, i + 1).map(x => 'D' + x.day)], K.map(k => [D.metrics[k].short, ...A.slice(1, i + 1).map((x, j) => `<span class="${M.def(k, j + 1) > M.THR ? 'bad' : 'dim'}">${(M.def(k, j + 1) * 100).toFixed(1)}</span>`)]));
    const d = sig.dominant;
    $('#sg').innerHTML = tbl(['Signature', 'Score', 'Contributing variables (persistent only)'], sig.list.map(s => ({cls: d && s.id === d.id ? 'sel' : '', c: [s.label, `<b>${pct(s.score)}</b>`, s.parts.map(p => `${D.metrics[p.k].short} ${p.p ? `<span class="bad">${pct(p.d)}</span>` : '<span class="dim">not persistent</span>'}`).join('<br>')]}))) +
      `<h4>Why this result</h4><p>${d ? `<b>${d.label}</b> scores highest at ${pct(d.score)}, ${d.parts.filter(p => p.p).length ? 'driven by ' + d.parts.filter(p => p.p).map(p => `${D.metrics[p.k].short.toLowerCase()} (${pct(p.d)} below baseline)`).join(' and ') : ''}. Next highest: ${sig.list[1].label.toLowerCase()} at ${pct(sig.list[1].score)}.` : `No variable has been worse than baseline by more than ${M.THR * 100}% on ${M.NPERSIST} consecutive assessments up to this point, so no signature is flagged (floor ${M.SIGFLOOR * 100}%).`}</p>
      <p class="note"><span class="tag m">MEASURED</span>per-variable deficits and persistence flags. <span class="tag s">MODELED</span>the grouping of variables into signatures and the score (mean of persistent deficits across a signature's variables, 0 where not persistent). These are proposed prototype categories, not an established clinical classification, and not a diagnosis. Try earlier assessments with the selector above to see persistence develop.</p>`;
  }
};

V.reserve = {
  html: () => `${seg('tk', tasks, S.task)}<div class="g2"><section class="p"><h3>Capability vs modeled task requirement</h3><div class="cv tall"><canvas id="c3"></canvas></div></section>
    <section class="p"><h3>Derivation</h3><div id="rs"></div><div id="rt"></div></section></div>`,
  init() { bind('tk', 'task', () => this.upd()); },
  upd() {
    const i = S.idx, R = M.reserve(S.task, i), T = TK[S.task];
    chart('c3', {type: 'bar', data: {labels: K.map(k => D.metrics[k].short), datasets: [
      {label: 'Current capability (% of baseline)', data: R.rows.map(x => x.cap * 100), backgroundColor: R.rows.map(x => x.below ? '#cf5a42' : '#0b7bbd')},
      {label: 'Modeled requirement (% of baseline)', data: R.rows.map(x => x.req * 100), backgroundColor: '#5b6874'}]}, options: {indexAxis: 'y', scales: {x: {min: 0, max: 110}}}});
    const worst = [...R.rows].sort((a, b) => a.contrib - b.contrib)[0], below = R.rows.filter(x => x.below);
    $('#rs').innerHTML = `<div class="big ${R.total < 0 ? 'bad' : ''}">${pp(R.total)}</div><div class="dim">modeled Functional Reserve · ${T.label} · as of D${A[i].day}</div>
      <p>${below.length ? `Capability is below the modeled requirement for: <span class="bad">${below.map(x => D.metrics[x.k].short.toLowerCase()).join(', ')}</span>.` : 'No variable is below its modeled requirement.'} Lowest-margin contribution: <b>${D.metrics[worst.k].short}</b> (${pp(worst.contrib)}).</p>`;
    $('#rt').innerHTML = tbl(['Variable', 'Capability', 'Requirement', 'Margin', 'Weight', 'Contribution'], R.rows.map(x => [D.metrics[x.k].short, pct(x.cap), pct(x.req), `<span class="${x.below ? 'bad' : 'ok'}">${pp(x.margin)}</span>`, x.w.toFixed(2), pp(x.contrib)]).concat([{cls: 'sel', c: ['Total', '', '', '', R.sw.toFixed(2), `<b>${pp(R.total)}</b>`]}])) +
      `<p class="note">capability = current ÷ baseline (higher-is-better) or baseline ÷ current (lower-is-better). margin = capability − requirement. Functional Reserve = Σ weight × margin ÷ Σ weight, in percentage points of baseline capability. <span class="tag s">ASSUMED</span>requirements and weights are illustrative placeholders, not NASA task analyses. This is a prototype metric, not an operational readiness measure.</p>`;
  }
};

V.whatif = {
  html: () => `<div class="p" style="margin-bottom:12px"><div class="ctl">${seg('tk', tasks, S.task)}</div><div class="ctl">${seg('hz', [[3, '3 mo'], [6, '6 mo'], [9, '9 mo'], [12, '12 mo']], S.H)}
    <label>Adherence <input type="range" id="adh" min="0" max="100" value="${S.adh}"> <b id="adhv"></b></label><label>Effect-size scale <input type="range" id="scl" min="0" max="200" step="10" value="${S.scale}"> <b id="sclv"></b></label></div>
    <p class="note" style="margin:0"><span class="tag s">ILLUSTRATIVE SIMULATION</span>Not a validated prediction of exercise effectiveness. Continues each variable's recent decline slope, then offsets a fraction set by assumed strategy effect × scale × adherence (offset capped at 100%: strategies can slow, never reverse, decline).</p></div>
    <div class="g2"><section class="p"><h3>Projected Functional Reserve by strategy</h3><div class="cv"><canvas id="c4"></canvas></div><div id="wt"></div></section>
    <section class="p"><h3>Before / after at horizon</h3>${seg('sp', Object.entries(ST).filter(x => x[0] !== 'current').map(([k, s]) => [k, s.label]), S.strat)}<div class="cv"><canvas id="c5"></canvas></div><div id="wa"></div></section></div>`,
  init() { bind('tk', 'task', () => this.upd()); bind('hz', 'H', () => this.upd()); bind('sp', 'strat', () => this.upd()); $('#adh').oninput = e => { S.adh = +e.target.value; this.upd(); }; $('#scl').oninput = e => { S.scale = +e.target.value; this.upd(); }; },
  upd() {
    const i = S.idx, o = {adh: S.adh, scale: S.scale, H: S.H}; $('#adhv').textContent = S.adh + '%'; $('#sclv').textContent = S.scale + '%';
    const sims = Object.fromEntries(Object.keys(ST).map(k => [k, M.simulate(S.task, i, k, o)])), col = {current: '#8b97a3', resistance: '#d98e04', endurance: '#2a8460', combined: '#0b7bbd'};
    chart('c4', {type: 'line', data: {labels: sims.current.map(p => '+' + p.t + ' mo'), datasets: [...Object.keys(ST).map(k => ({label: ST[k].label, data: sims[k].map(p => p.res * 100), borderColor: col[k], pointRadius: 2, tension: 0})), {label: 'Zero reserve', data: sims.current.map(() => 0), borderColor: '#cf5a42', borderDash: [4, 4], pointRadius: 0}]}, options: {scales: {y: {title: {display: true, text: 'reserve, pp of baseline'}}}}});
    const end = k => sims[k][o.H], c0 = end('current').res;
    $('#wt').innerHTML = tbl(['Strategy', 'Now', `At +${o.H} mo`, 'Δ vs current', 'Main variables affected'], Object.keys(ST).map(k => [ST[k].label, pp(sims[k][0].res), `<span class="${end(k).res < 0 ? 'bad' : ''}">${pp(end(k).res)}</span>`, k === 'current' ? '–' : pp(end(k).res - c0), K.filter(v => ST[k].eff[v] >= .3).map(v => D.metrics[v].short).join(', ') || (k === 'current' ? 'trend continues' : 'minor')]));
    const s = S.strat, ra = sims.current[0].r, rc = end('current').r, rs = end(s).r;
    chart('c5', {type: 'bar', data: {labels: K.map(k => D.metrics[k].short), datasets: [{label: 'Now', data: K.map(k => ra[k] * 100), backgroundColor: '#5b6874'}, {label: 'Current prescription', data: K.map(k => rc[k] * 100), backgroundColor: '#8b97a3'}, {label: ST[s].label, data: K.map(k => rs[k] * 100), backgroundColor: col[s]}]}, options: {scales: {y: {min: 0, title: {display: true, text: 'capability, % of baseline'}}}}});
    $('#wa').innerHTML = tbl(['Assumed effect', ...K.map(k => D.metrics[k].short.split(' ')[0])], [[ST[s].label, ...K.map(k => (ST[s].eff[k] * 100).toFixed(0) + '%')]]) + `<p class="note">Assumed effect = share of each variable's observed decline slope offset at full adherence, before the scale and adherence sliders. Reserve at +${o.H} mo: ${pp(end(s).res)} vs ${pp(c0)} on the current prescription.</p>`;
  }
};

const STAGES = [
  ['Functional Assessment', 'Standardised tests capture strength, endurance, fatigue, recovery, movement consistency and task-relevant performance.', 'Six variables per session with units, date and a data-quality flag.', 'Per-variable summaries across trials; sessions with incomplete trials are flagged partial.', 'A dated, quality-flagged measurement record.', 'Synthetic here. Real use needs defined protocols, devices, trial counts and measurement-error estimates.'],
  ['Personal Baseline', 'The subject’s own pre-flight values become the reference, so each person is compared with themselves.', 'Pre-flight assessment(s).', 'baseline = first assessment. deficit = (b − c) ÷ b for higher-is-better variables, (c − b) ÷ b for lower-is-better.', 'A reference value per variable.', 'A single-session baseline carries noise; real use should average repeated pre-flight sessions.'],
  ['Longitudinal Monitoring', 'Each new assessment is placed against the baseline to build a trajectory per variable.', 'All assessments in date order.', 'change = (c − b) ÷ b; capability ratio = c ÷ b or b ÷ c.', 'Time series of change and capability per variable.', 'No measurement-error model; irregular spacing and missing variables are not handled.'],
  ['Detect Persistent Change', 'Separates sustained change from single-session noise.', 'Deficit series per variable.', `A variable is flagged when its deficit exceeds ${M.THR * 100}% on ${M.NPERSIST} consecutive assessments.`, 'Persistent / not-persistent flag per variable.', 'Threshold and window are arbitrary prototype choices, not clinically validated.'],
  ['Identify Functional Decline Signature', 'Groups persistent changes into proposed patterns: strength, fatigue, recovery or movement consistency.', 'Persistent deficits.', 'Signature score = mean over the signature’s variables of persistent deficits (0 if not persistent). Highest score ≥ 5% is flagged.', 'Proposed dominant pattern plus the variables that drive it.', 'Proposed categories only, not a clinical classification. Variable grouping is an assumption.'],
  ['Map to Mission-Specific Task', 'A selected task (surface mobility, EVA, emergency egress, maintenance) defines what capability is needed.', 'Task choice; modeled requirement and weight per variable.', 'Each variable gets a requirement (fraction of baseline capability) and a weight.', 'A requirement profile for the task.', 'Requirements are illustrative placeholders, not NASA task analyses.'],
  ['Estimate Functional Reserve', 'Compares current capability with the task requirement to find the modeled margin.', 'Capability ratios; requirement profile.', 'margin = capability − requirement; Reserve = Σ weight × margin ÷ Σ weight (pp of baseline).', 'One reserve number plus the variables below requirement and their contributions.', 'Prototype metric, assumes linear weighting; not an operational readiness measure.'],
  ['Compare Countermeasure Strategies', 'Projects the trajectory under hypothetical exercise strategies.', 'Recent decline slopes; assumed strategy effects; adherence.', 'projected = now + slope × (1 − min(1, effect × scale × adherence)) × months; reserve recomputed per step.', 'Reserve trajectories and before/after variable values per strategy.', 'Effects are assumed and illustrative, not validated; strategies can only slow decline here.'],
  ['Reassessment', 'A new assessment closes the loop: observed values test the projection and the cycle repeats.', 'The next assessment.', 'Steps 2–8 are recomputed with the new data.', 'An updated state and a comparison of observed vs projected change.', 'Closing the loop credibly requires real follow-up data and validation.']
];
function live(n) {
  const i = S.idx, R = M.reserve(S.task, i), pers = K.filter(k => M.persist(k, i)), d = M.signatures(i).dominant;
  return [`${A.length} assessments loaded; as-of ${A[i].date} (${A[i].q}).`, K.map(k => `${D.metrics[k].short} ${fmt(k, M.base(k))}`).join(' · '), `${i + 1} points in series, D0–D${A[i].day}.`, pers.length ? 'Persistent: ' + pers.map(k => D.metrics[k].short).join(', ') + '.' : 'No persistent change yet.', d ? `${d.label} (${pct(d.score)}).` : 'No signature flagged.', `Task: ${TK[S.task].label}.`, `Reserve ${pp(R.total)} for ${TK[S.task].label}.`, `Combined at +6 mo: ${pp(M.simulate(S.task, i, 'combined', {adh: S.adh, scale: S.scale, H: 6})[6].res)} vs current ${pp(M.simulate(S.task, i, 'current', {adh: S.adh, scale: S.scale, H: 6})[6].res)}.`, `Next assessment after D${A[i].day} would be appended and steps 2–8 rerun.`][n];
}
V.flow = {
  html() {
    const X = [20, 345, 670], Y = [20, 150, 280], W = 230, H = 80, pos = n => { const r = Math.floor(n / 3), c = r % 2 ? 2 - (n % 3) : n % 3; return [X[c], Y[r]]; };
    let s = `<svg viewBox="0 0 940 390" role="group" aria-label="ASTRA-FX process flowchart"><defs><marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="#7f8c9a"/></marker></defs>`;
    for (let n = 0; n < 8; n++) { const [a, b] = pos(n), [c, d] = pos(n + 1); let x1, y1, x2, y2; if (b === d) { const f = c > a; x1 = a + (f ? W : 0); x2 = c + (f ? 0 : W); y1 = y2 = b + H / 2; } else { x1 = x2 = a + W / 2; y1 = b + H; y2 = d; } s += `<path class="ar" d="M${x1} ${y1}L${x2} ${y2}" marker-end="url(#ah)"/>`; }
    const [lx, ly] = pos(8), [tx, ty] = pos(2); s += `<path class="ar" stroke-dasharray="5 4" d="M${lx + W} ${ly + H / 2}H920V${ty + H / 2}H${tx + W}" marker-end="url(#ah)"/><text x="928" y="${(ly + ty) / 2 + 40}" font-size="10" fill="#7f8c9a" transform="rotate(90 928 ${(ly + ty) / 2 + 40})" text-anchor="middle">new data → repeat</text>`;
    STAGES.forEach((st, n) => { const [x, y] = pos(n); s += `<g class="nd ${n === S.stage ? 'on' : ''}" data-n="${n}" tabindex="0" role="button" aria-label="Stage ${n + 1}: ${st[0]}"><rect x="${x}" y="${y}" width="${W}" height="${H}"/><text class="n" x="${x + 12}" y="${y + 24}">${String(n + 1).padStart(2, '0')}</text><text class="tt" x="${x + 12}" y="${y + 48}">${st[0].length > 27 ? st[0].replace(/ (\S+)$/, '</tspan><tspan x="' + (x + 12) + '" dy="16">$1') : st[0]}</text></g>`; });
    return `<div class="flow"><div class="ctl"><button class="btn" id="pl">▶ Play walkthrough</button><label>Persistence threshold <input type="range" id="th" min="2" max="20" value="${Math.round(M.THR * 100)}"> <b id="thv"></b></label>${seg('tk', tasks, S.task)}</div><p class="note">Click any stage, or press Play. Changing the threshold or task recomputes the live value of every stage using the same model that drives the other views.</p>${s.replace(/<text class="tt"([^>]*)>(.*?)<\/text>/g, '<text class="tt"$1><tspan>$2</tspan></text>')}</svg><div class="det" id="fd"></div></div>`;
  },
  init() { bind('tk', 'task', () => this.upd()); $('#th').oninput = e => { M.setThr(e.target.value / 100); this.upd(); }; let tm = null; $('#pl').onclick = e => { if (tm) { clearInterval(tm); tm = null; e.target.textContent = '▶ Play walkthrough'; return; } e.target.textContent = '❚❚ Stop'; pick(0); tm = setInterval(() => { if (!$('#pl')) { clearInterval(tm); return; } pick((S.stage + 1) % 9); }, 2600); }; const pick = n => { S.stage = n; $$('.nd').forEach(g => g.classList.toggle('on', +g.dataset.n === n)); this.upd(); }; $$('.nd').forEach(g => { g.onclick = () => pick(+g.dataset.n); g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(+g.dataset.n); } }; }); },
  upd() {
    const s = STAGES[S.stage], n = S.stage;
    $('#fd').innerHTML = `<section class="p"><h3>Stage ${n + 1} · ${s[0]}</h3><p>${s[1]}</p><h4>Data required</h4><p>${s[2]}</p><h4>Calculation</h4><p class="dim" style="font-family:var(--mono);font-size:12px">${s[3]}</p></section>
      <section class="p"><h3>Output and limits</h3><h4>Output</h4><p>${s[4]}</p><h4>Limitations</h4><p>${s[5]}</p><h4>Live value</h4><p class="live">${live(n)}</p><button class="btn" id="op">Open related view →</button></section>`;
    $('#thv').textContent = Math.round(M.THR * 100) + '%'; $('#op').onclick = () => go(['profile', 'profile', 'profile', 'signatures', 'signatures', 'reserve', 'reserve', 'whatif', 'profile'][n]);
  }
};

/* ---------- Shell ---------- */
const TABS = [['nasa', 'NASA EVIDENCE'], ['profile', 'SYNTHETIC CASE'], ['anatomy', '3D ANATOMY'], ['signatures', 'SIGNATURES'], ['reserve', 'FUNCTIONAL RESERVE'], ['whatif', 'WHAT-IF LAB'], ['flow', 'FLOWCHART']];
function go(t) {
  glStop(); S.tab = t; history.replaceState(null, '', '#' + t); const cc = $('#caseControl'); if (cc) cc.hidden = t === 'nasa';
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  $('#main').innerHTML = V[t].html(); V[t].init && V[t].init(); V[t].upd();
}
function boot() {
  $('#ds').textContent = 'NASA EVIDENCE + SYNTHETIC MODEL';
  $('#nav').innerHTML = TABS.map(([t, l]) => `<button data-t="${t}">${l}</button>`).join('');
  $$('#nav button').forEach(b => b.onclick = () => go(b.dataset.t));
  $('#asof').innerHTML = A.slice(1).map((a, j) => `<option value="${j + 1}">${a.tag} · D${a.day}</option>`).join('');
  $('#asof').value = S.idx; $('#asof').onchange = e => { S.idx = +e.target.value; V[S.tab].upd(); };
  const h = location.hash.slice(1); go(V[h] ? h : 'nasa');
}
try { boot(); } catch (e) { $('#main').innerHTML = '<p class="err">ASTRA-FX failed to start: ' + e.message + '</p>'; console.error(e); }
})();
