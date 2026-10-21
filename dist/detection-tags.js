const s = (i, n = {}, d = "") => {
  const l = document.createElement(i);
  for (let u in n)
    l.setAttribute(u, n[u]);
  return l.innerHTML = d, l;
}, U = (i, n) => {
  if (!document.getElementById(i)) {
    const d = s("STYLE", { type: "text/css", id: i }, n);
    document.getElementsByTagName("head")[0].prepend(d);
  }
  return !0;
}, j = `
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
const R = function(i = {}) {
  let n, d, l, u, g, h;
  const r = i.mapView;
  let m = null, y = [], w = null, p = null, E = !0, x = null, S = null, b;
  U("geocam-detection-tags", j);
  const O = (e, t = {}) => {
    const o = new URLSearchParams({ f: "json", ...t });
    return i.token && o.set("token", i.token), `${e}?${o}`;
  }, k = async (e, t = {}) => {
    const c = await (await fetch(O(e, t), {
      credentials: "same-origin"
    })).json();
    if (c && c.error)
      throw new Error(`${c.error.code}: ${c.error.message}`);
    return c;
  }, V = async () => {
    if (i.src) return i.src.replace(/\/+$/, "");
    if (!i.connectorSrc) return null;
    const e = i.connectorSrc.replace(/\/+$/, ""), t = await k(e), o = t && t.geocam && t.geocam.v2Path;
    return o ? new URL(o, e).href : null;
  }, _ = async () => {
    const e = await k(`${m}/0`);
    return w = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null
    }));
  }, A = async (e) => (await k(`${m}/0/query`, {
    tags: e,
    returnIdsOnly: "true"
  })).objectIds || [], D = () => {
    if (x) return x;
    const e = r && r.map && r.map.allLayers || [];
    return x = (e.toArray ? e.toArray() : Array.from(e)).find(
      (o) => o.type === "feature" && o.layerId === 0
    ), x;
  }, F = {
    color: [255, 0, 255],
    haloColor: [255, 0, 255],
    haloOpacity: 1,
    fillOpacity: 0.9
  }, N = () => {
    b === void 0 && (b = r.highlightOptions), r.highlightOptions = F;
  }, B = () => {
    b !== void 0 && (r.highlightOptions = b, b = void 0);
  }, M = () => {
    if (S) {
      try {
        S.remove();
      } catch {
      }
      S = null;
    }
  }, v = async (e) => {
    const t = D();
    if (!t) {
      console.warn("detection-tags: no shots layer on the map to recolour");
      return;
    }
    if (M(), !e) {
      t.featureEffect = null, B();
      return;
    }
    t.featureEffect = E ? { filter: { objectIds: e }, excludedEffect: "opacity(12%) grayscale(100%)" } : null, N();
    const o = p, c = await r.whenLayerView(t);
    p === o && (S = c.highlight(e));
  }, I = async (e) => {
    if (!e || p === e.field) {
      p = null, v(null), $();
      return;
    }
    p = e.field, $();
    try {
      await v(await A(e.field));
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), p = null, v(null), $();
    }
  }, H = (e) => e.count !== null && w !== null && e.count >= w, $ = () => {
    u.innerHTML = "";
    const e = [...y].sort((a, f) => a.count === f.count ? a.label.localeCompare(f.label) : a.count === null ? 1 : f.count === null ? -1 : a.count - f.count), t = i.hideFullCoverage ? e.filter((a) => !H(a)) : e;
    t.forEach((a) => {
      const f = H(a), T = ["gdt-li"];
      p === a.field && T.push("active"), f && T.push("gdt-full");
      const C = s("BUTTON", {
        class: T.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: f ? `Every shot has ${a.label}, so highlighting it would select them all` : `Highlight shots containing ${a.label}`
      });
      C.appendChild(s("SPAN", { class: "gdt-name" }, a.label)), C.appendChild(
        s(
          "SPAN",
          { class: "gdt-count" },
          a.count === null ? "&ndash;" : `${a.count}${w ? ` / ${w}` : ""}`
        )
      ), f || C.addEventListener("click", () => I(a)), u.appendChild(C);
    }), g.disabled = !p;
    const o = e.length - t.length, c = l.querySelector(".gdt-note");
    c && c.remove(), o > 0 && l.appendChild(
      s(
        "DIV",
        { class: "gdt-note" },
        `${o} categor${o === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, P = () => {
    l = s("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = s("DIV", { class: "gdt-h" });
    e.appendChild(s("SPAN", {}, "Detections")), g = s("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), g.disabled = !0, g.addEventListener("click", () => I(null)), e.appendChild(g), l.appendChild(e), u = s("UL", { class: "gdt-list" }), l.appendChild(u);
    const t = s("LABEL", { class: "gdt-foot" });
    return h = s("INPUT", { type: "checkbox" }), h.checked = E, h.addEventListener("change", async () => {
      if (E = h.checked, p) {
        const o = y.find((c) => c.field === p);
        o && await v(await A(o.field));
      }
    }), t.appendChild(h), t.appendChild(s("SPAN", {}, "fade the rest")), l.appendChild(t), l;
  }, L = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    try {
      if (m = await V(), !m)
        return L(
          i.connectorSrc ? `no geocam.v2Path advertised by ${i.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", m), y = await _();
    } catch (t) {
      return L(`${m || i.connectorSrc} — ${t.message}`);
    }
    if (!y.length)
      return L(`no tag_* fields on ${m}/0 — cell not segmented?`);
    d = s("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell"
    }), d.addEventListener("click", () => {
      l.hidden = !l.hidden;
    }), n = s("DIV", { class: "gdt-container" }), n.appendChild(d), n.appendChild(P()), r.ui.add(n, "top-right"), $(), console.info(
      `detection-tags: ${y.length} categories, shot total ${w === null ? "unknown" : w} — button added to right-top`
    );
  }, this.destroy = function() {
    v(null), n && (r && r.ui && r.ui.remove(n), n.parentNode && n.parentNode.removeChild(n)), n = d = l = u = g = h = null;
  };
};
class Y extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const n = this.closest("geocam-viewer");
    if (!n) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let d = 0;
    const l = 8e3, u = () => {
      const g = n.viewer, h = n.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), r = h && h.mapView;
      if (d === l && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!g}, connector: ${!!h}, mapView: ${!!r}`
      ), g && typeof g.plugin == "function" && r) {
        if (this.plugin) return;
        this.viewer = g, this.plugin = new R({
          mapView: r,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: h.getAttribute("src"),
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
