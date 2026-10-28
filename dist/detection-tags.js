const l = (p, d = {}, m = "") => {
  const u = document.createElement(p);
  for (let h in d)
    u.setAttribute(h, d[h]);
  return u.innerHTML = m, u;
}, Oe = (p, d) => {
  if (!document.getElementById(p)) {
    const m = l("STYLE", { type: "text/css", id: p }, d);
    document.getElementsByTagName("head")[0].prepend(m);
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
  /* The legend. A ring rather than a bare square, so a swatch that happens
     to be near-black still has an edge against this panel. */
  .gdt-v-swatch { flex: 0 0 auto; width: 11px; height: 11px; border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(255,255,255,.45); }
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
    display: flex; flex-direction: column; gap: 6px; }
  .gdt-v-footrow { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .gdt-v-footrow input[type="range"] { flex: 1 1 auto; min-width: 0; height: 3px; }
  .gdt-v-opacity-label { opacity: .7; }
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
const Ue = function(p = {}) {
  let d, m, u, h, b, w, x;
  const f = p.mapView;
  let k = null, P = [], A = null, C = null, R = !0, O = null, D = null, oe = !1;
  const j = [];
  let L = null, z = !0, Y = 0.45, _ = !1, T, E, y, S;
  Oe("geocam-detection-tags", ze);
  const fe = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return p.token && n.set("token", p.token), `${e}?${n}`;
  }, ae = async (e, t = {}) => {
    const o = await (await fetch(fe(e, t), {
      credentials: "same-origin"
    })).json();
    if (o && o.error)
      throw new Error(`${o.error.code}: ${o.error.message}`);
    return o;
  }, me = async () => {
    if (p.src) return p.src.replace(/\/+$/, "");
    if (!p.connectorSrc) return null;
    const e = new URL(p.connectorSrc.replace(/\/+$/, ""), window.location.href).href, t = await ae(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, we = async () => {
    const e = await ae(`${k}/0`);
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
  }, se = () => {
    if (O) return O;
    const e = f && f.map && f.map.allLayers || [];
    return O = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), O;
  }, ve = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, q = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...o) => t(o), n);
  }), be = async () => {
    if (!p.token || oe) return;
    const [e] = await q(["esri/identity/IdentityManager"]);
    e.registerToken({ server: k, token: p.token }), oe = !0;
  }, xe = () => {
    if (D) {
      try {
        f.map.remove(D);
      } catch {
      }
      D = null;
    }
  }, U = async (e) => {
    const t = se();
    if (xe(), t && (t.opacity = e && R ? 0.15 : 1), !e) return;
    const n = C, [o] = await q(["esri/layers/FeatureLayer"]);
    await be(), C === n && (D = new o({
      url: `${k}/0`,
      // No token here: Esri strips `token` from customParameters because it
      // manages credentials itself, which silently 403s the layer's own
      // metadata request. It goes through IdentityManager instead.
      customParameters: { tags: e },
      outFields: [],
      popupEnabled: !1,
      legendEnabled: !1,
      listMode: "hide",
      // not a layer the operator manages; keep it out of LayerList
      renderer: { type: "simple", symbol: ve }
    }), f.map.add(D));
  }, ye = "rgb(255, 0, 255)", ke = 2048, X = /* @__PURE__ */ new Set(), G = () => d && typeof d.imageOverlay == "function", re = (e) => {
    if (Array.isArray(e)) return e;
    if (typeof e != "string") return [];
    const t = [];
    let n = 0;
    for (; n < e.length; ) {
      let o = 0, a = 0, s = 1;
      for (; s; ) {
        const c = e.charCodeAt(n) - 48;
        o |= (c & 31) << 5 * a, s = c & 32, n += 1, a += 1, !s && c & 16 && (o |= -1 << 5 * a);
      }
      t.length > 2 && (o += t[t.length - 2]), t.push(o);
    }
    return t;
  }, Ce = (e, t, n, o) => {
    const a = Math.floor(t / o), s = Math.floor(n / o), c = t % o, i = n % o;
    if (a === s) {
      e.fillRect(a, c, 1, i - c + 1);
      return;
    }
    e.fillRect(a, c, 1, o - c), s - a > 1 && e.fillRect(a + 1, 0, s - a - 1, o), e.fillRect(s, 0, 1, i + 1);
  }, Ee = (e, t, n) => {
    const o = re(t.counts);
    let a = 0;
    for (let s = 0; s < o.length; s += 1)
      s % 2 === 1 && o[s] > 0 && Ce(e, a, a + o[s] - 1, n), a += o[s];
  }, ie = (e) => Array.isArray(e) && e.length >= 3 ? `rgb(${e[0]}, ${e[1]}, ${e[2]})` : ye, Se = (e) => {
    const t = e.filter((g) => g.segmentation && g.segmentation.size);
    if (!t.length) return null;
    const [n, o] = t[0].segmentation.size;
    if (!n || !o) return null;
    const a = document.createElement("canvas");
    a.width = o, a.height = n;
    const s = a.getContext("2d");
    [...t].sort((g, v) => (v.pixels || 0) - (g.pixels || 0)).forEach((g) => {
      const v = g.segmentation;
      v.size[0] !== n || v.size[1] !== o || (s.fillStyle = ie(g.colour), Ee(s, v, n));
    });
    const c = Math.min(1, ke / o), i = document.createElement("canvas");
    i.width = Math.round(o * c), i.height = Math.round(n * c);
    const r = i.getContext("2d");
    return r.globalAlpha = Y, r.drawImage(a, 0, 0, i.width, i.height), i;
  }, Ae = (e, t) => {
    const n = new URL(t, window.location.href).pathname.split("/").filter(Boolean).slice(-3).join("/").replace(/\.[^.]+$/, "");
    return new URL(`${e.replace(/\/+$/, "")}/${n}.json`, k).href;
  }, Le = async (e, t) => {
    try {
      const n = await fetch(Ae(e, t), {
        credentials: "same-origin"
      });
      return n.ok ? await n.json() : null;
    } catch (n) {
      return console.warn("detection-tags: could not read masks", e, n), null;
    }
  }, B = () => {
    G() && (X.forEach((e) => d.imageOverlay(e, null)), X.clear());
  }, Te = (e) => {
    const t = /* @__PURE__ */ new Set();
    return P.forEach(
      (n) => (n.summaries || []).forEach((o) => {
        const a = o.masks && o.masks[e];
        a && t.add(a);
      })
    ), [...t];
  }, $e = (e, t, n, o) => {
    const a = Math.floor(e / n), s = Math.floor(t / n), c = e % n, i = t % n;
    if (a === s) return o(a, c, i);
    o(a, c, n - 1);
    for (let r = a + 1; r < s; r++) o(r, 0, n - 1);
    o(s, 0, i);
  }, Ie = 512, Me = (e) => {
    const t = e.size || [], n = t[0], o = t[1];
    if (!n || !o) return null;
    const a = re(e.counts);
    let s = 0, c = 0, i = 0;
    const r = [];
    let g = 0, v = 1, Q = 0;
    for (let M = 0; M < a.length; M++)
      M % 2 === 1 && a[M] > 0 && $e(Q, Q + a[M] - 1, n, (ue, Z, ee) => {
        const te = ee - Z + 1;
        if (s += te, c += ue * te, i += (Z + ee) / 2 * te, g++ % v === 0 && (r.push([ue, Z + ee >> 1]), r.length >= Ie)) {
          let he = 0;
          for (let ne = 1; ne < r.length; ne += 2)
            r[he++] = r[ne];
          r.length = he, v *= 2;
        }
      }), Q += a[M];
    return s ? { width: o, height: n, pixels: s, cx: c / s, cy: i / s, candidates: r } : null;
  }, W = () => typeof d.directionForImagePoint == "function", Pe = (e, t) => {
    if (!t || !W()) return null;
    const { width: n, height: o, cx: a, cy: s, candidates: c } = t, i = c.map(([r, g]) => ({ u: r / n, v: g / o, d: (r - a) ** 2 + (g - s) ** 2 })).sort((r, g) => r.d - g.d);
    for (const r of i)
      if (d.directionForImagePoint(e, r.u, r.v)) return { u: r.u, v: r.v };
    return null;
  };
  let $ = [], J = 0, N = !1;
  const F = () => {
    J += 1, $ = [], N = !1;
  }, le = async () => {
    F();
    const e = J;
    if (!d.visible()) return I();
    const t = (d.shotInfo() || {}).capture, n = d.urls() || [], o = Te(t);
    if (!o.length || !n.length)
      return console.info(
        "detection-tags: nothing to read for this shot — " + (n.length ? `no summary records masks for capture ${t}` : "no images on screen")
      ), I();
    N = !0, I();
    const a = await Promise.all(
      n.flatMap(
        (c, i) => o.map(
          (r) => Le(r, c).then((g) => ({ camera: i, doc: g }))
        )
      )
    );
    if (e !== J) return;
    const s = /* @__PURE__ */ new Map();
    a.forEach(({ camera: c, doc: i }) => {
      i && (i.annotations || []).forEach((r) => {
        if (!r || !r.category_name || !r.segmentation) return;
        const g = Me(r.segmentation);
        if (!g) return;
        const v = s.get(r.category_name) || {
          category: r.category_name,
          colour: r.category_color,
          instances: []
        };
        v.instances.push({ camera: c, segmentation: r.segmentation, measured: g, aim: void 0 }), s.set(r.category_name, v);
      });
    }), $ = [...s.values()].map((c) => (c.instances.sort(
      (i, r) => i.camera - r.camera || r.measured.pixels - i.measured.pixels
    ), c)).sort((c, i) => c.category.localeCompare(i.category)), N = !1, I(), V();
  }, V = () => {
    try {
      De();
    } catch (e) {
      console.warn("detection-tags: could not draw masks", e);
    }
  }, De = () => {
    if (B(), !G() || !d.visible() || !z) return;
    const e = L ? $.filter((n) => n.category === L) : $;
    if (!e.length) return;
    const t = /* @__PURE__ */ new Map();
    e.forEach(
      (n) => n.instances.forEach((o) => {
        const a = t.get(o.camera) || [];
        a.push({
          segmentation: o.segmentation,
          colour: n.colour,
          pixels: o.measured.pixels
        }), t.set(o.camera, a);
      })
    ), t.forEach((n, o) => {
      const a = Se(n);
      a && (d.imageOverlay(o, a), X.add(o));
    });
  }, _e = (e, t, n) => {
    if (t.aim === void 0 && (t.aim = Pe(t.camera, t.measured)), !t.aim) {
      n.classList.add("gdt-chip-dead"), n.title = `This ${e.category} is outside the lens circle, so there is nowhere to turn`;
      return;
    }
    L !== e.category && (L = e.category, V()), d.lookAtImagePoint(t.camera, t.aim.u, t.aim.v), I();
  }, Ne = (e) => {
    L = L === e ? null : e, V(), I();
  }, K = 9, I = () => {
    if (y && (y.innerHTML = "", E.classList.toggle("is-hidden", !_), S && (S.checked = z), !!_)) {
      if (N) {
        y.appendChild(l("DIV", { class: "gdt-v-note" }, "reading detections&hellip;"));
        return;
      }
      if (!$.length) {
        y.appendChild(
          l("DIV", { class: "gdt-v-note" }, "No detections in this shot.")
        );
        return;
      }
      W() || y.appendChild(
        l("DIV", { class: "gdt-v-note" }, "Viewer too old to centre on a detection.")
      ), $.forEach((e) => {
        const t = L === e.category, n = l("BUTTON", {
          class: `gdt-v-name${t ? " active" : ""}`,
          type: "button",
          title: t ? "Show every category again" : `Show only ${e.category}`
        }), o = l("SPAN", { class: "gdt-v-swatch", "aria-hidden": "true" });
        o.style.background = ie(e.colour), n.appendChild(o), n.appendChild(l("SPAN", { class: "gdt-v-label" }, e.category)), n.appendChild(l("SPAN", { class: "gdt-v-count" }, String(e.instances.length))), n.addEventListener("click", () => Ne(e.category)), y.appendChild(n);
        const a = l("DIV", { class: "gdt-v-chips" });
        W() && (e.instances.slice(0, K).forEach((s, c) => {
          const i = l("BUTTON", {
            class: `gdt-v-chip${s.aim === null ? " gdt-chip-dead" : ""}`,
            type: "button",
            title: `Centre on ${e.category} ${c + 1} (camera ${s.camera})`
          }, String(c + 1));
          i.addEventListener("click", () => _e(e, s, i)), a.appendChild(i);
        }), e.instances.length > K && a.appendChild(
          l("SPAN", { class: "gdt-v-more" }, `+${e.instances.length - K}`)
        )), y.appendChild(a);
      });
    }
  }, ce = (e) => {
    _ = e, T.classList.toggle("is-open", e), e && !$.length && !N ? le() : I();
  }, Ve = () => {
    T = l("DIV", {
      class: "geocam-viewer-control-button gdt-v-toggle",
      role: "button",
      title: "Detections in this image"
    }), T.addEventListener("click", () => ce(!_)), E = l("DIV", { class: "gdt-v-panel is-hidden" });
    const e = l("DIV", { class: "gdt-v-head" }, "Detections in this image");
    E.appendChild(e), y = l("DIV", { class: "gdt-v-list" }), E.appendChild(y);
    const t = l("DIV", { class: "gdt-v-foot" }), n = l("LABEL", { class: "gdt-v-footrow" });
    S = l("INPUT", { type: "checkbox" }), S.checked = z, S.addEventListener("change", () => {
      z = S.checked, V();
    }), n.appendChild(S), n.appendChild(l("SPAN", {}, "show masks")), t.appendChild(n);
    const o = l("LABEL", { class: "gdt-v-footrow" });
    o.appendChild(l("SPAN", { class: "gdt-v-opacity-label" }, "opacity"));
    const a = l("INPUT", { type: "range", min: "10", max: "100", step: "5" });
    return a.value = String(Math.round(Y * 100)), a.addEventListener("input", () => {
      Y = Number(a.value) / 100, V();
    }), o.appendChild(a), t.appendChild(o), E.appendChild(t), T;
  }, de = async (e) => {
    if (!e || C === e.field) {
      C = null, U(null), H();
      return;
    }
    C = e.field, H();
    try {
      await U(e.field);
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), C = null, U(null), H();
    }
  }, pe = (e) => e.count !== null && A !== null && e.count >= A, H = () => {
    b.innerHTML = "";
    const e = [...P].sort((a, s) => a.count === s.count ? a.label.localeCompare(s.label) : a.count === null ? 1 : s.count === null ? -1 : a.count - s.count), t = p.hideFullCoverage ? e.filter((a) => !pe(a)) : e;
    t.forEach((a) => {
      const s = pe(a), c = ["gdt-li"];
      C === a.field && c.push("active"), s && c.push("gdt-full");
      const i = l("BUTTON", {
        class: c.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: s ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      i.appendChild(l("SPAN", { class: "gdt-name" }, a.label)), i.appendChild(
        l(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${A ? ` / ${A}` : ""}`
        )
      ), s || i.addEventListener("click", () => de(a)), b.appendChild(i);
    }), w.disabled = !C;
    const n = e.length - t.length, o = h.querySelector(".gdt-note");
    o && o.remove(), n > 0 && h.appendChild(
      l(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, Re = () => {
    h = l("DIV", { class: "gdt-panel" });
    const e = l("DIV", { class: "gdt-h" });
    e.appendChild(l("SPAN", {}, "Detections")), w = l("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), w.disabled = !0, w.addEventListener("click", () => de(null)), e.appendChild(w), h.appendChild(e), b = l("UL", { class: "gdt-list" }), h.appendChild(b);
    const t = l("LABEL", { class: "gdt-foot" });
    return x = l("INPUT", { type: "checkbox" }), x.checked = R, x.addEventListener("change", () => {
      R = x.checked;
      const n = se();
      n && (n.opacity = C && R ? 0.15 : 1);
    }), t.appendChild(x), t.appendChild(l("SPAN", {}, "fade the rest")), h.appendChild(t), h;
  }, ge = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    d = e;
    try {
      if (k = await me(), !k)
        return ge(
          p.connectorSrc ? `no geocam.v2Path advertised by ${p.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", k), P = await we();
    } catch (n) {
      return ge(`${k || p.connectorSrc} — ${n.message}`);
    }
    const t = P.length === 0;
    if (t && console.info(`detection-tags: no tag_* fields on ${k}/0 — showing disabled`), t)
      u = l("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed"
      }), u.appendChild(l("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })), f.ui.add(u, "top-right");
    else {
      const [n] = await q(["esri/widgets/Expand"]);
      if (m = new n({
        view: f,
        content: Re(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: !1
      }), f.ui.add(m, "top-right"), H(), G()) {
        d.addControl(Ve(), "left-bottom");
        const o = T.closest(".geocam-viewer-controls") || d.element && d.element.querySelector(".geocam-viewer-controls");
        o ? o.appendChild(E) : console.warn("detection-tags: no control strip to hang the panel on"), j.push(
          d.urls(() => {
            F(), B(), _ && le();
          })
        ), j.push(
          d.visible((a) => {
            a || (F(), B(), ce(!1));
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
    U(null), j.splice(0).forEach((e) => e()), B(), F(), m && (f && f.ui && f.ui.remove(m), m.destroy()), u && (f && f.ui && f.ui.remove(u), u.parentNode && u.parentNode.removeChild(u)), [T, E].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), m = u = h = b = w = x = null, T = E = y = S = null;
  };
};
class Be extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const d = this.closest("geocam-viewer");
    if (!d) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let m = 0;
    const u = 8e3, h = () => {
      const b = d.viewer, w = d.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), x = w && w.mapView;
      if (m === u && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!b}, connector: ${!!w}, mapView: ${!!x}`
      ), b && typeof b.plugin == "function" && x) {
        if (this.plugin) return;
        this.viewer = b, this.plugin = new Ue({
          mapView: x,
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
        m += 100, setTimeout(h, 100);
    };
    h();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  Be
);
export {
  Be as GeocamViewerDetectionTags
};
