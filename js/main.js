(function () {
  const D = window.DECK;
  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // ── Brand text / logo ─────────────────────────────────────
  document.querySelectorAll("[data-deck]").forEach((n) => (n.textContent = D[n.dataset.deck] || ""));
  document.querySelectorAll("[data-deck-logo]").forEach((n) => (n.src = D.logo));
  document.title = D.name + " · Pitch";

  // ── Team ──────────────────────────────────────────────────
  const team = document.getElementById("team");
  D.team.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "member flip";
    card.style.setProperty("--d", (0.3 + i * 0.15).toFixed(2));
    const initials = m.name.split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
    card.innerHTML =
      `<div class="avatar">${m.photo ? `<img src="${m.photo}" alt="">` : initials}</div>` +
      `<strong></strong><span></span>`;
    card.querySelector("strong").textContent = m.name;
    card.querySelector("span").textContent = m.role;
    team.appendChild(card);
  });

  // ── Housing chart ─────────────────────────────────────────
  (function buildChart() {
    const svg = document.getElementById("housing-chart");
    const data = D.housing;
    const W = 1000, H = 560, padL = 40, padR = 60, padT = 70, padB = 70;
    const min = 20000, max = 46000;
    const x = (i) => padL + (i * (W - padL - padR)) / (data.length - 1);
    const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

    const defs = el("defs", {}, svg);
    const g = el("linearGradient", { id: "areaGrad", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0%", "stop-color": "#FFB547", "stop-opacity": 0.35 }, g);
    el("stop", { offset: "100%", "stop-color": "#FFB547", "stop-opacity": 0 }, g);

    // baseline gridlines
    [25000, 35000, 45000].forEach((v) =>
      el("line", { class: "gridline", x1: padL, x2: W - padR, y1: y(v), y2: y(v) }, svg)
    );

    const pts = data.map((d, i) => [x(i), y(d.value)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${x(data.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z`;
    el("path", { class: "chart-area", d: area }, svg);
    el("path", { class: "chart-line", d: line, pathLength: 1 }, svg);

    data.forEach((d, i) => {
      const delay = (0.5 + (i / (data.length - 1)) * 1.4).toFixed(2);
      const last = i === data.length - 1;
      const grp = el("g", { class: "chart-pt" + (last ? " last" : ""), style: `--d:${delay}` }, svg);
      if (last) el("circle", { class: "halo", cx: pts[i][0], cy: pts[i][1], r: 22 }, grp);
      el("circle", { cx: pts[i][0], cy: pts[i][1], r: last ? 10 : 7 }, grp);
      const t = el("text", { class: "chart-val", x: pts[i][0], y: pts[i][1] - 26, "text-anchor": "middle" }, grp);
      t.textContent = (d.approx ? "≈" : "") + (d.value / 1000).toFixed(1) + "k";
      const yr = el("text", { class: "chart-year", x: pts[i][0], y: H - padB + 46, "text-anchor": "middle" }, svg);
      yr.textContent = d.year;
    });
  })();

  // ── Grant donut + legend ──────────────────────────────────
  (function buildDonut() {
    const svg = document.getElementById("grant-donut");
    const legend = document.getElementById("grant-legend");
    el("circle", { class: "donut-track", cx: 100, cy: 100, r: 78 }, svg);
    let off = 0;
    const gap = 1.2;
    D.grant.forEach((s, i) => {
      const c = el("circle", {
        class: "donut-seg", cx: 100, cy: 100, r: 78, pathLength: 100,
        transform: "rotate(-90 100 100)",
        style: `--v:${s.pct - gap};--off:${-off};--d:${(0.3 + i * 0.35).toFixed(2)};stroke:${s.color}`,
      }, svg);
      c.style.strokeDasharray = `${s.pct - gap} 100`;
      c.style.strokeDashoffset = -off;
      off += s.pct;

      const li = document.createElement("li");
      li.className = "rise";
      li.style.setProperty("--d", (0.4 + i * 0.35).toFixed(2));
      li.innerHTML = `<i style="background:${s.color}"></i><b data-count="${s.pct}" data-suffix="%" data-delay="${400 + i * 350}">${s.pct}%</b><span></span>`;
      li.querySelector("span").textContent = s.label;
      legend.appendChild(li);
    });
  })();

  // ── Isometric room scene ──────────────────────────────────
  // Room: x 0..10, y 0..8, walls 5 high. Projection: 2:1 isometric.
  const U = 46, C = U * 0.866, S = U * 0.5, HZ = U * 0.82;
  const P = (x, y, z = 0) => [(x - y) * C, (x + y) * S - z * HZ];
  const poly = (pts) => pts.map((p) => P(...p).map((v) => v.toFixed(1)).join(",")).join(" ");

  function box(parent, x, y, z, w, d, h, cls = "") {
    const g = el("g", { class: "part " + cls }, parent);
    el("polygon", { class: "fy", points: poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
    el("polygon", { class: "fx", points: poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]) }, g);
    el("polygon", { class: "top", points: poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]) }, g);
    return g;
  }
  const seg = (parent, a, b, cls) => {
    const [x1, y1] = P(...a), [x2, y2] = P(...b);
    return el("line", { class: cls, x1, y1, x2, y2 }, parent);
  };

  // furniture definitions: footprint + parts + move delta (room units)
  function table(x, y) {
    const w = 2.8, d = 1.8, lh = 1.25, l = 0.22;
    return {
      fp: [x, y, w, d],
      parts: (g) => {
        [[x, y], [x + w - l, y], [x, y + d - l], [x + w - l, y + d - l]].forEach(([lx, ly]) => box(g, lx, ly, 0, l, l, lh));
        box(g, x - 0.1, y - 0.1, lh, w + 0.2, d + 0.2, 0.22, "slab");
      },
    };
  }
  function chair(x, y, backFar) {
    const s = 0.95, lh = 0.75, l = 0.14, bt = 0.14;
    return {
      fp: [x, y, s, s],
      parts: (g) => {
        [[x, y], [x + s - l, y], [x, y + s - l], [x + s - l, y + s - l]].forEach(([lx, ly]) => box(g, lx, ly, 0, l, l, lh));
        box(g, x, y, lh, s, s, 0.16);
        if (backFar) box(g, x, y, lh + 0.16, s, bt, 1.0);
        else box(g, x, y + s - bt, lh + 0.16, s, bt, 1.0);
      },
    };
  }
  function drawer(x, y) {
    const w = 1.7, d = 1.1, h = 2.5;
    return {
      fp: [x, y, w, d],
      parts: (g) => {
        box(g, x, y, 0, w, d, h);
        [h / 3, (2 * h) / 3].forEach((z) => seg(g, [x, y + d, z], [x + w, y + d, z], "detail"));
        [h / 6, h / 2, (5 * h) / 6].forEach((z) => seg(g, [x + w * 0.4, y + d, z], [x + w * 0.6, y + d, z], "handle"));
      },
    };
  }

  // painter order: back to front by footprint centre (x+y)
  const FURNITURE = [
    { ...drawer(1.0, 0.25), move: [4.1, 0] },
    { ...chair(4.25, 2.05, true), move: [-2.6, 1.6] },
    { ...chair(5.55, 2.05, true), move: [-2.6, 1.6] },
    { ...drawer(7.0, 0.25), move: [0, 0] },
    { ...table(3.95, 3.25), move: [-2.6, 1.6] },
    { ...chair(4.25, 5.35, false), move: [-2.6, 1.6] },
    { ...chair(5.55, 5.35, false), move: [-2.6, 1.6] },
  ];

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildScene(svg) {
    const [minX] = P(0, 8), [maxX] = P(10, 0), [, minY] = P(0, 0, 5), [, maxY] = P(10, 8);
    const pad = 40;
    svg.setAttribute("viewBox", `${minX - pad} ${minY - pad - 30} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2 + 30}`);

    const structure = el("g", { class: "structure surf" }, svg);
    el("polygon", { class: "wall", points: poly([[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5]]) }, structure);
    el("polygon", { class: "wall", points: poly([[0, 0, 0], [0, 8, 0], [0, 8, 5], [0, 0, 5]]) }, structure);
    el("polygon", { class: "floor", points: poly([[0, 0, 0], [10, 0, 0], [10, 8, 0], [0, 8, 0]]) }, structure);
    for (let i = 1; i < 10; i++) seg(structure, [i, 0, 0], [i, 8, 0], "grid");
    for (let j = 1; j < 8; j++) seg(structure, [0, j, 0], [10, j, 0], "grid");
    // window on back wall
    el("polygon", { class: "window", points: poly([[6.2, 0, 2], [8.8, 0, 2], [8.8, 0, 4.1], [6.2, 0, 4.1]]) }, structure);

    FURNITURE.forEach((f, i) => {
      const [dx, dy] = f.move;
      const [tx, ty] = [(dx - dy) * C, (dx + dy) * S];
      const fg = el("g", { class: "f", style: `--i:${i}` }, svg);
      const move = el("g", { class: "move", style: `--tx:${tx.toFixed(1)}px;--ty:${ty.toFixed(1)}px` }, fg);
      const [x, y, w, d] = f.fp;
      el("polygon", { class: "footprint", points: poly([[x - 0.1, y - 0.1, 0], [x + w + 0.1, y - 0.1, 0], [x + w + 0.1, y + d + 0.1, 0], [x - 0.1, y + d + 0.1, 0]]) }, move);
      const lift = el("g", { class: "lift surf" }, move);
      f.parts(lift);
    });

    // scan point cloud
    const r = rng(7);
    const cloud = el("g", { class: "cloud" }, svg);
    const surfaces = [
      { o: [0, 0, 0], a: [10, 0, 0], b: [0, 0, 5], n: 260 },
      { o: [0, 0, 0], a: [0, 8, 0], b: [0, 0, 5], n: 210 },
      { o: [0, 0, 0], a: [10, 0, 0], b: [0, 8, 0], n: 380 },
    ];
    FURNITURE.forEach((f) => {
      const [x, y, w, d] = f.fp;
      const h = w > 2 ? 1.47 : w > 1.5 ? 2.5 : 0.91;
      surfaces.push({ o: [x, y, h], a: [w, 0, 0], b: [0, d, 0], n: 30 });
      surfaces.push({ o: [x, y + d, 0], a: [w, 0, 0], b: [0, 0, h], n: 22 });
      surfaces.push({ o: [x + w, y, 0], a: [0, d, 0], b: [0, 0, h], n: 18 });
    });
    surfaces.forEach((s) => {
      for (let k = 0; k < s.n; k++) {
        const u = r(), v = r();
        const p = [0, 1, 2].map((ax) => s.o[ax] + u * s.a[ax] + v * s.b[ax]);
        const [cx, cy] = P(...p);
        el("circle", { class: "dot", cx: cx.toFixed(1), cy: cy.toFixed(1), r: (1.2 + r() * 1.4).toFixed(2), style: `--d:${(r() * 0.9).toFixed(2)}s` }, cloud);
      }
    });
    return svg;
  }

  const sceneMain = buildScene(document.getElementById("scene-main"));
  const sceneClose = buildScene(document.getElementById("scene-close"));
  sceneClose.classList.add("s1", "s2");

  function setStep(scene, step) {
    for (let s = 1; s <= 3; s++) scene.classList.toggle("s" + s, step >= s);
  }

  // ── Count-up numbers ──────────────────────────────────────
  function countUp(slide) {
    slide.querySelectorAll("[data-count]").forEach((n) => {
      const target = +n.dataset.count, suffix = n.dataset.suffix || "";
      const delay = +(n.dataset.delay || 0), dur = 1600;
      const fmt = (v) => Math.round(v).toLocaleString("en-US") + suffix;
      if (reduceMotion) { n.textContent = fmt(target); return; }
      n.textContent = fmt(0);
      const t0 = performance.now() + delay;
      cancelAnimationFrame(n._raf);
      const tick = (t) => {
        const p = Math.min(1, Math.max(0, (t - t0) / dur));
        n.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) n._raf = requestAnimationFrame(tick);
      };
      n._raf = requestAnimationFrame(tick);
    });
  }

  // ── Demo video ────────────────────────────────────────────
  const video = document.getElementById("demo-video");
  video.poster = D.demoPoster;
  video.addEventListener("loadeddata", () => video.closest(".demo-wrap").classList.add("has-video"));
  video.src = D.demoVideo;

  // ── Reveal ────────────────────────────────────────────────
  Reveal.initialize({
    width: 1920,
    height: 1080,
    margin: 0,
    center: false,
    hash: true,
    controls: true,
    controlsLayout: "bottom-right",
    progress: true,
    slideNumber: false,
    transition: "fade",
    transitionSpeed: "default",
    backgroundTransition: "fade",
    plugins: [RevealNotes],
  });

  let loopTimer = null;
  function onEnter(slide) {
    if (!slide) return;
    countUp(slide);

    if (slide.classList.contains("s-solution")) {
      setStep(sceneMain, slide.querySelectorAll(".fragment.visible").length);
    }

    if (slide.classList.contains("s-demo")) video.play().catch(() => {});
    else video.pause();

    clearInterval(loopTimer);
    if (slide.classList.contains("s-close")) {
      sceneClose.classList.remove("s3");
      if (!reduceMotion) loopTimer = setInterval(() => sceneClose.classList.toggle("s3"), 3600);
    }
  }

  Reveal.on("ready", (e) => onEnter(e.currentSlide));
  Reveal.on("slidechanged", (e) => onEnter(e.currentSlide));
  const syncFrag = () => {
    const cur = Reveal.getCurrentSlide();
    if (cur && cur.classList.contains("s-solution")) setStep(sceneMain, cur.querySelectorAll(".fragment.visible").length);
  };
  Reveal.on("fragmentshown", syncFrag);
  Reveal.on("fragmenthidden", syncFrag);
})();
