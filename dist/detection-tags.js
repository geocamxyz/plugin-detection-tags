const u = (r, i = {}, h = "") => {
  const d = document.createElement(r);
  for (let p in i)
    d.setAttribute(p, i[p]);
  return d.innerHTML = h, d;
}, re = (r, i) => {
  if (!document.getElementById(r)) {
    const h = u("STYLE", { type: "text/css", id: r }, i);
    document.getElementsByTagName("head")[0].prepend(h);
  }
  return !0;
}, ie = `
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
  .geocam-detection-tags-icon { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;
const le = function(r = {}) {
  let i, h, d, p, m, f, w;
  const g = r.mapView;
  let v = null, k = [], x = null, y = null, $ = !0, C = null, S = null, P = !1;
  const _ = [];
  re("geocam-detection-tags", ie);
  const N = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return r.token && n.set("token", r.token), `${e}?${n}`;
  }, U = async (e, t = {}) => {
    const o = await (await fetch(N(e, t), {
      credentials: "same-origin"
    })).json();
    if (o && o.error)
      throw new Error(`${o.error.code}: ${o.error.message}`);
    return o;
  }, Y = async () => {
    if (r.src) return r.src.replace(/\/+$/, "");
    if (!r.connectorSrc) return null;
    const e = new URL(r.connectorSrc.replace(/\/+$/, ""), window.location.href).href, t = await U(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, j = async () => {
    const e = await U(`${v}/0`);
    return x = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
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
  }, V = () => {
    if (C) return C;
    const e = g && g.map && g.map.allLayers || [];
    return C = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), C;
  }, q = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, R = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...o) => t(o), n);
  }), X = async () => {
    if (!r.token || P) return;
    const [e] = await R(["esri/identity/IdentityManager"]);
    e.registerToken({ server: v, token: r.token }), P = !0;
  }, G = () => {
    if (S) {
      try {
        g.map.remove(S);
      } catch {
      }
      S = null;
    }
  }, L = async (e) => {
    const t = V();
    if (G(), t && (t.opacity = e && $ ? 0.15 : 1), !e) return;
    const n = y, [o] = await R(["esri/layers/FeatureLayer"]);
    await X(), y === n && (S = new o({
      url: `${v}/0`,
      // No token here: Esri strips `token` from customParameters because it
      // manages credentials itself, which silently 403s the layer's own
      // metadata request. It goes through IdentityManager instead.
      customParameters: { tags: e },
      outFields: [],
      popupEnabled: !1,
      legendEnabled: !1,
      listMode: "hide",
      // not a layer the operator manages; keep it out of LayerList
      renderer: { type: "simple", symbol: q }
    }), g.map.add(S));
  }, W = "rgb(255, 0, 255)", K = 0.45, J = 2048;
  let T = 0;
  const O = /* @__PURE__ */ new Set(), H = () => i && typeof i.imageOverlay == "function", Q = (e) => {
    if (Array.isArray(e)) return e;
    if (typeof e != "string") return [];
    const t = [];
    let n = 0;
    for (; n < e.length; ) {
      let o = 0, s = 0, a = 1;
      for (; a; ) {
        const l = e.charCodeAt(n) - 48;
        o |= (l & 31) << 5 * s, a = l & 32, n += 1, s += 1, !a && l & 16 && (o |= -1 << 5 * s);
      }
      t.length > 2 && (o += t[t.length - 2]), t.push(o);
    }
    return t;
  }, Z = (e, t, n, o) => {
    const s = Math.floor(t / o), a = Math.floor(n / o), l = t % o, c = n % o;
    if (s === a) {
      e.fillRect(s, l, 1, c - l + 1);
      return;
    }
    e.fillRect(s, l, 1, o - l), a - s > 1 && e.fillRect(s + 1, 0, a - s - 1, o), e.fillRect(a, 0, 1, c + 1);
  }, ee = (e, t, n) => {
    const o = Q(t.counts);
    let s = 0;
    for (let a = 0; a < o.length; a += 1)
      a % 2 === 1 && o[a] > 0 && Z(e, s, s + o[a] - 1, n), s += o[a];
  }, te = (e) => {
    const t = e[0].segmentation.size || [], n = t[0], o = t[1];
    if (!n || !o) return null;
    const s = document.createElement("canvas");
    s.width = o, s.height = n;
    const a = s.getContext("2d");
    a.fillStyle = W, e.forEach((I) => {
      const b = I.segmentation || {};
      (b.size || [])[0] === n && (b.size || [])[1] === o && ee(a, b, n);
    });
    const l = Math.min(1, J / o), c = document.createElement("canvas");
    c.width = Math.round(o * l), c.height = Math.round(n * l);
    const A = c.getContext("2d");
    return A.globalAlpha = K, A.drawImage(s, 0, 0, c.width, c.height), c;
  }, ne = (e, t) => {
    const n = new URL(t, window.location.href).pathname.split("/").filter(Boolean).slice(-3).join("/").replace(/\.[^.]+$/, "");
    return new URL(`${e.replace(/\/+$/, "")}/${n}.json`, v).href;
  }, oe = async (e, t) => {
    try {
      const n = await fetch(ne(e, t), {
        credentials: "same-origin"
      });
      return n.ok ? await n.json() : null;
    } catch (n) {
      return console.warn("detection-tags: could not read masks", e, n), null;
    }
  }, B = () => {
    T += 1, H() && (O.forEach((e) => i.imageOverlay(e, null)), O.clear());
  }, E = () => se().catch(
    (e) => console.warn("detection-tags: could not draw masks", e)
  ), se = async () => {
    if (B(), !H() || !i.visible()) return;
    const e = k.find((a) => a.field === y);
    if (!e) return;
    const t = (i.shotInfo() || {}).capture, n = i.urls() || [], o = e.summaries.map((a) => a.masks && a.masks[t]).filter(Boolean);
    if (!o.length || !n.length) {
      console.info(
        `detection-tags: no masks drawn for ${e.label} — ` + (n.length ? `${e.summaries.length} summary/ies, none recording masks for capture ${t}` : "no images on screen")
      );
      return;
    }
    const s = T;
    await Promise.all(
      n.map(async (a, l) => {
        const c = await Promise.all(o.map((b) => oe(b, a)));
        if (s !== T) return;
        const A = c.filter(Boolean).flatMap((b) => b.annotations || []).filter((b) => b && b.category_name === e.label);
        if (!A.length) return;
        const I = te(A);
        !I || s !== T || (i.imageOverlay(l, I), O.add(l));
      })
    );
  }, F = async (e) => {
    if (!e || y === e.field) {
      y = null, L(null), E(), M();
      return;
    }
    y = e.field, M();
    try {
      await L(e.field), E();
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), y = null, L(null), E(), M();
    }
  }, z = (e) => e.count !== null && x !== null && e.count >= x, M = () => {
    m.innerHTML = "";
    const e = [...k].sort((s, a) => s.count === a.count ? s.label.localeCompare(a.label) : s.count === null ? 1 : a.count === null ? -1 : s.count - a.count), t = r.hideFullCoverage ? e.filter((s) => !z(s)) : e;
    t.forEach((s) => {
      const a = z(s), l = ["gdt-li"];
      y === s.field && l.push("active"), a && l.push("gdt-full");
      const c = u("BUTTON", {
        class: l.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: a ? `Every shot has ${s.label}, so highlighting it would select them all` : `Highlight shots containing ${s.label}`
      });
      c.appendChild(u("SPAN", { class: "gdt-name" }, s.label)), c.appendChild(
        u(
          "SPAN",
          { class: "gdt-count" },
          s.count === null ? "&ndash;" : `${s.count}${x ? ` / ${x}` : ""}`
        )
      ), a || c.addEventListener("click", () => F(s)), m.appendChild(c);
    }), f.disabled = !y;
    const n = e.length - t.length, o = p.querySelector(".gdt-note");
    o && o.remove(), n > 0 && p.appendChild(
      u(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, ae = () => {
    p = u("DIV", { class: "gdt-panel" });
    const e = u("DIV", { class: "gdt-h" });
    e.appendChild(u("SPAN", {}, "Detections")), f = u("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), f.disabled = !0, f.addEventListener("click", () => F(null)), e.appendChild(f), p.appendChild(e), m = u("UL", { class: "gdt-list" }), p.appendChild(m);
    const t = u("LABEL", { class: "gdt-foot" });
    return w = u("INPUT", { type: "checkbox" }), w.checked = $, w.addEventListener("change", () => {
      $ = w.checked;
      const n = V();
      n && (n.opacity = y && $ ? 0.15 : 1);
    }), t.appendChild(w), t.appendChild(u("SPAN", {}, "fade the rest")), p.appendChild(t), p;
  }, D = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    i = e;
    try {
      if (v = await Y(), !v)
        return D(
          r.connectorSrc ? `no geocam.v2Path advertised by ${r.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", v), k = await j();
    } catch (n) {
      return D(`${v || r.connectorSrc} — ${n.message}`);
    }
    const t = k.length === 0;
    if (t && console.info(`detection-tags: no tag_* fields on ${v}/0 — showing disabled`), t)
      d = u("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed"
      }), d.appendChild(u("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })), g.ui.add(d, "top-right");
    else {
      const [n] = await R(["esri/widgets/Expand"]);
      h = new n({
        view: g,
        content: ae(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: !1
      }), g.ui.add(h, "top-right"), M(), H() ? (_.push(i.urls(() => E())), _.push(i.visible(() => E()))) : console.info(
        "detection-tags: viewer has no imageOverlay — categories only, no masks"
      );
    }
    console.info(
      `detection-tags: ${k.length} categories, shot total ${x === null ? "unknown" : x} — added to the map UI${t ? " (disabled)" : ""}`
    );
  }, this.destroy = function() {
    L(null), _.splice(0).forEach((e) => e()), B(), h && (g && g.ui && g.ui.remove(h), h.destroy()), d && (g && g.ui && g.ui.remove(d), d.parentNode && d.parentNode.removeChild(d)), h = d = p = m = f = w = null;
  };
};
class ce extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const i = this.closest("geocam-viewer");
    if (!i) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let h = 0;
    const d = 8e3, p = () => {
      const m = i.viewer, f = i.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), w = f && f.mapView;
      if (h === d && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!m}, connector: ${!!f}, mapView: ${!!w}`
      ), m && typeof m.plugin == "function" && w) {
        if (this.plugin) return;
        this.viewer = m, this.plugin = new le({
          mapView: w,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: f.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        h += 100, setTimeout(p, 100);
    };
    p();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  ce
);
export {
  ce as GeocamViewerDetectionTags
};
