const i = (l, a = {}, s = "") => {
  const n = document.createElement(l);
  for (let c in a)
    n.setAttribute(c, a[c]);
  return n.innerHTML = s, n;
}, U = (l, a) => {
  if (!document.getElementById(l)) {
    const s = i("STYLE", { type: "text/css", id: l }, a);
    document.getElementsByTagName("head")[0].prepend(s);
  }
  return !0;
}, _ = `
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
const B = function(l = {}) {
  let a, s, n, c, u, h;
  const E = l.mapView;
  let w = null, b = [], f = null, p = null, C = !0, y = null;
  U("geocam-detection-tags", _);
  const $ = (e, t = {}) => {
    const o = new URLSearchParams({ f: "json", ...t });
    return l.token && o.set("token", l.token), `${e}?${o}`;
  }, S = async (e, t = {}) => {
    const d = await (await fetch($(e, t), {
      credentials: "same-origin"
    })).json();
    if (d && d.error)
      throw new Error(`${d.error.code}: ${d.error.message}`);
    return d;
  }, I = async () => {
    if (l.src) return l.src.replace(/\/+$/, "");
    if (!l.connectorSrc) return null;
    const e = l.connectorSrc.replace(/\/+$/, ""), t = await S(e), o = t && t.geocam && t.geocam.v2Path;
    return o ? new URL(o, e).href : null;
  }, V = async () => {
    const e = await S(`${w}/0`);
    return f = typeof e.geocamShotCount == "number" ? e.geocamShotCount : null, (e.fields || []).filter((t) => t.name && t.name.startsWith("tag_")).map((t) => ({
      field: t.name,
      label: t.alias || t.name.replace(/^tag_/, ""),
      // Absent rather than 0 when the cell was tagged before counts were
      // recorded. Keep the distinction: unknown is not "no shots".
      count: typeof t.count == "number" ? t.count : null
    }));
  }, L = async (e) => (await S(`${w}/0/query`, {
    tags: e,
    returnIdsOnly: "true"
  })).objectIds || [], F = () => {
    if (y) return y;
    const e = E && E.map && E.map.allLayers || [];
    return y = (e.toArray ? e.toArray() : Array.from(e)).find(
      (o) => typeof o.url == "string" && o.url.replace(/\/+$/, "").endsWith("/0")
    ), y;
  }, m = (e) => {
    const t = F();
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
      excludedEffect: C ? "opacity(12%) grayscale(100%)" : null
    };
  }, T = async (e) => {
    if (!e || p === e.field) {
      p = null, m(null), x();
      return;
    }
    p = e.field, x();
    try {
      m(await L(e.field));
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), p = null, m(null), x();
    }
  }, A = (e) => e.count !== null && f !== null && e.count >= f, x = () => {
    c.innerHTML = "";
    const e = [...b].sort((r, g) => r.count === g.count ? r.label.localeCompare(g.label) : r.count === null ? 1 : g.count === null ? -1 : r.count - g.count), t = l.hideFullCoverage ? e.filter((r) => !A(r)) : e;
    t.forEach((r) => {
      const g = A(r), k = ["gdt-li"];
      p === r.field && k.push("active"), g && k.push("gdt-full");
      const v = i("BUTTON", {
        class: k.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: g ? `Every shot has ${r.label}, so highlighting it would select them all` : `Highlight shots containing ${r.label}`
      });
      v.appendChild(i("SPAN", { class: "gdt-name" }, r.label)), v.appendChild(
        i(
          "SPAN",
          { class: "gdt-count" },
          r.count === null ? "&ndash;" : `${r.count}${f ? ` / ${f}` : ""}`
        )
      ), g || v.addEventListener("click", () => T(r)), c.appendChild(v);
    }), u.disabled = !p;
    const o = e.length - t.length, d = n.querySelector(".gdt-note");
    d && d.remove(), o > 0 && n.appendChild(
      i(
        "DIV",
        { class: "gdt-note" },
        `${o} categor${o === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, N = () => {
    n = i("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = i("DIV", { class: "gdt-h" });
    e.appendChild(i("SPAN", {}, "Detections")), u = i("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), u.disabled = !0, u.addEventListener("click", () => T(null)), e.appendChild(u), n.appendChild(e), c = i("UL", { class: "gdt-list" }), n.appendChild(c);
    const t = i("LABEL", { class: "gdt-foot" });
    return h = i("INPUT", { type: "checkbox" }), h.checked = C, h.addEventListener("change", async () => {
      if (C = h.checked, p) {
        const o = b.find((d) => d.field === p);
        o && m(await L(o.field));
      }
    }), t.appendChild(h), t.appendChild(i("SPAN", {}, "fade the rest")), n.appendChild(t), n;
  };
  this.init = async function(e) {
    a = e;
    try {
      if (w = await I(), !w) return;
      b = await V();
    } catch (t) {
      console.info("detection-tags: no categories available", t.message);
      return;
    }
    b.length && (s = i("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell"
    }), s.addEventListener("click", () => {
      n.hidden = !n.hidden;
    }), a.addControl(s, "right-top"), a.addControl(N(), "right-top"), x());
  }, this.destroy = function() {
    m(null), [s, n].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), s = n = c = u = h = null;
  };
};
class H extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const a = this.closest("geocam-viewer");
    if (!a) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    const s = () => {
      const n = a.viewer, c = a.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), u = c && c.mapView;
      if (n && typeof n.plugin == "function" && u) {
        if (this.plugin) return;
        this.viewer = n, this.plugin = new B({
          mapView: u,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: c.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage")
        }), this.viewer.plugin(this.plugin);
      } else
        setTimeout(s, 100);
    };
    s();
  }
  disconnectedCallback() {
    this.plugin && typeof this.plugin.destroy == "function" && this.plugin.destroy(), this.plugin = null, this.viewer = null;
  }
}
window.customElements.define(
  "geocam-viewer-detection-tags",
  H
);
export {
  H as GeocamViewerDetectionTags
};
