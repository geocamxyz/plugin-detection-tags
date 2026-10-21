const i = (n, a = {}, s = "") => {
  const o = document.createElement(n);
  for (let c in a)
    o.setAttribute(c, a[c]);
  return o.innerHTML = s, o;
}, U = (n, a) => {
  if (!document.getElementById(n)) {
    const s = i("STYLE", { type: "text/css", id: n }, a);
    document.getElementsByTagName("head")[0].prepend(s);
  }
  return !0;
}, B = `
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
const H = function(n = {}) {
  let a, s, o, c, d, u;
  const f = n.mapView;
  let m = null, b = [], w = null, p = null, $ = !0, v = null;
  U("geocam-detection-tags", B);
  const I = (e, t = {}) => {
    const r = new URLSearchParams({ f: "json", ...t });
    return n.token && r.set("token", n.token), `${e}?${r}`;
  }, E = async (e, t = {}) => {
    const g = await (await fetch(I(e, t), {
      credentials: "same-origin"
    })).json();
    if (g && g.error)
      throw new Error(`${g.error.code}: ${g.error.message}`);
    return g;
  }, V = async () => {
    if (n.src) return n.src.replace(/\/+$/, "");
    if (!n.connectorSrc) return null;
    const e = n.connectorSrc.replace(/\/+$/, ""), t = await E(e), r = t && t.geocam && t.geocam.v2Path;
    return r ? new URL(r, e).href : null;
  }, F = async () => {
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
  })).objectIds || [], _ = () => {
    if (v) return v;
    const e = f && f.map && f.map.allLayers || [];
    return v = (e.toArray ? e.toArray() : Array.from(e)).find(
      (r) => typeof r.url == "string" && r.url.replace(/\/+$/, "").endsWith("/0")
    ), v;
  }, y = (e) => {
    const t = _();
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
    if (!e || p === e.field) {
      p = null, y(null), x();
      return;
    }
    p = e.field, x();
    try {
      y(await L(e.field));
    } catch (t) {
      console.warn("detection-tags: could not select", e.field, t), p = null, y(null), x();
    }
  }, T = (e) => e.count !== null && w !== null && e.count >= w, x = () => {
    c.innerHTML = "";
    const e = [...b].sort((l, h) => l.count === h.count ? l.label.localeCompare(h.label) : l.count === null ? 1 : h.count === null ? -1 : l.count - h.count), t = n.hideFullCoverage ? e.filter((l) => !T(l)) : e;
    t.forEach((l) => {
      const h = T(l), k = ["gdt-li"];
      p === l.field && k.push("active"), h && k.push("gdt-full");
      const S = i("BUTTON", {
        class: k.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: h ? `Every shot has ${l.label}, so highlighting it would select them all` : `Highlight shots containing ${l.label}`
      });
      S.appendChild(i("SPAN", { class: "gdt-name" }, l.label)), S.appendChild(
        i(
          "SPAN",
          { class: "gdt-count" },
          l.count === null ? "&ndash;" : `${l.count}${w ? ` / ${w}` : ""}`
        )
      ), h || S.addEventListener("click", () => A(l)), c.appendChild(S);
    }), d.disabled = !p;
    const r = e.length - t.length, g = o.querySelector(".gdt-note");
    g && g.remove(), r > 0 && o.appendChild(
      i(
        "DIV",
        { class: "gdt-note" },
        `${r} categor${r === 1 ? "y" : "ies"} on every shot, hidden`
      )
    );
  }, N = () => {
    o = i("DIV", { class: "gdt-panel", hidden: "hidden" });
    const e = i("DIV", { class: "gdt-h" });
    e.appendChild(i("SPAN", {}, "Detections")), d = i("BUTTON", { class: "gdt-clear", type: "button" }, "clear"), d.disabled = !0, d.addEventListener("click", () => A(null)), e.appendChild(d), o.appendChild(e), c = i("UL", { class: "gdt-list" }), o.appendChild(c);
    const t = i("LABEL", { class: "gdt-foot" });
    return u = i("INPUT", { type: "checkbox" }), u.checked = $, u.addEventListener("change", async () => {
      if ($ = u.checked, p) {
        const r = b.find((g) => g.field === p);
        r && y(await L(r.field));
      }
    }), t.appendChild(u), t.appendChild(i("SPAN", {}, "fade the rest")), o.appendChild(t), o;
  }, C = (e) => {
    console.info(`detection-tags: not shown — ${e}`);
  };
  this.init = async function(e) {
    a = e;
    try {
      if (m = await V(), !m)
        return C(
          n.connectorSrc ? `no geocam.v2Path advertised by ${n.connectorSrc} (Manager too old?)` : "no src attribute and no arcgis connector src to discover one from"
        );
      console.debug("detection-tags: using", m), b = await F();
    } catch (t) {
      return C(`${m || n.connectorSrc} — ${t.message}`);
    }
    if (!b.length)
      return C(`no tag_* fields on ${m}/0 — cell not segmented?`);
    s = i("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell"
    }), s.addEventListener("click", () => {
      o.hidden = !o.hidden;
    }), a.addControl(s, "right-top"), a.addControl(N(), "right-top"), x(), console.info(
      `detection-tags: ${b.length} categories, shot total ${w === null ? "unknown" : w} — button added to right-top`
    );
  }, this.destroy = function() {
    y(null), [s, o].forEach((e) => {
      e && e.parentNode && e.parentNode.removeChild(e);
    }), s = o = c = d = u = null;
  };
};
class M extends HTMLElement {
  constructor() {
    super(), this.plugin = null, this.viewer = null;
  }
  connectedCallback() {
    const a = this.closest("geocam-viewer");
    if (!a) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }
    let s = 0;
    const o = 8e3, c = () => {
      const d = a.viewer, u = a.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      ), f = u && u.mapView;
      if (s === o && console.warn(
        "detection-tags: still waiting to attach after 8s —",
        `viewer: ${!!d}, connector: ${!!u}, mapView: ${!!f}`
      ), d && typeof d.plugin == "function" && f) {
        if (this.plugin) return;
        this.viewer = d, this.plugin = new H({
          mapView: f,
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
  M
);
export {
  M as GeocamViewerDetectionTags
};
