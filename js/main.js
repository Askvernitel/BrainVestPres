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
  document.querySelectorAll("[data-deck-qr]").forEach((n) => {
    n.addEventListener("load", () => n.closest(".qr").classList.add("has-qr"));
    n.src = D.qr;
  });
  document.title = D.name + " · Pitch";

  // ── Team ──────────────────────────────────────────────────
  const team = document.getElementById("team");
  D.team.forEach((m, i) => {
    const card = document.createElement("div");
    card.className = "member pop";
    card.style.setProperty("--d", (0.4 + i * 0.2).toFixed(2));
    const initials = m.name.split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
    card.innerHTML =
      `<div class="avatar-wrap"><svg class="ring" viewBox="0 0 100 100" aria-hidden="true">` +
      `<circle class="draw" pathLength="1" cx="50" cy="50" r="48.5"/></svg>` +
      `<div class="avatar">${m.photo ? `<img src="${m.photo}" alt="">` : initials}</div></div>` +
      `<strong></strong><span class="role"></span>`;
    card.querySelector("strong").textContent = m.name;
    card.querySelector(".role").textContent = m.role;
    team.appendChild(card);
  });

  // ── Market charts: one small line chart per [data-series] svg ──
  const FMT = {
    k: (v, d) => (d.approx ? "≈" : "") + (v / 1000).toFixed(1) + "k",
    m2: (v, d) => (v / 1000).toFixed(2) + "M",
    usd: (v, d) => (d.approx ? "≈" : "") + "$" + v + "M",
  };
  document.querySelectorAll("svg[data-series]").forEach((svg, n) => {
    const data = D[svg.dataset.series], fmt = FMT[svg.dataset.fmt];
    const base = parseFloat(svg.style.getPropertyValue("--d")) || 0;
    const W = 600, H = 340, padL = 30, padR = 40, padT = 56, padB = 50;
    const vals = data.map((d) => d.value);
    const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
    const min = lo - span * 0.35, max = hi + span * 0.1;
    const x = (i) => padL + (i * (W - padL - padR)) / (data.length - 1);
    const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

    const gid = "areaGrad" + n;
    const g = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, el("defs", {}, svg));
    el("stop", { offset: "0%", "stop-color": "#FFB547", "stop-opacity": 0.3 }, g);
    el("stop", { offset: "100%", "stop-color": "#FFB547", "stop-opacity": 0 }, g);
    el("line", { class: "gridline", x1: padL, x2: W - padR, y1: H - padB, y2: H - padB }, svg);

    const pts = data.map((d, i) => [x(i), y(d.value)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    el("path", { class: "chart-area", d: line + ` L${x(data.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z`, fill: `url(#${gid})` }, svg);
    el("path", { class: "chart-line", d: line, pathLength: 1 }, svg);

    data.forEach((d, i) => {
      const first = i === 0, last = i === data.length - 1;
      const grp = el("g", { class: "chart-pt" + (last ? " last" : ""), style: `--pd:${(base + 0.5 + (i / (data.length - 1)) * 1.3).toFixed(2)}` }, svg);
      el("circle", { cx: pts[i][0], cy: pts[i][1], r: last ? 8 : 5.5 }, grp);
      if (first || last) {
        // first value sits under its point, last value at the top-right corner: neither touches the line
        const ty = first ? pts[i][1] + 40 : padT - 22;
        const t = el("text", { class: "chart-val", x: pts[i][0] + (first ? -4 : 4), y: ty, "text-anchor": first ? "start" : "end" }, grp);
        t.textContent = fmt(d.value, d);
      }
      const yr = el("text", { class: "chart-year", x: pts[i][0], y: H - padB + 34, "text-anchor": "middle" }, svg);
      yr.textContent = "'" + String(d.year).slice(2);
    });
  });

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

  // empty room: walls, floor grid, window; also sets the viewBox
  function buildRoom(svg, extraR = 0) {
    const [minX] = P(0, 8), [maxX] = P(10, 0), [, minY] = P(0, 0, 5), [, maxY] = P(10, 8);
    const pad = 40;
    svg.setAttribute("viewBox", `${minX - pad} ${minY - pad - 30} ${maxX - minX + pad * 2 + extraR} ${maxY - minY + pad * 2 + 30}`);
    const structure = el("g", { class: "structure surf" }, svg);
    el("polygon", { class: "wall", points: poly([[0, 0, 0], [10, 0, 0], [10, 0, 5], [0, 0, 5]]) }, structure);
    el("polygon", { class: "wall", points: poly([[0, 0, 0], [0, 8, 0], [0, 8, 5], [0, 0, 5]]) }, structure);
    el("polygon", { class: "floor", points: poly([[0, 0, 0], [10, 0, 0], [10, 8, 0], [0, 8, 0]]) }, structure);
    for (let i = 1; i < 10; i++) seg(structure, [i, 0, 0], [i, 8, 0], "grid");
    for (let j = 1; j < 8; j++) seg(structure, [0, j, 0], [10, j, 0], "grid");
    // window on back wall
    el("polygon", { class: "window", points: poly([[6.2, 0, 2], [8.8, 0, 2], [8.8, 0, 4.1], [6.2, 0, 4.1]]) }, structure);
    return { maxX, minY };
  }

  function buildScene(svg, opts = {}) {
    const { maxX, minY } = buildRoom(svg, opts.add ? 230 : 0);

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

    if (opts.add) buildAddFromWeb(svg, maxX, minY);

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

  // ── Store integrations (Embawood, Saba, Pinterest…): a browser window whose items
  //    are dragged into the room and drop in as 3D objects (step 4).
  const ADDED = [
    {
      key: "sofa", fp: [6.2, 3.3, 3.0, 1.2], target: [7.7, 3.9, 0.6], delay: 0.7,
      parts: (g, [x, y, w, d]) => {
        box(g, x, y, 0, w, d, 0.5);
        box(g, x, y, 0.5, w, 0.32, 0.85);
        box(g, x, y + 0.32, 0.5, 0.3, d - 0.32, 0.42);
        box(g, x + w - 0.3, y + 0.32, 0.5, 0.3, d - 0.32, 0.42);
      },
    },
    {
      key: "plant", fp: [8.9, 6.3, 0.6, 0.6], target: [9.2, 6.6, 1.2], delay: 2.3,
      parts: (g, [x, y, w, d]) => {
        box(g, x, y, 0, w, d, 0.6, "pot");
        [[0.3, 0.3, 1.5, 34], [0.1, 0.45, 1.15, 24], [0.5, 0.15, 1.2, 24], [0.35, 0.35, 1.95, 22]].forEach(([dx, dy, z, rr]) => {
          const [cx, cy] = P(x + dx, y + dy, z);
          el("ellipse", { class: "leaf", cx, cy, rx: rr, ry: rr * 0.8 }, g);
        });
      },
    },
  ];

  // flat thumbnails shown inside the browser window (tile = 100×80)
  const THUMBS = {
    sofa: (g) => {
      el("rect", { x: 18, y: 26, width: 64, height: 22, rx: 5, fill: "#c96a50" }, g);
      el("rect", { x: 14, y: 40, width: 72, height: 18, rx: 5, fill: "#e07a5f" }, g);
      el("rect", { x: 10, y: 34, width: 12, height: 26, rx: 4, fill: "#b95a42" }, g);
      el("rect", { x: 78, y: 34, width: 12, height: 26, rx: 4, fill: "#b95a42" }, g);
      el("rect", { x: 16, y: 60, width: 4, height: 7, fill: "#6b3a2a" }, g);
      el("rect", { x: 80, y: 60, width: 4, height: 7, fill: "#6b3a2a" }, g);
    },
    plant: (g) => {
      el("path", { d: "M38 50 H62 L58 70 H42 Z", fill: "#c97b4a" }, g);
      [[50, 30, 13], [40, 38, 10], [60, 38, 10], [50, 18, 9]].forEach(([cx, cy, r]) => el("circle", { cx, cy, r, fill: "#4caf6e" }, g));
    },
    lamp: (g) => {
      el("path", { d: "M36 18 H64 L70 40 H30 Z", fill: "#f2c14e" }, g);
      el("rect", { x: 48, y: 40, width: 4, height: 24, fill: "#7a6a55" }, g);
      el("rect", { x: 38, y: 64, width: 24, height: 5, rx: 2, fill: "#7a6a55" }, g);
    },
    frame: (g) => {
      el("rect", { x: 24, y: 14, width: 52, height: 52, rx: 3, fill: "#8a7ad8" }, g);
      el("rect", { x: 30, y: 20, width: 40, height: 40, fill: "#dfe6fb" }, g);
      el("path", { d: "M30 60 L44 42 L52 50 L58 44 L70 60 Z", fill: "#6c8fd9" }, g);
    },
  };

  function buildAddFromWeb(svg, roomMaxX, roomMinY) {
    const bx = roomMaxX - 40, by = roomMinY - 40, bw = 250, bh = 300;
    const win = el("g", { class: "browser" }, svg);
    el("rect", { class: "browser-shadow", x: bx + 6, y: by + 12, width: bw, height: bh, rx: 16 }, win);
    el("rect", { class: "browser-body", x: bx, y: by, width: bw, height: bh, rx: 16 }, win);
    el("path", { class: "browser-bar", d: `M${bx} ${by + 40} V${by + 16} Q${bx} ${by} ${bx + 16} ${by} H${bx + bw - 16} Q${bx + bw} ${by} ${bx + bw} ${by + 16} V${by + 40} Z` }, win);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => el("circle", { cx: bx + 18 + i * 14, cy: by + 20, r: 4.5, fill: c }, win));
    el("rect", { class: "browser-url", x: bx + 66, y: by + 11, width: bw - 80, height: 18, rx: 9 }, win);
    const url = el("text", { class: "browser-url-text", x: bx + 78, y: by + 24 }, win);
    url.textContent = "inspiration board";

    const label = el("text", { class: "browser-label", x: bx + bw / 2, y: by - 18, "text-anchor": "middle" }, win);
    label.textContent = "EMBAWOOD · SABA · PINTEREST";

    const tiles = { sofa: [0, 0], lamp: [1, 0], frame: [0, 1], plant: [1, 1] };
    const bg = { sofa: "#f6e7de", lamp: "#fbf1d6", frame: "#e9e8f8", plant: "#e2f2e5" };
    const tilePos = {};
    for (const k in tiles) {
      const [cx, cy] = tiles[k];
      const tx = bx + 15 + cx * 115, ty = by + 56 + cy * 118;
      tilePos[k] = [tx, ty];
      const t = el("g", { class: "tile", transform: `translate(${tx} ${ty})` }, win);
      el("rect", { width: 105, height: 105, rx: 10, fill: bg[k] }, t);
      const art = el("g", { transform: "translate(2 12)" }, t);
      THUMBS[k](art);
    }

    // 3D versions in the room + the dragged "ghost" thumbnails
    ADDED.forEach((a) => {
      const g = el("g", { class: "added", style: `--ad:${(a.delay + 1.05).toFixed(2)}s` }, svg);
      const [x, y, w, d] = a.fp;
      el("polygon", { class: "footprint landing", points: poly([[x - 0.15, y - 0.15, 0], [x + w + 0.15, y - 0.15, 0], [x + w + 0.15, y + d + 0.15, 0], [x - 0.15, y + d + 0.15, 0]]) }, g);
      a.parts(el("g", { class: "drop" }, g), a.fp);
    });
    ADDED.forEach((a) => {
      const [tx, ty] = tilePos[a.key];
      const [gx, gy] = P(...a.target);
      const ghost = el("g", {
        class: "ghost",
        style: `--gx:${(gx - (tx + 52)).toFixed(1)}px;--gy:${(gy - (ty + 52)).toFixed(1)}px;--gd:${a.delay}s`,
      }, svg);
      const inner = el("g", { transform: `translate(${tx} ${ty})` }, ghost);
      el("rect", { class: "ghost-card", width: 105, height: 105, rx: 10 }, inner);
      THUMBS[a.key](el("g", { transform: "translate(2 12)" }, inner));
      el("path", { class: "cursor", d: "M62 58 L62 92 L70 84 L76 98 L82 95 L76 82 L87 82 Z" }, inner);
    });
  }

  // ── Problem: one bed tours the four corners of an empty room ──
  (function buildProblem() {
    const svg = document.getElementById("scene-problem");
    if (!svg) return;
    buildRoom(svg);
    svg.classList.add("s1");
    const w = 2.6, d = 3.4, m = 0.25;
    const corners = [[m, m], [10 - w - m, m], [10 - w - m, 8 - d - m], [m, 8 - d - m]];
    const rect = (x, y, pad = 0) => poly([[x - pad, y - pad, 0], [x + w + pad, y - pad, 0], [x + w + pad, y + d + pad, 0], [x - pad, y + d + pad, 0]]);

    corners.forEach(([x, y], i) => {
      el("polygon", { class: "spot", points: rect(x, y, 0.08) }, svg);
      const [qx, qy] = P(x + w / 2, y + d / 2, 0.4);
      const q = el("text", { class: "spot-q", x: qx.toFixed(1), y: qy.toFixed(1), style: `--q:${(i * 0.3).toFixed(1)}s` }, svg);
      q.textContent = "?";
    });

    const [x0, y0] = corners[0];
    const vars = ["b", "c", "d"].map((k, i) => {
      const [x, y] = corners[i + 1], dx = x - x0, dy = y - y0;
      return `--${k}x:${((dx - dy) * C).toFixed(1)}px;--${k}y:${((dx + dy) * S).toFixed(1)}px`;
    }).join(";");
    const tour = el("g", { class: "bed-tour", style: vars }, svg);
    el("polygon", { class: "bed-shadow", points: rect(x0, y0, 0.05) }, tour);
    const bed = el("g", { class: "bed bed-hop" }, tour);
    const x = x0, y = y0;
    box(bed, x, y, 0, w, 0.28, 2.0, "wood");                       // headboard against the back
    box(bed, x, y + 0.28, 0, w, d - 0.28, 0.55, "wood");           // frame
    box(bed, x + 0.08, y + 0.32, 0.55, w - 0.16, d - 0.4, 0.42, "mat"); // mattress
    box(bed, x + 0.25, y + 0.45, 0.97, 0.95, 0.6, 0.24, "pil");    // pillows
    box(bed, x + w - 1.2, y + 0.45, 0.97, 0.95, 0.6, 0.24, "pil");
    box(bed, x + 0.04, y + 1.35, 0.6, w - 0.08, d - 1.35, 0.42, "blk"); // blanket
  })();

  const sceneMain = buildScene(document.getElementById("scene-main"), { add: true });
  const sceneClose = buildScene(document.getElementById("scene-close"));
  sceneClose.classList.add("s1", "s2");

  function setStep(scene, step) {
    for (let s = 1; s <= 4; s++) scene.classList.toggle("s" + s, step >= s);
  }

  // ── Count-up numbers ──────────────────────────────────────
  function countUp(slide) {
    slide.querySelectorAll("[data-count]").forEach((n) => {
      const target = +n.dataset.count, suffix = n.dataset.suffix || "", prefix = n.dataset.prefix || "";
      const dec = +(n.dataset.decimals || 0);
      const delay = +(n.dataset.delay || 0), dur = 1600;
      const fmt = (v) => prefix + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
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
  let scanTimer = null;
  const SCAN_DELAY = 250; // ms after the solution slide opens before the scan starts
  function onEnter(slide) {
    if (!slide) return;
    countUp(slide);

    if (slide.classList.contains("s-solution")) {
      // step 1 (Scan) starts on its own when the slide opens; clicks then reveal the rest
      clearTimeout(scanTimer);
      if (!slide.querySelector(".fragment.visible")) {
        scanTimer = setTimeout(() => {
          if (Reveal.getCurrentSlide() === slide && !slide.querySelector(".fragment.visible")) Reveal.nextFragment();
        }, SCAN_DELAY);
      }
      setStep(sceneMain, slide.querySelectorAll(".fragment.visible").length);
    } else {
      setStep(sceneMain, 0); // reset, so the scan replays next time the slide opens
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
  Reveal.on("fragmenthidden", () => {
    const cur = Reveal.getCurrentSlide();
    // going back past Scan leaves the slide instead of showing an empty room
    if (cur && cur.classList.contains("s-solution") && !cur.querySelector(".fragment.visible")) Reveal.prev();
    else syncFrag();
  });
})();
