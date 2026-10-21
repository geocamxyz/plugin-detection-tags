const node = (name, attrs = {}, content = "") => {
  const el = document.createElement(name);
  for (let i in attrs) {
    el.setAttribute(i, attrs[i]);
  }
  el.innerHTML = content;
  return el;
};

const injectStyle = (id, rules) => {
  if (!document.getElementById(id)) {
    const style = node("STYLE", { type: "text/css", id }, rules);
    document.getElementsByTagName("head")[0].prepend(style);
  }
  return true;
};

const STYLES = `
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
  .geocam-detection-tags-button { background-image: url('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"\
 stroke-linecap="round" stroke-linejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3"/>\
<path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/>\
<path d="M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>'); }
`;

// Which of the shot-position layers we recolour. 0 is processed positions, the
// layer the map draws by default. Used both as the service path when querying
// and as the Esri layerId when locating the drawn layer.
const SHOT_LAYER_ID = 0;
const SHOT_LAYER_SUFFIX = `/${SHOT_LAYER_ID}`;

export const detectionTags = function (config = {}) {
  let viewer;
  let container;
  let button;
  let panel;
  let listEl;
  let clearBtn;
  let fadeInput;
  const mapView = config.mapView;

  let v2Base = null; // resolved FeatureServer root for the v2 service
  let categories = []; // [{ field, label, count }]
  let shotCount = null; // cell total, the denominator
  let selected = null; // field name of the active category, or null
  let fadeOthers = true;
  let shotsLayer = null;

  injectStyle("geocam-detection-tags", STYLES);

  // --- talking to the service ----------------------------------------------

  const withAuth = (url, params = {}) => {
    const search = new URLSearchParams({ f: "json", ...params });
    if (config.token) search.set("token", config.token);
    return `${url}?${search}`;
  };

  // credentials are sent for the same-origin case, where the Manager session
  // cookie is the credential. Cross-origin needs the token attribute.
  const fetchJson = async (url, params = {}) => {
    const response = await fetch(withAuth(url, params), {
      credentials: "same-origin",
    });
    const body = await response.json();
    // An Esri service answers errors with 200 and an `error` member, so the
    // HTTP status alone is not enough to know this worked.
    if (body && body.error) {
      throw new Error(`${body.error.code}: ${body.error.message}`);
    }
    return body;
  };

  // The categories live on the public_id-keyed service while the map is
  // normally pointed at legacy cell+{slug}. The legacy root advertises its v2
  // equivalent, so we can find it rather than be told it.
  const resolveV2Base = async () => {
    if (config.src) return config.src.replace(/\/+$/, "");
    if (!config.connectorSrc) return null;

    const legacy = config.connectorSrc.replace(/\/+$/, "");
    const root = await fetchJson(legacy);
    const path = root && root.geocam && root.geocam.v2Path;
    if (!path) return null;

    // A path, resolved against the origin the legacy service was fetched from.
    return new URL(path, legacy).href;
  };

  const loadCategories = async () => {
    const definition = await fetchJson(`${v2Base}${SHOT_LAYER_SUFFIX}`);
    shotCount =
      typeof definition.geocamShotCount === "number"
        ? definition.geocamShotCount
        : null;

    return (definition.fields || [])
      .filter((f) => f.name && f.name.startsWith("tag_"))
      .map((f) => ({
        field: f.name,
        label: f.alias || f.name.replace(/^tag_/, ""),
        // Absent rather than 0 when the cell was tagged before counts were
        // recorded. Keep the distinction: unknown is not "no shots".
        count: typeof f.count === "number" ? f.count : null,
      }));
  };

  const idsFor = async (field) => {
    const body = await fetchJson(`${v2Base}${SHOT_LAYER_SUFFIX}/query`, {
      tags: field,
      returnIdsOnly: "true",
    });
    return body.objectIds || [];
  };

  // --- the map -------------------------------------------------------------

  // The connector keeps its layer list private, so find the shot layer on the
  // map by the service path it was built from. Both services expose shots.id as
  // the object id, which is what lets ids fetched from v2 address features on a
  // layer drawn from legacy.
  // Matched on layerId, NOT on the url ending in /0. Esri normalises a
  // FeatureLayer built from ".../FeatureServer/0" so that `url` becomes the
  // service root and the index moves to `layerId` — so a url suffix test never
  // matches and the effect silently never applies.
  const findShotsLayer = () => {
    if (shotsLayer) return shotsLayer;
    const layers = (mapView && mapView.map && mapView.map.allLayers) || [];
    const all = layers.toArray ? layers.toArray() : Array.from(layers);
    shotsLayer = all.find(
      (l) => l.type === "feature" && l.layerId === SHOT_LAYER_ID
    );
    return shotsLayer;
  };

  // featureEffect rather than swapping the renderer: it leaves the service's
  // own symbology alone, and it composes with the connector's zoom-thinning
  // definitionExpression instead of competing with it.
  const applyEffect = (ids) => {
    const layer = findShotsLayer();
    if (!layer) {
      console.warn("detection-tags: no shots layer on the map to recolour");
      return;
    }

    if (!ids) {
      layer.featureEffect = null;
      return;
    }

    layer.featureEffect = {
      filter: { objectIds: ids },
      includedEffect: "drop-shadow(0 0 6px #ff00ff) saturate(300%)",
      excludedEffect: fadeOthers ? "opacity(12%) grayscale(100%)" : null,
    };
  };

  // --- UI ------------------------------------------------------------------

  const select = async (category) => {
    if (!category || selected === category.field) {
      selected = null;
      applyEffect(null);
      render();
      return;
    }

    selected = category.field;
    render();

    try {
      applyEffect(await idsFor(category.field));
    } catch (e) {
      console.warn("detection-tags: could not select", category.field, e);
      selected = null;
      applyEffect(null);
      render();
    }
  };

  const isFullCoverage = (c) =>
    c.count !== null && shotCount !== null && c.count >= shotCount;

  const render = () => {
    listEl.innerHTML = "";

    // Least-covered first: a category on 1 of 18 shots is the one worth
    // looking at, and one on all 18 is the one worth ignoring.
    const ordered = [...categories].sort((a, b) => {
      if (a.count === b.count) return a.label.localeCompare(b.label);
      if (a.count === null) return 1;
      if (b.count === null) return -1;
      return a.count - b.count;
    });

    const shown = config.hideFullCoverage
      ? ordered.filter((c) => !isFullCoverage(c))
      : ordered;

    shown.forEach((c) => {
      const full = isFullCoverage(c);
      const classes = ["gdt-li"];
      if (selected === c.field) classes.push("active");
      if (full) classes.push("gdt-full");

      const item = node("BUTTON", {
        class: classes.join(" "),
        type: "button",
        // Selecting a category every shot carries would recolour the lot,
        // which tells you nothing — so say so rather than let it look broken.
        title: full
          ? `Every shot has ${c.label}, so highlighting it would select them all`
          : `Highlight shots containing ${c.label}`,
      });
      item.appendChild(node("SPAN", { class: "gdt-name" }, c.label));
      item.appendChild(
        node(
          "SPAN",
          { class: "gdt-count" },
          c.count === null ? "&ndash;" : `${c.count}${shotCount ? ` / ${shotCount}` : ""}`
        )
      );
      if (!full) item.addEventListener("click", () => select(c));
      listEl.appendChild(item);
    });

    clearBtn.disabled = !selected;

    const hiddenCount = ordered.length - shown.length;
    const existing = panel.querySelector(".gdt-note");
    if (existing) existing.remove();
    if (hiddenCount > 0) {
      panel.appendChild(
        node(
          "DIV",
          { class: "gdt-note" },
          `${hiddenCount} categor${hiddenCount === 1 ? "y" : "ies"} on every shot, hidden`
        )
      );
    }
  };

  const buildPanel = () => {
    panel = node("DIV", { class: "gdt-panel", hidden: "hidden" });

    const header = node("DIV", { class: "gdt-h" });
    header.appendChild(node("SPAN", {}, "Detections"));
    clearBtn = node("BUTTON", { class: "gdt-clear", type: "button" }, "clear");
    clearBtn.disabled = true;
    clearBtn.addEventListener("click", () => select(null));
    header.appendChild(clearBtn);
    panel.appendChild(header);

    listEl = node("UL", { class: "gdt-list" });
    panel.appendChild(listEl);

    const foot = node("LABEL", { class: "gdt-foot" });
    fadeInput = node("INPUT", { type: "checkbox" });
    fadeInput.checked = fadeOthers;
    fadeInput.addEventListener("change", async () => {
      fadeOthers = fadeInput.checked;
      // Re-apply rather than re-query: the selection has not changed.
      if (selected) {
        const current = categories.find((c) => c.field === selected);
        if (current) applyEffect(await idsFor(current.field));
      }
    });
    foot.appendChild(fadeInput);
    foot.appendChild(node("SPAN", {}, "fade the rest"));
    panel.appendChild(foot);

    return panel;
  };

  // --- lifecycle -----------------------------------------------------------

  // Every path that ends in "no widget" says so. A plugin that renders nothing
  // and explains nothing cannot be debugged from the outside, and all of the
  // reasons here are legitimate states rather than faults.
  const quiet = (reason) => {
    console.info(`detection-tags: not shown — ${reason}`);
  };

  this.init = async function (geocamViewer) {
    viewer = geocamViewer;

    try {
      v2Base = await resolveV2Base();
      if (!v2Base) {
        return quiet(
          config.connectorSrc
            ? `no geocam.v2Path advertised by ${config.connectorSrc} (Manager too old?)`
            : "no src attribute and no arcgis connector src to discover one from"
        );
      }
      console.debug("detection-tags: using", v2Base);
      categories = await loadCategories();
    } catch (e) {
      // The honest cases all land here: a cell that was never segmented, a
      // Manager too old to advertise its v2 service, and an embedded viewer
      // with no credential for it.
      return quiet(`${v2Base || config.connectorSrc} — ${e.message}`);
    }

    if (!categories.length) {
      return quiet(`no tag_* fields on ${v2Base}/0 — cell not segmented?`);
    }

    button = node("DIV", {
      class: "geocam-detection-tags-button geocam-viewer-control-button",
      title: "Detections found in this cell",
    });
    button.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });

    // Added to the *map's* UI, not viewer.addControl. The viewer's control
    // strip lives inside .geocam-viewer, which the page sets to display:none
    // whenever the panorama is collapsed — which is map mode, exactly when you
    // want to recolour shots on the map. What this widget drives is a map
    // layer, so it belongs with the map's own controls.
    container = node("DIV", { class: "gdt-container" });
    container.appendChild(button);
    container.appendChild(buildPanel());
    mapView.ui.add(container, "top-right");
    render();
    console.info(
      `detection-tags: ${categories.length} categories, shot total ${
        shotCount === null ? "unknown" : shotCount
      } — button added to right-top`
    );
  };

  this.destroy = function () {
    applyEffect(null);
    if (container) {
      if (mapView && mapView.ui) mapView.ui.remove(container);
      if (container.parentNode) container.parentNode.removeChild(container);
    }
    container = button = panel = listEl = clearBtn = fadeInput = null;
  };
};
