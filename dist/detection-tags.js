const l = (o, r = {}, d = "") => {
  const i = document.createElement(o);
  for (let u in r)
    i.setAttribute(u, r[u]);
  return i.innerHTML = d, i;
}, O = (o, r) => {
  if (!document.getElementById(o)) {
    const d = l("STYLE", { type: "text/css", id: o }, r);
    document.getElementsByTagName("head")[0].prepend(d);
  }
  return !0;
}, R = `
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
  .geocam-detection-tags-button { background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;
const U = function(o = {}) {
  let r, d, i, u, p, g;
  const s = o.mapView;
  let f = null, b = [], w = null, h = null, v = !0, x = null, y = null, C = !1;
  O("geocam-detection-tags", R);
  const H = (e, t = {}) => {
    const n = new URLSearchParams({ f: "json", ...t });
    return o.token && n.set("token", o.token), `${e}?${n}`;
  }, T = async (e, t = {}) => {
    const c = await (await fetch(H(e, t), {
      credentials: "same-origin"
    })).json();
    if (c && c.error)
      throw new Error(`${c.error.code}: ${c.error.message}`);
    return c;
  }, M = async () => {
    if (o.src) return o.src.replace(/\/+$/, "");
    if (!o.connectorSrc) return null;
    const e = o.connectorSrc.replace(/\/+$/, ""), t = await T(e), n = t && t.geocam && t.geocam.v2Path;
    return n ? new URL(n, e).href : null;
  }, D = async () => {
    const e = await T(`${f}/0`);
    return w = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null
    }));
  }, A = () => {
    if (x) return x;
    const e = s && s.map && s.map.allLayers || [];
    return x = (e.toArray ? e.toArray() : Array.from(e)).find(
      (n) => n.type === "feature" && n.layerId === 0
    ), x;
  }, F = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 }
  }, I = (e) => new Promise((t, n) => {
    if (!window.require) return n(new Error("ArcGIS API not loaded"));
    window.require(e, (...c) => t(c), n);
  }), P = async () => {
    if (!o.token || C) return;
    const [e] = await I(["esri/identity/IdentityManager"]);
    e.registerToken({ server: f, token: o.token }), C = !0;
  }, B = () => {
    if (y) {
      try {
        s.map.remove(y);
      } catch {
      }
      y = null;
    }
  }, k = async (e) => {
    const t = A();
    if (B(), t && (t.opacity = e && v ? 0.15 : 1), !e) return;
    const n = h, [c] = await I(["esri/layers/FeatureLayer"]);
    await P(), h === n && (y = new c({
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
      renderer: { type: "simple", symbol: F }
    }), s.map.add(y));
  }, V = async (e) => {
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
    const e = [...b].sort((a, m) => a.count === m.count ? a.label.localeCompare(m.label) : a.count === null ? 1 : m.count === null ? -1 : a.count - m.count), t = o.hideFullCoverage ? e.filter((a) => !_(a)) : e;
    t.forEach((a) => {
      const m = _(a), E = ["gdt-li"];
      h === a.field && E.push("active"), m && E.push("gdt-full");
      const L = l("BUTTON", {
        class: E.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: m ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      L.appendChild(l("SPAN", { class: "gdt-name" }, a.label)), L.appendChild(
        l(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${w ? ` / ${w}` : ""}`
        )
      ), m || L.addEventListener("click", () => V(a)), u.appendChild(L);
    }), p.disabled = !h;
    const n = e.length - t.length, c = i.querySelector(".gdt-note");
    c && c.remove(), n > 0 && i.appendChild(
      l(
        "DIV",
        { class: "gdt-note" },
        `${n} categor${n === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, N = () => {
    i = l("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = l("DIV", { class: "gdt-h" });
    e.appendChild(l("SPAN", {}, "Detections")), p = l("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), p.disabled = !0, p.addEventListener("click", () => V(null)), e.appendChild(p), i.appendChild(e), u = l("UL", { class: "gdt-list" }), i.appendChild(u);
    const t = l("LABEL", { class: "gdt-foot" });
    return g = l("INPUT", { type: "checkbox" }), g.checked = v, g.addEventListener("change", () => {
      v = g.checked;
      const n = A();
      n && (n.opacity = h && v ? 0.15 : 1);
    }), t.appendChild(g), t.appendChild(l("SPAN", {}, "fade the rest")), i.appendChild(t), i;
  }, $ = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    try {
      if (f = await M(), !f)
        return $(
          o.connectorSrc ? `no geocam.v2Path advertised by ${o.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", f), b = await D();
    } catch (t) {
      return $(`${f || o.connectorSrc} — ${t.message}`);
    }
    if (!b.length)
      return $(`no tag_* fields on ${f}/0 — cell not segmented?`);
    d = l("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell"
    }), d.addEventListener("click", () => {
      i.hidden = !i.hidden;
    }), r = l("DIV", { class: "gdt-container" }), r.appendChild(d), r.appendChild(N()), s.ui.add(r, "top-right"), S(), console.info(
      `detection-tags: ${b.length} categories, shot total ${w === null ? "unknown" : w} — button added to right-top`
    );
  }, this.destroy = function() {
    k(null), r && (s && s.ui && s.ui.remove(r), r.parentNode && r.parentNode.removeChild(r)), r = d = i = u = p = g = null;
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
      ), s = g && g.mapView;
      if (d === i && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!p}, connector: ${!!g}, mapView: ${!!s}`
      ), p && typeof p.plugin == "function" && s) {
        if (this.plugin) return;
        this.viewer = p, this.plugin = new U({
          mapView: s,
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
