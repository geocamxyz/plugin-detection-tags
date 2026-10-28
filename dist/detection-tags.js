const d = (u, p = {}, v = "") => {
  const f = document.createElement(u);
  for (let m in p)
    f.setAttribute(m, p[m]);
  return f.innerHTML = v, f;
}, He = (u, p) => {
  if (!document.getElementById(u)) {
    const v = d("STYLE", { type: "text/css", id: u }, p);
    document.getElementsByTagName("head")[0].prepend(v);
  }
  return !0;
}, Ue = `
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
const Ye = function(u = {}) {
  let p, v, f, m, y, x, k;
  const w = u.mapView;
  let S = null, R = [], M = null, A = null, U = !0, Y = null, z = null, ae = !1;
  const J = [];
  let P = null, j = !0, K = 0.45, B = !1, N, T, E, I;
  He("geocam-detection-tags", Ue);
  const fe = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return u.token && n.set("token", u.token), `${e}?${n}`;
  }, se = async (e, t = {}) => {
    const o = await (await fetch(fe(e, t), {
      credentials: "same-origin"
    })).json();
    if (o && o.error)
      throw new Error(`${o.error.code}: ${o.error.message}`);
    return o;
  }, me = async () => {
    if (u.src) return u.src.replace(/\/+$/, "");
    if (!u.connectorSrc) return null;
    const e = new URL(u.connectorSrc.replace(/\/+$/, ""), window.location.href).href, t = await se(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, we = async () => {
    const e = await se(`${S}/0`);
    return M = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
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
  }, ie = () => {
    if (Y) return Y;
    const e = w && w.map && w.map.allLayers || [];
    return Y = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), Y;
  }, ve = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, Q = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...o) => t(o), n);
  }), be = async () => {
    if (!u.token || ae) return;
    const [e] = await Q(["esri/identity/IdentityManager"]);
    e.registerToken({ server: S, token: u.token }), ae = !0;
  }, xe = () => {
    if (z) {
      try {
        w.map.remove(z);
      } catch {
      }
      z = null;
    }
  }, X = async (e) => {
    const t = ie();
    if (xe(), t && (t.opacity = e && U ? 0.15 : 1), !e) return;
    const n = A, [o] = await Q(["esri/layers/FeatureLayer"]);
    await be(), A === n && (z = new o({
      url: `${S}/0`,
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
    }), w.map.add(z));
  }, ye = 360;
  let re = /* @__PURE__ */ new Map();
  const ke = (e, t) => `hsl(${e * 360 / Math.max(t, 1)}, ${e % 2 ? 70 : 92}%, ${e % 2 ? 46 : 62}%)`, Ee = () => {
    const e = [...new Set(R.map((t) => t.label))].sort();
    re = new Map(e.map((t, n) => [t, ke(n, e.length)]));
  }, Ce = (e) => {
    let t = 2166136261;
    for (let n = 0; n < e.length; n++)
      t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
    return (t >>> 0) % ye;
  }, le = (e) => re.get(e) || `hsl(${Ce(e)}, 85%, 55%)`, Se = 2048, Z = /* @__PURE__ */ new Set(), ee = () => p && typeof p.imageOverlay == "function", ce = (e) => {
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
  }, Ae = (e, t, n, o) => {
    const a = Math.floor(t / o), s = Math.floor(n / o), r = t % o, l = n % o;
    if (a === s) {
      e.fillRect(a, r, 1, l - r + 1);
      return;
    }
    e.fillRect(a, r, 1, o - r), s - a > 1 && e.fillRect(a + 1, 0, s - a - 1, o), e.fillRect(s, 0, 1, l + 1);
  }, Le = (e, t, n) => {
    const o = ce(t.counts);
    let a = 0;
    for (let s = 0; s < o.length; s += 1)
      s % 2 === 1 && o[s] > 0 && Ae(e, a, a + o[s] - 1, n), a += o[s];
  }, Te = (e) => {
    const t = e.filter((h) => h.segmentation && h.segmentation.size);
    if (!t.length) return null;
    const [n, o] = t[0].segmentation.size;
    if (!n || !o) return null;
    const a = document.createElement("canvas");
    a.width = o, a.height = n;
    const s = a.getContext("2d");
    [...t].sort((h, b) => (b.pixels || 0) - (h.pixels || 0)).forEach((h) => {
      const b = h.segmentation;
      b.size[0] !== n || b.size[1] !== o || (s.fillStyle = h.colour, Le(s, b, n));
    });
    const r = Math.min(1, Se / o), l = document.createElement("canvas");
    l.width = Math.round(o * r), l.height = Math.round(n * r);
    const c = l.getContext("2d");
    return c.globalAlpha = K, c.drawImage(a, 0, 0, l.width, l.height), l;
  }, Ie = (e, t) => {
    const n = new URL(t, window.location.href).pathname.split("/").filter(Boolean).slice(-3).join("/").replace(/\.[^.]+$/, "");
    return new URL(`${e.replace(/\/+$/, "")}/${n}.json`, S).href;
  }, $e = async (e, t) => {
    try {
      const n = await fetch(Ie(e, t), {
        credentials: "same-origin"
      });
      return n.ok ? await n.json() : null;
    } catch (n) {
      return console.warn("detection-tags: could not read masks", e, n), null;
    }
  }, q = () => {
    ee() && (Z.forEach((e) => p.imageOverlay(e, null)), Z.clear());
  }, Me = (e) => {
    const t = /* @__PURE__ */ new Set();
    return R.forEach(
      (n) => (n.summaries || []).forEach((o) => {
        const a = o.masks && o.masks[e];
        a && t.add(a);
      })
    ), [...t];
  }, Pe = (e, t, n, o) => {
    const a = Math.floor(e / n), s = Math.floor(t / n), r = e % n, l = t % n;
    if (a === s) return o(a, r, l);
    o(a, r, n - 1);
    for (let c = a + 1; c < s; c++) o(c, 0, n - 1);
    o(s, 0, l);
  }, Ne = 128, _e = 256, De = (e) => {
    const t = e.size || [], n = t[0], o = t[1];
    if (!n || !o) return [];
    const a = ce(e.counts), s = [], r = /* @__PURE__ */ new Map();
    let l = 0;
    for (let i = 0; i < a.length; i++)
      i % 2 === 1 && a[i] > 0 && Pe(l, l + a[i] - 1, n, (L, V, g) => {
        const C = s.length;
        s.push([L, V, g]);
        const $ = r.get(L);
        $ ? $.push(C) : r.set(L, [C]);
      }), l += a[i];
    if (!s.length) return [];
    const c = new Int32Array(s.length);
    for (let i = 0; i < s.length; i++) c[i] = i;
    const h = (i) => {
      for (; c[i] !== i; ) i = c[i] = c[c[i]];
      return i;
    };
    r.forEach((i, L) => {
      const V = r.get(L - 1);
      V && i.forEach((g) => {
        V.forEach((C) => {
          if (s[g][1] <= s[C][2] && s[C][1] <= s[g][2]) {
            const $ = h(g), O = h(C);
            $ !== O && (c[O] = $);
          }
        });
      });
    });
    const b = /* @__PURE__ */ new Map();
    return s.forEach((i, L) => {
      const V = h(L);
      let g = b.get(V);
      g || (g = { width: o, height: n, pixels: 0, sumX: 0, sumY: 0, candidates: [], seen: 0, stride: 1 }, b.set(V, g));
      const C = i[2] - i[1] + 1;
      if (g.pixels += C, g.sumX += i[0] * C, g.sumY += (i[1] + i[2]) / 2 * C, g.seen++ % g.stride === 0 && (g.candidates.push([i[0], i[1] + i[2] >> 1]), g.candidates.length >= Ne)) {
        let $ = 0;
        for (let O = 1; O < g.candidates.length; O += 2)
          g.candidates[$++] = g.candidates[O];
        g.candidates.length = $, g.stride *= 2;
      }
    }), [...b.values()].filter((i) => i.pixels >= _e).map((i) => ({
      width: o,
      height: n,
      pixels: i.pixels,
      cx: i.sumX / i.pixels,
      cy: i.sumY / i.pixels,
      candidates: i.candidates
    }));
  }, te = () => typeof p.directionForImagePoint == "function", Ve = (e, t) => {
    if (!t || !te()) return null;
    const { width: n, height: o, cx: a, cy: s, candidates: r } = t, l = r.map(([c, h]) => ({ u: c / n, v: h / o, d: (c - a) ** 2 + (h - s) ** 2 })).sort((c, h) => c.d - h.d);
    for (const c of l)
      if (p.directionForImagePoint(e, c.u, c.v)) return { u: c.u, v: c.v };
    return null;
  };
  let _ = [], ne = 0, F = !1;
  const G = () => {
    ne += 1, _ = [], F = !1;
  }, de = async () => {
    G();
    const e = ne;
    if (!p.visible()) return D();
    const t = (p.shotInfo() || {}).capture, n = p.urls() || [], o = Me(t);
    if (!o.length || !n.length)
      return console.info(
        "detection-tags: nothing to read for this shot — " + (n.length ? `no summary records masks for capture ${t}` : "no images on screen")
      ), D();
    F = !0, D();
    const a = await Promise.all(
      n.flatMap(
        (r, l) => o.map(
          (c) => $e(c, r).then((h) => ({ camera: l, doc: h }))
        )
      )
    );
    if (e !== ne) return;
    const s = /* @__PURE__ */ new Map();
    a.forEach(({ camera: r, doc: l }) => {
      l && (l.annotations || []).forEach((c) => {
        if (!c || !c.category_name || !c.segmentation) return;
        const h = De(c.segmentation);
        if (!h.length) return;
        const b = s.get(c.category_name) || {
          category: c.category_name,
          masks: [],
          instances: []
        };
        b.masks.push({
          camera: r,
          segmentation: c.segmentation,
          pixels: h.reduce((i, L) => i + L.pixels, 0)
        }), h.forEach((i) => {
          b.instances.push({ camera: r, measured: i, aim: void 0 });
        }), s.set(c.category_name, b);
      });
    }), _ = [...s.values()].map((r) => (r.instances.sort(
      (l, c) => l.camera - c.camera || c.measured.pixels - l.measured.pixels
    ), r)).sort((r, l) => r.category.localeCompare(l.category)), F = !1, D(), H();
  }, H = () => {
    try {
      Re();
    } catch (e) {
      console.warn("detection-tags: could not draw masks", e);
    }
  }, Re = () => {
    if (q(), !ee() || !p.visible() || !j) return;
    const e = P ? _.filter((n) => n.category === P) : _;
    if (!e.length) return;
    const t = /* @__PURE__ */ new Map();
    e.forEach(
      (n) => n.masks.forEach((o) => {
        const a = t.get(o.camera) || [];
        a.push({
          segmentation: o.segmentation,
          colour: le(n.category),
          pixels: o.pixels
        }), t.set(o.camera, a);
      })
    ), t.forEach((n, o) => {
      const a = Te(n);
      a && (p.imageOverlay(o, a), Z.add(o));
    });
  }, Oe = (e, t, n) => {
    if (t.aim === void 0 && (t.aim = Ve(t.camera, t.measured)), !t.aim) {
      n.classList.add("gdt-chip-dead"), n.title = `This ${e.category} is outside the lens circle, so there is nowhere to turn`;
      return;
    }
    P !== e.category && (P = e.category, H()), p.lookAtImagePoint(t.camera, t.aim.u, t.aim.v), D();
  }, ze = (e) => {
    P = P === e ? null : e, H(), D();
  }, oe = 9, D = () => {
    if (E && (E.innerHTML = "", T.classList.toggle("is-hidden", !B), I && (I.checked = j), !!B)) {
      if (F) {
        E.appendChild(d("DIV", { class: "gdt-v-note" }, "reading detections&hellip;"));
        return;
      }
      if (!_.length) {
        E.appendChild(
          d("DIV", { class: "gdt-v-note" }, "No detections in this shot.")
        );
        return;
      }
      te() || E.appendChild(
        d("DIV", { class: "gdt-v-note" }, "Viewer too old to centre on a detection.")
      ), _.forEach((e) => {
        const t = P === e.category, n = d("BUTTON", {
          class: `gdt-v-name${t ? " active" : ""}`,
          type: "button",
          title: t ? "Show every category again" : `Show only ${e.category}`
        }), o = d("SPAN", { class: "gdt-v-swatch", "aria-hidden": "true" });
        o.style.background = le(e.category), n.appendChild(o), n.appendChild(d("SPAN", { class: "gdt-v-label" }, e.category)), n.appendChild(d("SPAN", { class: "gdt-v-count" }, String(e.instances.length))), n.addEventListener("click", () => ze(e.category)), E.appendChild(n);
        const a = d("DIV", { class: "gdt-v-chips" });
        te() && (e.instances.slice(0, oe).forEach((s, r) => {
          const l = d("BUTTON", {
            class: `gdt-v-chip${s.aim === null ? " gdt-chip-dead" : ""}`,
            type: "button",
            title: `Centre on ${e.category} ${r + 1} (camera ${s.camera})`
          }, String(r + 1));
          l.addEventListener("click", () => Oe(e, s, l)), a.appendChild(l);
        }), e.instances.length > oe && a.appendChild(
          d("SPAN", { class: "gdt-v-more" }, `+${e.instances.length - oe}`)
        )), E.appendChild(a);
      });
    }
  }, pe = (e) => {
    B = e, N.classList.toggle("is-open", e), e && !_.length && !F ? de() : D();
  }, Be = () => {
    N = d("DIV", {
      class: "geocam-viewer-control-button gdt-v-toggle",
      role: "button",
      title: "Detections in this image"
    }), N.addEventListener("click", () => pe(!B)), T = d("DIV", { class: "gdt-v-panel is-hidden" });
    const e = d("DIV", { class: "gdt-v-head" }, "Detections in this image");
    T.appendChild(e), E = d("DIV", { class: "gdt-v-list" }), T.appendChild(E);
    const t = d("DIV", { class: "gdt-v-foot" }), n = d("LABEL", { class: "gdt-v-footrow" });
    I = d("INPUT", { type: "checkbox" }), I.checked = j, I.addEventListener("change", () => {
      j = I.checked, H();
    }), n.appendChild(I), n.appendChild(d("SPAN", {}, "show masks")), t.appendChild(n);
    const o = d("LABEL", { class: "gdt-v-footrow" });
    o.appendChild(d("SPAN", { class: "gdt-v-opacity-label" }, "opacity"));
    const a = d("INPUT", { type: "range", min: "10", max: "100", step: "5" });
    return a.value = String(Math.round(K * 100)), a.addEventListener("input", () => {
      K = Number(a.value) / 100, H();
    }), o.appendChild(a), t.appendChild(o), T.appendChild(t), N;
  }, he = async (e) => {
    if (!e || A === e.field) {
      A = null, X(null), W();
      return;
    }
    A = e.field, W();
    try {
      await X(e.field);
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), A = null, X(null), W();
    }
  }, ge = (e) => e.count !== null && M !== null && e.count >= M, W = () => {
    y.innerHTML = "";
    const e = [...R].sort((a, s) => a.label.localeCompare(s.label)), t = u.hideFullCoverage ? e.filter((a) => !ge(a)) : e;
    t.forEach((a) => {
      const s = ge(a), r = ["gdt-li"];
      A === a.field && r.push("active"), s && r.push("gdt-full");
      const l = d("BUTTON", {
        class: r.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: s ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      l.appendChild(d("SPAN", { class: "gdt-name" }, a.label)), l.appendChild(
        d(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${M ? ` / ${M}` : ""}`
        )
      ), s || l.addEventListener("click", () => he(a)), y.appendChild(l);
    }), x.disabled = !A;
    const n = e.length - t.length, o = m.querySelector(".gdt-note");
    o && o.remove(), n > 0 && m.appendChild(
      d(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, Fe = () => {
    m = d("DIV", { class: "gdt-panel" });
    const e = d("DIV", { class: "gdt-h" });
    e.appendChild(d("SPAN", {}, "Detections")), x = d("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), x.disabled = !0, x.addEventListener("click", () => he(null)), e.appendChild(x), m.appendChild(e), y = d("UL", { class: "gdt-list" }), m.appendChild(y);
    const t = d("LABEL", { class: "gdt-foot" });
    return k = d("INPUT", { type: "checkbox" }), k.checked = U, k.addEventListener("change", () => {
      U = k.checked;
      const n = ie();
      n && (n.opacity = A && U ? 0.15 : 1);
    }), t.appendChild(k), t.appendChild(d("SPAN", {}, "fade the rest")), m.appendChild(t), m;
  }, ue = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    p = e;
    try {
      if (S = await me(), !S)
        return ue(
          u.connectorSrc ? `no geocam.v2Path advertised by ${u.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", S), R = await we(), Ee();
    } catch (n) {
      return ue(`${S || u.connectorSrc} — ${n.message}`);
    }
    const t = R.length === 0;
    if (t && console.info(`detection-tags: no tag_* fields on ${S}/0 — showing disabled`), t)
      f = d("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed"
      }), f.appendChild(d("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })), w.ui.add(f, "top-right");
    else {
      const [n] = await Q(["esri/widgets/Expand"]);
      if (v = new n({
        view: w,
        content: Fe(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: !1
      }), w.ui.add(v, "top-right"), W(), ee()) {
        p.addControl(Be(), "left-bottom");
        const o = N.closest(".geocam-viewer-controls") || p.element && p.element.querySelector(".geocam-viewer-controls");
        o ? o.appendChild(T) : console.warn("detection-tags: no control strip to hang the panel on"), J.push(
          p.urls(() => {
            G(), q(), B && de();
          })
        ), J.push(
          p.visible((a) => {
            a || (G(), q(), pe(!1));
          })
        );
      } else
        console.info(
          "detection-tags: viewer has no imageOverlay — categories only, no masks"
        );
    }
    console.info(
      `detection-tags: ${R.length} categories, shot total ${M === null ? "unknown" : M} — added to the map UI${t ? " (disabled)" : ""}`
    );
  }, this.destroy = function() {
    X(null), J.splice(0).forEach((e) => e()), q(), G(), v && (w && w.ui && w.ui.remove(v), v.destroy()), f && (w && w.ui && w.ui.remove(f), f.parentNode && f.parentNode.removeChild(f)), [N, T].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), v = f = m = y = x = k = null, N = T = E = I = null;
  };
};
class je extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const p = this.closest("geocam-viewer");
    if (!p) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let v = 0;
    const f = 8e3, m = () => {
      const y = p.viewer, x = p.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), k = x && x.mapView;
      if (v === f && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!y}, connector: ${!!x}, mapView: ${!!k}`
      ), y && typeof y.plugin == "function" && k) {
        if (this.plugin) return;
        this.viewer = y, this.plugin = new Ye({
          mapView: k,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: x.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        v += 100, setTimeout(m, 100);
    };
    m();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  je
);
export {
  je as GeocamViewerDetectionTags
};
