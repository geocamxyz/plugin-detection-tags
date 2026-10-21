const s = (o, r = {}, d = "") => {
  const i = document.createElement(o);
  for (let u in r)
    i.setAttribute(u, r[u]);
  return i.innerHTML = d, i;
}, R = (o, r) => {
  if (!document.getElementById(o)) {
    const d = s("STYLE", { type: "text/css", id: o }, r);
    document.getElementsByTagName("head")[0].prepend(d);
  }
  return !0;
}, B = `
  .gdt-container { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .gdt-panel { width: 240px; max-height: 60vh; overflow-y: auto; font: 13px/1.4 system-ui, sans-serif;
    color: #1f2328; background: #fff; border: 1px solid rgba(15,16,6,.1); border-radius: 14px;
    box-shadow: 0 1px 2px rgba(0,0,0,.06); padding: 10px; }
  .gdt-panel[hidden] { display: none; }
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
  /* esri-widget--button supplies the white background, size and hover; this
     only adds the glyph. background-size/position are set because the class
     expects an icon font child rather than a background image. */
  .geocam-detection-tags-button { background-repeat: no-repeat; background-position: center;
    background-size: 18px 18px; cursor: pointer; }
  .geocam-detection-tags-button.gdt-off { opacity: .4; cursor: default; }
  .geocam-detection-tags-button { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;
const N = function(o = {}) {
  let r, d, i, u, p, g;
  const l = o.mapView;
  let f = null, y = [], w = null, h = null, v = !0, x = null, b = null, E = !1;
  R("geocam-detection-tags", B);
  const F = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return o.token && n.set("token", o.token), `${e}?${n}`;
  }, C = async (e, t = {}) => {
    const c = await (await fetch(F(e, t), {
      credentials: "same-origin"
    })).json();
    if (c && c.error)
      throw new Error(`${c.error.code}: ${c.error.message}`);
    return c;
  }, H = async () => {
    if (o.src) return o.src.replace(/\/+$/, "");
    if (!o.connectorSrc) return null;
    const e = new URL(o.connectorSrc.replace(/\/+$/, ""), window.location.href).href, t = await C(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, M = async () => {
    const e = await C(`${f}/0`);
    return w = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null
    }));
  }, T = () => {
    if (x) return x;
    const e = l && l.map && l.map.allLayers || [];
    return x = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), x;
  }, D = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, A = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...c) => t(c), n);
  }), P = async () => {
    if (!o.token || E) return;
    const [e] = await A(["esri/identity/IdentityManager"]);
    e.registerToken({ server: f, token: o.token }), E = !0;
  }, U = () => {
    if (b) {
      try {
        l.map.remove(b);
      } catch {
      }
      b = null;
    }
  }, k = async (e) => {
    const t = T();
    if (U(), t && (t.opacity = e && v ? 0.15 : 1), !e) return;
    const n = h, [c] = await A(["esri/layers/FeatureLayer"]);
    await P(), h === n && (b = new c({
      url: `${f}/0`,
      // No token here: Esri strips `token` from customParameters because it
      // manages credentials itself, which silently 403s the layer's own
      // metadata request. It goes through IdentityManager instead.
      customParameters: { tags: e },
      outFields: [],
      popupEnabled: !1,
      legendEnabled: !1,
      listMode: "hide",
      // not a layer the operator manages; keep it out of LayerList
      renderer: { type: "simple", symbol: D }
    }), l.map.add(b));
  }, I = async (e) => {
    if (!e || h === e.field) {
      h = null, k(null), S();
      return;
    }
    h = e.field, S();
    try {
      await k(e.field);
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), h = null, k(null), S();
    }
  }, _ = (e) => e.count !== null && w !== null && e.count >= w, S = () => {
    u.innerHTML = "";
    const e = [...y].sort((a, m) => a.count === m.count ? a.label.localeCompare(m.label) : a.count === null ? 1 : m.count === null ? -1 : a.count - m.count), t = o.hideFullCoverage ? e.filter((a) => !_(a)) : e;
    t.forEach((a) => {
      const m = _(a), L = ["gdt-li"];
      h === a.field && L.push("active"), m && L.push("gdt-full");
      const $ = s("BUTTON", {
        class: L.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: m ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      $.appendChild(s("SPAN", { class: "gdt-name" }, a.label)), $.appendChild(
        s(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${w ? ` / ${w}` : ""}`
        )
      ), m || $.addEventListener("click", () => I(a)), u.appendChild($);
    }), p.disabled = !h;
    const n = e.length - t.length, c = i.querySelector(".gdt-note");
    c && c.remove(), n > 0 && i.appendChild(
      s(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, O = () => {
    i = s("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = s("DIV", { class: "gdt-h" });
    e.appendChild(s("SPAN", {}, "Detections")), p = s("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), p.disabled = !0, p.addEventListener("click", () => I(null)), e.appendChild(p), i.appendChild(e), u = s("UL", { class: "gdt-list" }), i.appendChild(u);
    const t = s("LABEL", { class: "gdt-foot" });
    return g = s("INPUT", { type: "checkbox" }), g.checked = v, g.addEventListener("change", () => {
      v = g.checked;
      const n = T();
      n && (n.opacity = h && v ? 0.15 : 1);
    }), t.appendChild(g), t.appendChild(s("SPAN", {}, "fade the rest")), i.appendChild(t), i;
  }, V = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    try {
      if (f = await H(), !f)
        return V(
          o.connectorSrc ? `no geocam.v2Path advertised by ${o.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", f), y = await M();
    } catch (n) {
      return V(`${f || o.connectorSrc} — ${n.message}`);
    }
    const t = y.length === 0;
    t && console.info(`detection-tags: no tag_* fields on ${f}/0 — showing disabled`), d = s("DIV", {
      class: `geocam-detection-tags-button esri-widget--button${t ? " gdt-off" : ""}`,
      role: "button",
      title: t ? "Segmentations or summary not completed" : "Detections found in this cell"
    }), t || d.addEventListener("click", () => {
      i.hidden = !i.hidden;
    }), r = s("DIV", { class: "gdt-container" }), r.appendChild(d), t || (r.appendChild(O()), S()), l.ui.add(r, "top-right"), console.info(
      `detection-tags: ${y.length} categories, shot total ${w === null ? "unknown" : w} — button added to the map UI${t ? " (disabled)" : ""}`
    );
  }, this.destroy = function() {
    k(null), r && (l && l.ui && l.ui.remove(r), r.parentNode && r.parentNode.removeChild(r)), r = d = i = u = p = g = null;
  };
};
class Y extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const r = this.closest("geocam-viewer");
    if (!r) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let d = 0;
    const i = 8e3, u = () => {
      const p = r.viewer, g = r.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), l = g && g.mapView;
      if (d === i && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!p}, connector: ${!!g}, mapView: ${!!l}`
      ), p && typeof p.plugin == "function" && l) {
        if (this.plugin) return;
        this.viewer = p, this.plugin = new N({
          mapView: l,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: g.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        d += 100, setTimeout(u, 100);
    };
    u();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  Y
);
export {
  Y as GeocamViewerDetectionTags
};
