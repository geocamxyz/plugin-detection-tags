const l = (p, d = {}, f = "") => {
  const u = document.createElement(p);
  for (let g in d)
    u.setAttribute(g, d[g]);
  return u.innerHTML = f, u;
}, Oe = (p, d) => {
  if (!document.getElementById(p)) {
    const f = l("STYLE", { type: "text/css", id: p }, d);
    document.getElementsByTagName("head")[0].prepend(f);
  }
  return !0;
}, Fe = `
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
  .gdt-v-list { display: flex; flex-direction: column; gap: 4px; }
  .gdt-v-row { display: flex; align-items: center; gap: 8px; }
  .gdt-v-name { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;
    background: none; border: 1px solid transparent; border-radius: 6px; padding: 3px 6px;
    color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .gdt-v-name:hover { border-color: rgba(255,255,255,.35); }
  .gdt-v-name.active { border-color: #2dd4bf; background: rgba(45,212,191,.15); font-weight: 600; }
  .gdt-v-label { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gdt-v-count { opacity: .6; font-variant-numeric: tabular-nums; }
  .gdt-v-chips { display: flex; flex-wrap: wrap; gap: 3px; }
  .gdt-v-chip { min-width: 20px; height: 20px; padding: 0 4px; border-radius: 4px;
    border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); color: #fff;
    font: 11px/1 system-ui, sans-serif; cursor: pointer; }
  .gdt-v-chip:hover { background: rgba(255,255,255,.22); }
  /* A detection outside the lens circle has nowhere to turn to. Shown struck
     through rather than hidden, so a click gets an explanation. */
  .gdt-v-chip.gdt-chip-dead { opacity: .35; text-decoration: line-through; cursor: default; }
  .gdt-v-more { opacity: .55; font-size: 11px; align-self: center; }
  .gdt-v-note { opacity: .7; }
  .gdt-v-foot { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.15);
    display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .gdt-v-toggle.is-open { background: rgba(255,255,255,.25); }
  .geocam-detection-tags-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;
const Ue = function(p = {}) {
  let d, f, u, g, v, w, b;
  const h = p.mapView;
  let y = null, _ = [], L = null, x = null, N = !0, R = null, D = null, ne = !1;
  const Y = [];
  let I = null, O = !0, P = !1, E, S, k, A;
  Oe("geocam-detection-tags", Fe);
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
    const e = await oe(`${y}/0`);
    return L = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
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
    if (R) return R;
    const e = h && h.map && h.map.allLayers || [];
    return R = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), R;
  }, me = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, j = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...o) => t(o), n);
  }), we = async () => {
    if (!p.token || ne) return;
    const [e] = await j(["esri/identity/IdentityManager"]);
    e.registerToken({ server: y, token: p.token }), ne = !0;
  }, ve = () => {
    if (D) {
      try {
        h.map.remove(D);
      } catch {
      }
      D = null;
    }
  }, F = async (e) => {
    const t = ae();
    if (ve(), t && (t.opacity = e && N ? 0.15 : 1), !e) return;
    const n = x, [o] = await j(["esri/layers/FeatureLayer"]);
    await we(), x === n && (D = new o({
      url: `${y}/0`,
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
    }), h.map.add(D));
  }, be = "rgb(255, 0, 255)", ye = 0.45, xe = 2048, X = /* @__PURE__ */ new Set(), q = () => d && typeof d.imageOverlay == "function", se = (e) => {
    if (Array.isArray(e)) return e;
    if (typeof e != "string") return [];
    const t = [];
    let n = 0;
    for (; n < e.length; ) {
      let o = 0, a = 0, s = 1;
      for (; s; ) {
        const r = e.charCodeAt(n) - 48;
        o |= (r & 31) << 5 * a, s = r & 32, n += 1, a += 1, !s && r & 16 && (o |= -1 << 5 * a);
      }
      t.length > 2 && (o += t[t.length - 2]), t.push(o);
    }
    return t;
  }, ke = (e, t, n, o) => {
    const a = Math.floor(t / o), s = Math.floor(n / o), r = t % o, c = n % o;
    if (a === s) {
      e.fillRect(a, r, 1, c - r + 1);
      return;
    }
    e.fillRect(a, r, 1, o - r), s - a > 1 && e.fillRect(a + 1, 0, s - a - 1, o), e.fillRect(s, 0, 1, c + 1);
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
    const r = Math.min(1, xe / o), c = document.createElement("canvas");
    c.width = Math.round(o * r), c.height = Math.round(n * r);
    const i = c.getContext("2d");
    return i.globalAlpha = ye, i.drawImage(a, 0, 0, c.width, c.height), c;
  }, Se = (e, t) => {
    const n = new URL(t, window.location.href).pathname.split("/").filter(Boolean).slice(-3).join("/").replace(/\.[^.]+$/, "");
    return new URL(`${e.replace(/\/+$/, "")}/${n}.json`, y).href;
  }, Ae = async (e, t) => {
    try {
      const n = await fetch(Se(e, t), {
        credentials: "same-origin"
      });
      return n.ok ? await n.json() : null;
    } catch (n) {
      return console.warn("detection-tags: could not read masks", e, n), null;
    }
  }, U = () => {
    q() && (X.forEach((e) => d.imageOverlay(e, null)), X.clear());
  }, Le = (e) => {
    const t = /* @__PURE__ */ new Set();
    return _.forEach(
      (n) => (n.summaries || []).forEach((o) => {
        const a = o.masks && o.masks[e];
        a && t.add(a);
      })
    ), [...t];
  }, Ie = (e, t, n, o) => {
    const a = Math.floor(e / n), s = Math.floor(t / n), r = e % n, c = t % n;
    if (a === s) return o(a, r, c);
    o(a, r, n - 1);
    for (let i = a + 1; i < s; i++) o(i, 0, n - 1);
    o(s, 0, c);
  }, Te = 512, $e = (e) => {
    const t = e.size || [], n = t[0], o = t[1];
    if (!n || !o) return null;
    const a = se(e.counts);
    let s = 0, r = 0, c = 0;
    const i = [];
    let m = 0, C = 1, J = 0;
    for (let M = 0; M < a.length; M++)
      M % 2 === 1 && a[M] > 0 && Ie(J, J + a[M] - 1, n, (pe, Q, Z) => {
        const ee = Z - Q + 1;
        if (s += ee, r += pe * ee, c += (Q + Z) / 2 * ee, m++ % C === 0 && (i.push([pe, Q + Z >> 1]), i.length >= Te)) {
          let ue = 0;
          for (let te = 1; te < i.length; te += 2)
            i[ue++] = i[te];
          i.length = ue, C *= 2;
        }
      }), J += a[M];
    return s ? { width: o, height: n, pixels: s, cx: r / s, cy: c / s, candidates: i } : null;
  }, Me = 64, G = () => typeof d.directionForImagePoint == "function", _e = (e, t) => {
    if (!t || !G()) return null;
    const { width: n, height: o, cx: a, cy: s, candidates: r } = t, c = r.map(([i, m]) => ({ u: i / n, v: m / o, d: (i - a) ** 2 + (m - s) ** 2 })).sort((i, m) => i.d - m.d).slice(0, Me);
    for (const i of c)
      if (d.directionForImagePoint(e, i.u, i.v)) return { u: i.u, v: i.v };
    return null;
  };
  let $ = [], W = 0, V = !1;
  const H = () => {
    W += 1, $ = [], V = !1;
  }, ie = async () => {
    H();
    const e = W;
    if (!d.visible()) return T();
    const t = (d.shotInfo() || {}).capture, n = d.urls() || [], o = Le(t);
    if (!o.length || !n.length)
      return console.info(
        "detection-tags: nothing to read for this shot — " + (n.length ? `no summary records masks for capture ${t}` : "no images on screen")
      ), T();
    V = !0, T();
    const a = await Promise.all(
      n.flatMap(
        (r, c) => o.map(
          (i) => Ae(i, r).then((m) => ({ camera: c, doc: m }))
        )
      )
    );
    if (e !== W) return;
    const s = /* @__PURE__ */ new Map();
    a.forEach(({ camera: r, doc: c }) => {
      c && (c.annotations || []).forEach((i) => {
        if (!i || !i.category_name || !i.segmentation) return;
        const m = $e(i.segmentation);
        if (!m) return;
        const C = s.get(i.category_name) || {
          category: i.category_name,
          colour: i.category_color,
          instances: []
        };
        C.instances.push({ camera: r, segmentation: i.segmentation, measured: m, aim: void 0 }), s.set(i.category_name, C);
      });
    }), $ = [...s.values()].map((r) => (r.instances.sort(
      (c, i) => c.camera - i.camera || i.measured.pixels - c.measured.pixels
    ), r)).sort((r, c) => r.category.localeCompare(c.category)), V = !1, T(), z();
  }, z = () => {
    try {
      De();
    } catch (e) {
      console.warn("detection-tags: could not draw masks", e);
    }
  }, De = () => {
    if (U(), !q() || !d.visible() || !O || !I) return;
    const e = $.find((n) => n.category === I);
    if (!e) return;
    const t = /* @__PURE__ */ new Map();
    e.instances.forEach((n) => {
      const o = t.get(n.camera) || [];
      o.push({ segmentation: n.segmentation }), t.set(n.camera, o);
    }), t.forEach((n, o) => {
      const a = Ee(n);
      a && (d.imageOverlay(o, a), X.add(o));
    });
  }, Pe = (e, t, n) => {
    if (t.aim === void 0 && (t.aim = _e(t.camera, t.measured)), !t.aim) {
      n.classList.add("gdt-chip-dead"), n.title = `This ${e.category} is outside the lens circle, so there is nowhere to turn`;
      return;
    }
    I !== e.category && (I = e.category, z()), d.lookAtImagePoint(t.camera, t.aim.u, t.aim.v), T();
  }, Ve = (e) => {
    I = I === e ? null : e, z(), T();
  }, K = 9, T = () => {
    if (k && (k.innerHTML = "", S.classList.toggle("is-hidden", !P), A && (A.checked = O), !!P)) {
      if (V) {
        k.appendChild(l("DIV", { class: "gdt-v-note" }, "reading detections&hellip;"));
        return;
      }
      if (!$.length) {
        k.appendChild(
          l("DIV", { class: "gdt-v-note" }, "No detections in this shot.")
        );
        return;
      }
      G() || k.appendChild(
        l("DIV", { class: "gdt-v-note" }, "Viewer too old to centre on a detection.")
      ), $.forEach((e) => {
        const t = l("DIV", { class: "gdt-v-row" }), n = l("BUTTON", {
          class: `gdt-v-name${I === e.category ? " active" : ""}`,
          type: "button",
          title: `Draw every ${e.category} in this shot`
        });
        if (n.appendChild(l("SPAN", { class: "gdt-v-label" }, e.category)), n.appendChild(l("SPAN", { class: "gdt-v-count" }, String(e.instances.length))), n.addEventListener("click", () => Ve(e.category)), t.appendChild(n), G()) {
          const o = l("DIV", { class: "gdt-v-chips" });
          e.instances.slice(0, K).forEach((a, s) => {
            const r = l("BUTTON", {
              class: `gdt-v-chip${a.aim === null ? " gdt-chip-dead" : ""}`,
              type: "button",
              title: `Centre on ${e.category} ${s + 1} (camera ${a.camera})`
            }, String(s + 1));
            r.addEventListener("click", () => Pe(e, a, r)), o.appendChild(r);
          }), e.instances.length > K && o.appendChild(
            l("SPAN", { class: "gdt-v-more" }, `+${e.instances.length - K}`)
          ), t.appendChild(o);
        }
        k.appendChild(t);
      });
    }
  }, re = (e) => {
    P = e, E.classList.toggle("is-open", e), e && !$.length && !V ? ie() : T();
  }, Ne = () => {
    E = l("DIV", {
      class: "geocam-viewer-control-button gdt-v-toggle",
      role: "button",
      title: "Detections in this image"
    }), E.appendChild(
      l("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })
    ), E.addEventListener("click", () => re(!P)), S = l("DIV", { class: "gdt-v-panel is-hidden" });
    const e = l("DIV", { class: "gdt-v-head" }, "Detections in this image");
    S.appendChild(e), k = l("DIV", { class: "gdt-v-list" }), S.appendChild(k);
    const t = l("LABEL", { class: "gdt-v-foot" });
    return A = l("INPUT", { type: "checkbox" }), A.checked = O, A.addEventListener("change", () => {
      O = A.checked, z();
    }), t.appendChild(A), t.appendChild(l("SPAN", {}, "show masks")), S.appendChild(t), E;
  }, le = async (e) => {
    if (!e || x === e.field) {
      x = null, F(null), B();
      return;
    }
    x = e.field, B();
    try {
      await F(e.field);
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), x = null, F(null), B();
    }
  }, ce = (e) => e.count !== null && L !== null && e.count >= L, B = () => {
    v.innerHTML = "";
    const e = [..._].sort((a, s) => a.count === s.count ? a.label.localeCompare(s.label) : a.count === null ? 1 : s.count === null ? -1 : a.count - s.count), t = p.hideFullCoverage ? e.filter((a) => !ce(a)) : e;
    t.forEach((a) => {
      const s = ce(a), r = ["gdt-li"];
      x === a.field && r.push("active"), s && r.push("gdt-full");
      const c = l("BUTTON", {
        class: r.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: s ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      c.appendChild(l("SPAN", { class: "gdt-name" }, a.label)), c.appendChild(
        l(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${L ? ` / ${L}` : ""}`
        )
      ), s || c.addEventListener("click", () => le(a)), v.appendChild(c);
    }), w.disabled = !x;
    const n = e.length - t.length, o = g.querySelector(".gdt-note");
    o && o.remove(), n > 0 && g.appendChild(
      l(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, Re = () => {
    g = l("DIV", { class: "gdt-panel" });
    const e = l("DIV", { class: "gdt-h" });
    e.appendChild(l("SPAN", {}, "Detections")), w = l("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), w.disabled = !0, w.addEventListener("click", () => le(null)), e.appendChild(w), g.appendChild(e), v = l("UL", { class: "gdt-list" }), g.appendChild(v);
    const t = l("LABEL", { class: "gdt-foot" });
    return b = l("INPUT", { type: "checkbox" }), b.checked = N, b.addEventListener("change", () => {
      N = b.checked;
      const n = ae();
      n && (n.opacity = x && N ? 0.15 : 1);
    }), t.appendChild(b), t.appendChild(l("SPAN", {}, "fade the rest")), g.appendChild(t), g;
  }, de = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    d = e;
    try {
      if (y = await he(), !y)
        return de(
          p.connectorSrc ? `no geocam.v2Path advertised by ${p.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", y), _ = await fe();
    } catch (n) {
      return de(`${y || p.connectorSrc} — ${n.message}`);
    }
    const t = _.length === 0;
    if (t && console.info(`detection-tags: no tag_* fields on ${y}/0 — showing disabled`), t)
      u = l("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed"
      }), u.appendChild(l("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })), h.ui.add(u, "top-right");
    else {
      const [n] = await j(["esri/widgets/Expand"]);
      if (f = new n({
        view: h,
        content: Re(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: !1
      }), h.ui.add(f, "top-right"), B(), q()) {
        d.addControl(Ne(), "left-bottom");
        const o = E.closest(".geocam-viewer-controls") || d.element && d.element.querySelector(".geocam-viewer-controls");
        o ? o.appendChild(S) : console.warn("detection-tags: no control strip to hang the panel on"), Y.push(
          d.urls(() => {
            H(), U(), P && ie();
          })
        ), Y.push(
          d.visible((a) => {
            a || (H(), U(), re(!1));
          })
        );
      } else
        console.info(
          "detection-tags: viewer has no imageOverlay — categories only, no masks"
        );
    }
    console.info(
      `detection-tags: ${_.length} categories, shot total ${L === null ? "unknown" : L} — added to the map UI${t ? " (disabled)" : ""}`
    );
  }, this.destroy = function() {
    F(null), Y.splice(0).forEach((e) => e()), U(), H(), f && (h && h.ui && h.ui.remove(f), f.destroy()), u && (h && h.ui && h.ui.remove(u), u.parentNode && u.parentNode.removeChild(u)), [E, S].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), f = u = g = v = w = b = null, E = S = k = A = null;
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
        this.viewer = v, this.plugin = new Ue({
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
