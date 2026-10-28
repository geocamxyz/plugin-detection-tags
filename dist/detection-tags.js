const c = (p, d = {}, f = "") => {
  const u = document.createElement(p);
  for (let g in d)
    u.setAttribute(g, d[g]);
  return u.innerHTML = f, u;
}, Oe = (p, d) => {
  if (!document.getElementById(p)) {
    const f = c("STYLE", { type: "text/css", id: p }, d);
    document.getElementsByTagName("head")[0].prepend(f);
  }
  return !0;
}, ze = `
  /* The Expand positions and frames the panel, but esri-expand__content is
     transparent — without an explicit background the map shows through. Border
     and shadow are left to Esri; only the fill is ours. */
  .gdt-panel { width: 240px; max-height: 60vh; overflow-y: auto; font: 13px/1.4 system-ui, sans-serif;
    color: #1f2328; background: #fff; padding: 10px; box-sizing: border-box; }
  .gdt-h { font-size: 12px; font-weight: 600; color: rgba(31,35,40,.6); display: flex;
    align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .gdt-clear { border: none; background: none; font: inherit; font-size: 11px; color: #0d9488;
    cursor: pointer; padding: 0; }
  .gdt-clear[disabled] { color: rgba(31,35,40,.3); cursor: default; }
  .gdt-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
  .gdt-li { display: flex; align-items: center; gap: 8px; border: 1px solid rgba(15,16,6,.1);
    border-radius: 8px; padding: 5px 8px; cursor: pointer; background: none; width: 100%;
    font: inherit; text-align: left; color: inherit; }
  .gdt-li:hover:not(.gdt-full) { border-color: #0d9488; }
  .gdt-li.active { border-color: #0d9488; background: rgba(13,148,136,.08); font-weight: 600; }
  .gdt-full { color: rgba(31,35,40,.38); cursor: default; }
  .gdt-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gdt-count { font-size: 11px; color: rgba(31,35,40,.5); font-variant-numeric: tabular-nums; }
  .gdt-foot { margin-top: 8px; padding-top: 7px; border-top: 1px solid rgba(15,16,6,.08);
    display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .gdt-note { margin-top: 6px; font-size: 11px; color: rgba(31,35,40,.5); }
  /* Esri applies expandIconClass to a span where it would otherwise put an
     icon-font glyph, so this has to give itself a box to paint into. The same
     class is reused on the disabled plain button, which mimics the markup of a
     collapsed Expand. */
  .geocam-detection-tags-icon { display: inline-block; width: 16px; height: 16px;
    vertical-align: middle; background-repeat: no-repeat; background-position: center;
    background-size: 16px 16px; }
  .gdt-off { opacity: .4; cursor: default; }

  /* The viewer panel sits over the imagery, so it follows the viewer's own
     enhancement panel — dark and translucent — rather than the map panel's
     white card, which would read as a foreign object on a photograph. */
  .gdt-v-panel { position: absolute; top: 0; left: 56px; background: rgba(0,0,0,.45);
    border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: 12px; color: #fff;
    font: 12px/1.4 system-ui, sans-serif; min-width: 220px; max-width: calc(100% - 72px);
    max-height: 60vh; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,.25);
    backdrop-filter: blur(6px); pointer-events: auto; z-index: 5; }
  .gdt-v-panel.is-hidden { display: none; }
  .gdt-v-head { font-size: 12px; font-weight: 600; letter-spacing: .03em;
    text-transform: uppercase; margin-bottom: 10px; }
  /* Two real columns, so the counts sit under each other and every first
     chip starts at the same x. A per-row flex cannot do that: the chip group
     is a different width on every row, which pushes everything before it
     around. The row wrapper is gone for the same reason — name and chips are
     grid items in their own right. */
  .gdt-v-list { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px;
    align-items: center; }
  .gdt-v-name { min-width: 0; display: flex; align-items: center; gap: 10px;
    background: none; border: 1px solid transparent; border-radius: 6px; padding: 3px 6px;
    color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .gdt-v-name:hover { border-color: rgba(255,255,255,.35); }
  .gdt-v-name.active { border-color: #2dd4bf; background: rgba(45,212,191,.15); font-weight: 600; }
  .gdt-v-label { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gdt-v-count { opacity: .6; font-variant-numeric: tabular-nums; }
  .gdt-v-chips { display: flex; flex-wrap: wrap; gap: 3px; justify-self: start; }
  .gdt-v-chip { min-width: 20px; height: 20px; padding: 0 4px; border-radius: 4px;
    border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); color: #fff;
    font: 11px/1 system-ui, sans-serif; cursor: pointer; }
  .gdt-v-chip:hover { background: rgba(255,255,255,.22); }
  /* A detection outside the lens circle has nowhere to turn to. Shown struck
     through rather than hidden, so a click gets an explanation. */
  .gdt-v-chip.gdt-chip-dead { opacity: .35; text-decoration: line-through; cursor: default; }
  .gdt-v-more { opacity: .55; font-size: 11px; align-self: center; }
  .gdt-v-note { opacity: .7; grid-column: 1 / -1; }
  .gdt-v-foot { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.15);
    display: flex; align-items: center; gap: 6px; cursor: pointer; }
  /* The viewer puts a control's icon on the button as a centred background
     image — no child element. A 16px span inside a 32px button is what left
     this one sitting up in the corner. White, because this strip is dark;
     the map's copy of the same glyph is black against Esri's white button. */
  /* Two classes deliberately: injectStyle PREPENDS this sheet to head, so at
     equal specificity the viewer's own .geocam-viewer-control-button wins and
     background-size stays "cover", stretching the glyph to the edges. */
  .geocam-viewer-control-button.gdt-v-toggle { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>');
    background-size: 20px 20px; background-repeat: no-repeat; background-position: center;
    color: transparent; }
  /* Same active treatment as the viewer's own enhancement toggle. */
  .geocam-viewer-control-button.gdt-v-toggle:hover,
  .geocam-viewer-control-button.gdt-v-toggle.is-open {
    background-color: rgba(77, 163, 255, .8); border-color: rgba(77, 163, 255, .9);
    box-shadow: 0 0 12px rgba(77, 163, 255, .35); }
  .geocam-detection-tags-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;
const Fe = function(p = {}) {
  let d, f, u, g, v, w, b;
  const h = p.mapView;
  let x = null, P = [], A = null, k = null, R = !0, N = null, _ = null, ne = !1;
  const j = [];
  let T = null, O = !0, D = !1, L, E, y, S;
  Oe("geocam-detection-tags", ze);
  const ge = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return p.token && n.set("token", p.token), `${e}?${n}`;
  }, oe = async (e, t = {}) => {
    const o = await (await fetch(ge(e, t), {
      credentials: "same-origin"
    })).json();
    if (o && o.error)
      throw new Error(`${o.error.code}: ${o.error.message}`);
    return o;
  }, he = async () => {
    if (p.src) return p.src.replace(/\/+$/, "");
    if (!p.connectorSrc) return null;
    const e = new URL(p.connectorSrc.replace(/\/+$/, ""), window.location.href).href, t = await oe(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, fe = async () => {
    const e = await oe(`${x}/0`);
    return A = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null,
      // Which segmentation runs found this category, and where each keeps
      // its masks: [{ id, count, masks: { capture => base path } }]. A cell
      // can hold several unrelated summaries, so this is the only thing
      // tying a tag back to the annotations that produced it.
      summaries: Array.isArray(t.summaries) ? t.summaries : []
    }));
  }, ae = () => {
    if (N) return N;
    const e = h && h.map && h.map.allLayers || [];
    return N = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), N;
  }, me = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, Y = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...o) => t(o), n);
  }), we = async () => {
    if (!p.token || ne) return;
    const [e] = await Y(["esri/identity/IdentityManager"]);
    e.registerToken({ server: x, token: p.token }), ne = !0;
  }, ve = () => {
    if (_) {
      try {
        h.map.remove(_);
      } catch {
      }
      _ = null;
    }
  }, z = async (e) => {
    const t = ae();
    if (ve(), t && (t.opacity = e && R ? 0.15 : 1), !e) return;
    const n = k, [o] = await Y(["esri/layers/FeatureLayer"]);
    await we(), k === n && (_ = new o({
      url: `${x}/0`,
      // No token here: Esri strips `token` from customParameters because it
      // manages credentials itself, which silently 403s the layer's own
      // metadata request. It goes through IdentityManager instead.
      customParameters: { tags: e },
      outFields: [],
      popupEnabled: !1,
      legendEnabled: !1,
      listMode: "hide",
      // not a layer the operator manages; keep it out of LayerList
      renderer: { type: "simple", symbol: me }
    }), h.map.add(_));
  }, be = "rgb(255, 0, 255)", ye = 0.45, xe = 2048, q = /* @__PURE__ */ new Set(), X = () => d && typeof d.imageOverlay == "function", se = (e) => {
    if (Array.isArray(e)) return e;
    if (typeof e != "string") return [];
    const t = [];
    let n = 0;
    for (; n < e.length; ) {
      let o = 0, a = 0, s = 1;
      for (; s; ) {
        const i = e.charCodeAt(n) - 48;
        o |= (i & 31) << 5 * a, s = i & 32, n += 1, a += 1, !s && i & 16 && (o |= -1 << 5 * a);
      }
      t.length > 2 && (o += t[t.length - 2]), t.push(o);
    }
    return t;
  }, ke = (e, t, n, o) => {
    const a = Math.floor(t / o), s = Math.floor(n / o), i = t % o, l = n % o;
    if (a === s) {
      e.fillRect(a, i, 1, l - i + 1);
      return;
    }
    e.fillRect(a, i, 1, o - i), s - a > 1 && e.fillRect(a + 1, 0, s - a - 1, o), e.fillRect(s, 0, 1, l + 1);
  }, Ce = (e, t, n) => {
    const o = se(t.counts);
    let a = 0;
    for (let s = 0; s < o.length; s += 1)
      s % 2 === 1 && o[s] > 0 && ke(e, a, a + o[s] - 1, n), a += o[s];
  }, Ee = (e) => {
    const t = e[0].segmentation.size || [], n = t[0], o = t[1];
    if (!n || !o) return null;
    const a = document.createElement("canvas");
    a.width = o, a.height = n;
    const s = a.getContext("2d");
    s.fillStyle = be, e.forEach((m) => {
      const C = m.segmentation || {};
      (C.size || [])[0] === n && (C.size || [])[1] === o && Ce(s, C, n);
    });
    const i = Math.min(1, xe / o), l = document.createElement("canvas");
    l.width = Math.round(o * i), l.height = Math.round(n * i);
    const r = l.getContext("2d");
    return r.globalAlpha = ye, r.drawImage(a, 0, 0, l.width, l.height), l;
  }, Se = (e, t) => {
    const n = new URL(t, window.location.href).pathname.split("/").filter(Boolean).slice(-3).join("/").replace(/\.[^.]+$/, "");
    return new URL(`${e.replace(/\/+$/, "")}/${n}.json`, x).href;
  }, Ae = async (e, t) => {
    try {
      const n = await fetch(Se(e, t), {
        credentials: "same-origin"
      });
      return n.ok ? await n.json() : null;
    } catch (n) {
      return console.warn("detection-tags: could not read masks", e, n), null;
    }
  }, F = () => {
    X() && (q.forEach((e) => d.imageOverlay(e, null)), q.clear());
  }, Te = (e) => {
    const t = /* @__PURE__ */ new Set();
    return P.forEach(
      (n) => (n.summaries || []).forEach((o) => {
        const a = o.masks && o.masks[e];
        a && t.add(a);
      })
    ), [...t];
  }, Le = (e, t, n, o) => {
    const a = Math.floor(e / n), s = Math.floor(t / n), i = e % n, l = t % n;
    if (a === s) return o(a, i, l);
    o(a, i, n - 1);
    for (let r = a + 1; r < s; r++) o(r, 0, n - 1);
    o(s, 0, l);
  }, Ie = 512, $e = (e) => {
    const t = e.size || [], n = t[0], o = t[1];
    if (!n || !o) return null;
    const a = se(e.counts);
    let s = 0, i = 0, l = 0;
    const r = [];
    let m = 0, C = 1, J = 0;
    for (let M = 0; M < a.length; M++)
      M % 2 === 1 && a[M] > 0 && Le(J, J + a[M] - 1, n, (pe, Q, Z) => {
        const ee = Z - Q + 1;
        if (s += ee, i += pe * ee, l += (Q + Z) / 2 * ee, m++ % C === 0 && (r.push([pe, Q + Z >> 1]), r.length >= Ie)) {
          let ue = 0;
          for (let te = 1; te < r.length; te += 2)
            r[ue++] = r[te];
          r.length = ue, C *= 2;
        }
      }), J += a[M];
    return s ? { width: o, height: n, pixels: s, cx: i / s, cy: l / s, candidates: r } : null;
  }, Me = 64, G = () => typeof d.directionForImagePoint == "function", Pe = (e, t) => {
    if (!t || !G()) return null;
    const { width: n, height: o, cx: a, cy: s, candidates: i } = t, l = i.map(([r, m]) => ({ u: r / n, v: m / o, d: (r - a) ** 2 + (m - s) ** 2 })).sort((r, m) => r.d - m.d).slice(0, Me);
    for (const r of l)
      if (d.directionForImagePoint(e, r.u, r.v)) return { u: r.u, v: r.v };
    return null;
  };
  let $ = [], W = 0, V = !1;
  const H = () => {
    W += 1, $ = [], V = !1;
  }, re = async () => {
    H();
    const e = W;
    if (!d.visible()) return I();
    const t = (d.shotInfo() || {}).capture, n = d.urls() || [], o = Te(t);
    if (!o.length || !n.length)
      return console.info(
        "detection-tags: nothing to read for this shot — " + (n.length ? `no summary records masks for capture ${t}` : "no images on screen")
      ), I();
    V = !0, I();
    const a = await Promise.all(
      n.flatMap(
        (i, l) => o.map(
          (r) => Ae(r, i).then((m) => ({ camera: l, doc: m }))
        )
      )
    );
    if (e !== W) return;
    const s = /* @__PURE__ */ new Map();
    a.forEach(({ camera: i, doc: l }) => {
      l && (l.annotations || []).forEach((r) => {
        if (!r || !r.category_name || !r.segmentation) return;
        const m = $e(r.segmentation);
        if (!m) return;
        const C = s.get(r.category_name) || {
          category: r.category_name,
          colour: r.category_color,
          instances: []
        };
        C.instances.push({ camera: i, segmentation: r.segmentation, measured: m, aim: void 0 }), s.set(r.category_name, C);
      });
    }), $ = [...s.values()].map((i) => (i.instances.sort(
      (l, r) => l.camera - r.camera || r.measured.pixels - l.measured.pixels
    ), i)).sort((i, l) => i.category.localeCompare(l.category)), V = !1, I(), U();
  }, U = () => {
    try {
      _e();
    } catch (e) {
      console.warn("detection-tags: could not draw masks", e);
    }
  }, _e = () => {
    if (F(), !X() || !d.visible() || !O || !T) return;
    const e = $.find((n) => n.category === T);
    if (!e) return;
    const t = /* @__PURE__ */ new Map();
    e.instances.forEach((n) => {
      const o = t.get(n.camera) || [];
      o.push({ segmentation: n.segmentation }), t.set(n.camera, o);
    }), t.forEach((n, o) => {
      const a = Ee(n);
      a && (d.imageOverlay(o, a), q.add(o));
    });
  }, De = (e, t, n) => {
    if (t.aim === void 0 && (t.aim = Pe(t.camera, t.measured)), !t.aim) {
      n.classList.add("gdt-chip-dead"), n.title = `This ${e.category} is outside the lens circle, so there is nowhere to turn`;
      return;
    }
    T !== e.category && (T = e.category, U()), d.lookAtImagePoint(t.camera, t.aim.u, t.aim.v), I();
  }, Ve = (e) => {
    T = T === e ? null : e, U(), I();
  }, K = 9, I = () => {
    if (y && (y.innerHTML = "", E.classList.toggle("is-hidden", !D), S && (S.checked = O), !!D)) {
      if (V) {
        y.appendChild(c("DIV", { class: "gdt-v-note" }, "reading detections&hellip;"));
        return;
      }
      if (!$.length) {
        y.appendChild(
          c("DIV", { class: "gdt-v-note" }, "No detections in this shot.")
        );
        return;
      }
      G() || y.appendChild(
        c("DIV", { class: "gdt-v-note" }, "Viewer too old to centre on a detection.")
      ), $.forEach((e) => {
        const t = c("BUTTON", {
          class: `gdt-v-name${T === e.category ? " active" : ""}`,
          type: "button",
          title: `Draw every ${e.category} in this shot`
        });
        t.appendChild(c("SPAN", { class: "gdt-v-label" }, e.category)), t.appendChild(c("SPAN", { class: "gdt-v-count" }, String(e.instances.length))), t.addEventListener("click", () => Ve(e.category)), y.appendChild(t);
        const n = c("DIV", { class: "gdt-v-chips" });
        G() && (e.instances.slice(0, K).forEach((o, a) => {
          const s = c("BUTTON", {
            class: `gdt-v-chip${o.aim === null ? " gdt-chip-dead" : ""}`,
            type: "button",
            title: `Centre on ${e.category} ${a + 1} (camera ${o.camera})`
          }, String(a + 1));
          s.addEventListener("click", () => De(e, o, s)), n.appendChild(s);
        }), e.instances.length > K && n.appendChild(
          c("SPAN", { class: "gdt-v-more" }, `+${e.instances.length - K}`)
        )), y.appendChild(n);
      });
    }
  }, ie = (e) => {
    D = e, L.classList.toggle("is-open", e), e && !$.length && !V ? re() : I();
  }, Re = () => {
    L = c("DIV", {
      class: "geocam-viewer-control-button gdt-v-toggle",
      role: "button",
      title: "Detections in this image"
    }), L.addEventListener("click", () => ie(!D)), E = c("DIV", { class: "gdt-v-panel is-hidden" });
    const e = c("DIV", { class: "gdt-v-head" }, "Detections in this image");
    E.appendChild(e), y = c("DIV", { class: "gdt-v-list" }), E.appendChild(y);
    const t = c("LABEL", { class: "gdt-v-foot" });
    return S = c("INPUT", { type: "checkbox" }), S.checked = O, S.addEventListener("change", () => {
      O = S.checked, U();
    }), t.appendChild(S), t.appendChild(c("SPAN", {}, "show masks")), E.appendChild(t), L;
  }, le = async (e) => {
    if (!e || k === e.field) {
      k = null, z(null), B();
      return;
    }
    k = e.field, B();
    try {
      await z(e.field);
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), k = null, z(null), B();
    }
  }, ce = (e) => e.count !== null && A !== null && e.count >= A, B = () => {
    v.innerHTML = "";
    const e = [...P].sort((a, s) => a.count === s.count ? a.label.localeCompare(s.label) : a.count === null ? 1 : s.count === null ? -1 : a.count - s.count), t = p.hideFullCoverage ? e.filter((a) => !ce(a)) : e;
    t.forEach((a) => {
      const s = ce(a), i = ["gdt-li"];
      k === a.field && i.push("active"), s && i.push("gdt-full");
      const l = c("BUTTON", {
        class: i.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: s ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      l.appendChild(c("SPAN", { class: "gdt-name" }, a.label)), l.appendChild(
        c(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${A ? ` / ${A}` : ""}`
        )
      ), s || l.addEventListener("click", () => le(a)), v.appendChild(l);
    }), w.disabled = !k;
    const n = e.length - t.length, o = g.querySelector(".gdt-note");
    o && o.remove(), n > 0 && g.appendChild(
      c(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, Ne = () => {
    g = c("DIV", { class: "gdt-panel" });
    const e = c("DIV", { class: "gdt-h" });
    e.appendChild(c("SPAN", {}, "Detections")), w = c("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), w.disabled = !0, w.addEventListener("click", () => le(null)), e.appendChild(w), g.appendChild(e), v = c("UL", { class: "gdt-list" }), g.appendChild(v);
    const t = c("LABEL", { class: "gdt-foot" });
    return b = c("INPUT", { type: "checkbox" }), b.checked = R, b.addEventListener("change", () => {
      R = b.checked;
      const n = ae();
      n && (n.opacity = k && R ? 0.15 : 1);
    }), t.appendChild(b), t.appendChild(c("SPAN", {}, "fade the rest")), g.appendChild(t), g;
  }, de = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    d = e;
    try {
      if (x = await he(), !x)
        return de(
          p.connectorSrc ? `no geocam.v2Path advertised by ${p.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", x), P = await fe();
    } catch (n) {
      return de(`${x || p.connectorSrc} — ${n.message}`);
    }
    const t = P.length === 0;
    if (t && console.info(`detection-tags: no tag_* fields on ${x}/0 — showing disabled`), t)
      u = c("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed"
      }), u.appendChild(c("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })), h.ui.add(u, "top-right");
    else {
      const [n] = await Y(["esri/widgets/Expand"]);
      if (f = new n({
        view: h,
        content: Ne(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: !1
      }), h.ui.add(f, "top-right"), B(), X()) {
        d.addControl(Re(), "left-bottom");
        const o = L.closest(".geocam-viewer-controls") || d.element && d.element.querySelector(".geocam-viewer-controls");
        o ? o.appendChild(E) : console.warn("detection-tags: no control strip to hang the panel on"), j.push(
          d.urls(() => {
            H(), F(), D && re();
          })
        ), j.push(
          d.visible((a) => {
            a || (H(), F(), ie(!1));
          })
        );
      } else
        console.info(
          "detection-tags: viewer has no imageOverlay — categories only, no masks"
        );
    }
    console.info(
      `detection-tags: ${P.length} categories, shot total ${A === null ? "unknown" : A} — added to the map UI${t ? " (disabled)" : ""}`
    );
  }, this.destroy = function() {
    z(null), j.splice(0).forEach((e) => e()), F(), H(), f && (h && h.ui && h.ui.remove(f), f.destroy()), u && (h && h.ui && h.ui.remove(u), u.parentNode && u.parentNode.removeChild(u)), [L, E].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), f = u = g = v = w = b = null, L = E = y = S = null;
  };
};
class He extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const d = this.closest("geocam-viewer");
    if (!d) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let f = 0;
    const u = 8e3, g = () => {
      const v = d.viewer, w = d.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), b = w && w.mapView;
      if (f === u && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!v}, connector: ${!!w}, mapView: ${!!b}`
      ), v && typeof v.plugin == "function" && b) {
        if (this.plugin) return;
        this.viewer = v, this.plugin = new Fe({
          mapView: b,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: w.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        f += 100, setTimeout(g, 100);
    };
    g();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  He
);
export {
  He as GeocamViewerDetectionTags
};
