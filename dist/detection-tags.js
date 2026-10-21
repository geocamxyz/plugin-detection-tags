const a = (o, n = {}, s = "") => {
  const r = document.createElement(o);
  for (let c in n)
    r.setAttribute(c, n[c]);
  return r.innerHTML = s, r;
}, F = (o, n) => {
  if (!document.getElementById(o)) {
    const s = a("STYLE", { type: "text/css", id: o }, n);
    document.getElementsByTagName("head")[0].prepend(s);
  }
  return !0;
}, N = `
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
const O = function(o = {}) {
  let n, s, r, c, d, u;
  const g = o.mapView;
  let m = null, b = [], w = null, h = null, $ = !0, x = null;
  F("geocam-detection-tags", N);
  const I = (e, t = {}) => {
    const i = new URLSearchParams({ f: "json", ...t });
    return o.token && i.set("token", o.token), `${e}?${i}`;
  }, E = async (e, t = {}) => {
    const p = await (await fetch(I(e, t), {
      credentials: "same-origin"
    })).json();
    if (p && p.error)
      throw new Error(`${p.error.code}: ${p.error.message}`);
    return p;
  }, V = async () => {
    if (o.src) return o.src.replace(/\/+$/, "");
    if (!o.connectorSrc) return null;
    const e = o.connectorSrc.replace(/\/+$/, ""), t = await E(e), i = t && t.geocam && t.geocam.v2Path;
    return i ? new URL(i, e).href : null;
  }, _ = async () => {
    const e = await E(`${m}/0`);
    return w = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null
    }));
  }, L = async (e) => (await E(`${m}/0/query`, {
    tags: e,
    returnIdsOnly: "true"
  })).objectIds || [], D = () => {
    if (x) return x;
    const e = g && g.map && g.map.allLayers || [];
    return x = (e.toArray ? e.toArray() : Array.from(e)).find(
      (i) => i.type === "feature" && i.layerId === 0
    ), x;
  }, y = (e) => {
    const t = D();
    if (!t) {
      console.warn("detection-tags: no shots layer on the map to recolour");
      return;
    }
    if (!e) {
      t.featureEffect = null;
      return;
    }
    t.featureEffect = {
      filter: { objectIds: e },
      includedEffect: "drop-shadow(0 0 6px #ff00ff) saturate(300%)",
      excludedEffect: $ ? "opacity(12%) grayscale(100%)" : null
    };
  }, A = async (e) => {
    if (!e || h === e.field) {
      h = null, y(null), v();
      return;
    }
    h = e.field, v();
    try {
      y(await L(e.field));
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), h = null, y(null), v();
    }
  }, T = (e) => e.count !== null && w !== null && e.count >= w, v = () => {
    c.innerHTML = "";
    const e = [...b].sort((l, f) => l.count === f.count ? l.label.localeCompare(f.label) : l.count === null ? 1 : f.count === null ? -1 : l.count - f.count), t = o.hideFullCoverage ? e.filter((l) => !T(l)) : e;
    t.forEach((l) => {
      const f = T(l), k = ["gdt-li"];
      h === l.field && k.push("active"), f && k.push("gdt-full");
      const S = a("BUTTON", {
        class: k.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: f ? `Every shot has ${l.label}, so highlighting it would select them all` : `Highlight shots containing ${l.label}`
      });
      S.appendChild(a("SPAN", { class: "gdt-name" }, l.label)), S.appendChild(
        a(
          "SPAN",
          { class: "gdt-count" },
          l.count === null ? "&ndash;" : `${l.count}${w ? ` / ${w}` : ""}`
        )
      ), f || S.addEventListener("click", () => A(l)), c.appendChild(S);
    }), d.disabled = !h;
    const i = e.length - t.length, p = r.querySelector(".gdt-note");
    p && p.remove(), i > 0 && r.appendChild(
      a(
        "DIV",
        { class: "gdt-note" },
        `${i} categor${i === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, H = () => {
    r = a("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = a("DIV", { class: "gdt-h" });
    e.appendChild(a("SPAN", {}, "Detections")), d = a("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), d.disabled = !0, d.addEventListener("click", () => A(null)), e.appendChild(d), r.appendChild(e), c = a("UL", { class: "gdt-list" }), r.appendChild(c);
    const t = a("LABEL", { class: "gdt-foot" });
    return u = a("INPUT", { type: "checkbox" }), u.checked = $, u.addEventListener("change", async () => {
      if ($ = u.checked, h) {
        const i = b.find((p) => p.field === h);
        i && y(await L(i.field));
      }
    }), t.appendChild(u), t.appendChild(a("SPAN", {}, "fade the rest")), r.appendChild(t), r;
  }, C = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    try {
      if (m = await V(), !m)
        return C(
          o.connectorSrc ? `no geocam.v2Path advertised by ${o.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", m), b = await _();
    } catch (t) {
      return C(`${m || o.connectorSrc} — ${t.message}`);
    }
    if (!b.length)
      return C(`no tag_* fields on ${m}/0 — cell not segmented?`);
    s = a("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell"
    }), s.addEventListener("click", () => {
      r.hidden = !r.hidden;
    }), n = a("DIV", { class: "gdt-container" }), n.appendChild(s), n.appendChild(H()), g.ui.add(n, "top-right"), v(), console.info(
      `detection-tags: ${b.length} categories, shot total ${w === null ? "unknown" : w} — button added to right-top`
    );
  }, this.destroy = function() {
    y(null), n && (g && g.ui && g.ui.remove(n), n.parentNode && n.parentNode.removeChild(n)), n = s = r = c = d = u = null;
  };
};
class B extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const n = this.closest("geocam-viewer");
    if (!n) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let s = 0;
    const r = 8e3, c = () => {
      const d = n.viewer, u = n.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), g = u && u.mapView;
      if (s === r && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!d}, connector: ${!!u}, mapView: ${!!g}`
      ), d && typeof d.plugin == "function" && g) {
        if (this.plugin) return;
        this.viewer = d, this.plugin = new O({
          mapView: g,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: u.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        s += 100, setTimeout(c, 100);
    };
    c();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  B
);
export {
  B as GeocamViewerDetectionTags
};
