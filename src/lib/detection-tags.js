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
  .gdt-v-list { display: flex; flex-direction: column; gap: 4px; }
  .gdt-v-row { display: flex; align-items: center; gap: 8px; }
  .gdt-v-name { flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;
    background: none; border: 1px solid transparent; border-radius: 6px; padding: 3px 6px;
    color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .gdt-v-name:hover { border-color: rgba(255,255,255,.35); }
  .gdt-v-name.active { border-color: #2dd4bf; background: rgba(45,212,191,.15); font-weight: 600; }
  .gdt-v-label { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gdt-v-count { opacity: .6; font-variant-numeric: tabular-nums; }
  .gdt-v-chips { display: flex; flex-wrap: wrap; gap: 3px; }
  .gdt-v-chip { min-width: 20px; height: 20px; padding: 0 4px; border-radius: 4px;
    border: 1px solid rgba(255,255,255,.3); background: rgba(255,255,255,.08); color: #fff;
    font: 11px/1 system-ui, sans-serif; cursor: pointer; }
  .gdt-v-chip:hover { background: rgba(255,255,255,.22); }
  /* A detection outside the lens circle has nowhere to turn to. Shown struck
     through rather than hidden, so a click gets an explanation. */
  .gdt-v-chip.gdt-chip-dead { opacity: .35; text-decoration: line-through; cursor: default; }
  .gdt-v-more { opacity: .55; font-size: 11px; align-self: center; }
  .gdt-v-note { opacity: .7; }
  .gdt-v-foot { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.15);
    display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .gdt-v-toggle.is-open { background: rgba(255,255,255,.25); }
  .geocam-detection-tags-icon { background-image: url('data:image/svg+xml;utf8,\
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
  let expandWidget; // the Esri Expand, when there are categories
  let button; // a plain disabled button, when there are none
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
  let shotsLayer = null; // the base layer the connector draws
  let hitLayer = null; // our own layer, only the selected category
  let tokenRegistered = false;
  const unsubscribe = []; // viewer store subscriptions, dropped on destroy

  // The viewer panel's state, deliberately separate from the map panel's
  // `selected`. The two answer different questions — "which shots contain a
  // person" versus "what is in this image" — and the first is asked with the
  // panorama closed, which is exactly when this panel does not exist.
  let imageSelected = null; // category drawn on the imagery, or null
  let showMasks = true;
  let panelOpen = false;
  let viewerButton, viewerPanelEl, viewerListEl, maskToggle;

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

    // Anchored on the document first. The connector's src is root-relative
    // when the viewer is served by the Manager itself
    // ("/arcgis/rest/services/cell+slug/FeatureServer"), and new URL() throws
    // TypeError on a relative base — which the catch upstream would swallow
    // into a silent "not shown".
    const legacy = new URL(config.connectorSrc.replace(/\/+$/, ""), window.location.href).href;
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
        // Which segmentation runs found this category, and where each keeps
        // its masks: [{ id, count, masks: { capture => base path } }]. A cell
        // can hold several unrelated summaries, so this is the only thing
        // tying a tag back to the annotations that produced it.
        summaries: Array.isArray(f.summaries) ? f.summaries : [],
      }));
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

  // Magenta, a size up from the base dots, white-outlined so it reads over
  // both the imagery and an unfaded neighbour.
  const HIT_SYMBOL = {
    type: "simple-marker",
    size: 11,
    color: [255, 0, 255, 1],
    outline: { color: [255, 255, 255, 1], width: 1.5 },
  };

  // The ArcGIS API is already loaded by the connector by the time this plugin
  // attaches (it waits for mapView), so pull modules off the AMD loader esri-
  // loader installed rather than taking a dependency of our own.
  const loadEsri = (modules) =>
    new Promise((resolve, reject) => {
      if (!window.require) return reject(new Error("ArcGIS API not loaded"));
      window.require(modules, (...loaded) => resolve(loaded), reject);
    });

  // Hand the PAT to Esri rather than to the request, once. Needed only when
  // the viewer is off-origin from the Manager; same-origin the session cookie
  // travels with the layer's own requests and there is nothing to register.
  const registerToken = async () => {
    if (!config.token || tokenRegistered) return;
    const [IdentityManager] = await loadEsri(["esri/identity/IdentityManager"]);
    IdentityManager.registerToken({ server: v2Base, token: config.token });
    tokenRegistered = true;
  };

  const removeHitLayer = () => {
    if (!hitLayer) return;
    try {
      mapView.map.remove(hitLayer);
    } catch {
      /* map already torn down */
    }
    hitLayer = null;
  };

  // The hits get their OWN layer, drawn from the v2 service and filtered
  // server-side by tags=.
  //
  // This is why, rather than marking features on the layer the map already
  // draws: the connector thins that layer by zoom with
  // `definitionExpression = "mod(id,N) = 0 AND ..."`, so at anything but close
  // range most shots are not fetched at all. A sparse category — `book` on 1 of
  // 18 — is then usually not on screen to mark, and the selection looks broken.
  // A separate layer is not subject to that expression.
  //
  // It also means no object-id list is shipped to the client, so there is no
  // cap on how many shots a category may have, and nothing has to touch the
  // view-global highlightOptions that user-layers relies on.
  const applyEffect = async (field) => {
    const base = findShotsLayer();

    // Synchronous before any await, so destroy() can rely on it completing.
    removeHitLayer();
    if (base) base.opacity = field && fadeOthers ? 0.15 : 1;
    if (!field) return;

    const stamp = selected;
    const [FeatureLayer] = await loadEsri(["esri/layers/FeatureLayer"]);
    await registerToken();
    // A second selection may have landed while the module loaded; that call
    // owns the layer now.
    if (selected !== stamp) return;

    hitLayer = new FeatureLayer({
      url: `${v2Base}${SHOT_LAYER_SUFFIX}`,
      // No token here: Esri strips `token` from customParameters because it
      // manages credentials itself, which silently 403s the layer's own
      // metadata request. It goes through IdentityManager instead.
      customParameters: { tags: field },
      outFields: [],
      popupEnabled: false,
      legendEnabled: false,
      listMode: "hide", // not a layer the operator manages; keep it out of LayerList
      renderer: { type: "simple", symbol: HIT_SYMBOL },
    });
    mapView.map.add(hitLayer);
  };

  // --- masks over the imagery ----------------------------------------------
  //
  // The annotations are stored per image, in the source image's own pixel
  // coordinates — the worker runs undo_preprocess before writing them, so
  // whatever resizing or rotation the model needed has already been taken
  // back out. That is what makes this tractable: the fisheye-to-sphere
  // mapping is baked into the viewer's OBJ UVs, so painting a mask onto the
  // source image in the right pixels is the whole job. No camera model, no
  // projection maths.

  const MASK_COLOUR = "rgb(255, 0, 255)"; // the hit markers' magenta
  const MASK_ALPHA = 0.45;

  // Masks are blobs, not line art, and the viewer scales whatever we hand it
  // onto the texture. Capping the overlay keeps three 4096x3000 canvases from
  // being held for the sake of detail nothing can see.
  const MAX_OVERLAY_WIDTH = 2048;

  let maskStamp = 0; // generation counter; a stale fetch must not paint
  const painted = new Set(); // camera indices we own, so we clear only ours

  // Does this viewer build have the overlay registry? Older ones do not, and
  // the category list is still perfectly useful without masks.
  const overlaysSupported = () =>
    viewer && typeof viewer.imageOverlay === "function";

  // COCO RLE. `counts` is either a plain list of run lengths or pycocotools'
  // LEB128-ish string, which is the same encoding report_annotations.py reads
  // server-side. Runs alternate background-first and are column-major.
  const decodeCounts = (counts) => {
    if (Array.isArray(counts)) return counts;
    if (typeof counts !== "string") return [];

    const runs = [];
    let p = 0;
    while (p < counts.length) {
      let x = 0;
      let k = 0;
      let more = 1;
      while (more) {
        const c = counts.charCodeAt(p) - 48;
        x |= (c & 0x1f) << (5 * k);
        more = c & 0x20;
        p += 1;
        k += 1;
        if (!more && c & 0x10) x |= -1 << (5 * k);
      }
      // Deltas against the run two back, from the third run on.
      if (runs.length > 2) x += runs[runs.length - 2];
      runs.push(x);
    }
    return runs;
  };

  // One run is a contiguous range of column-major pixel indices, which on the
  // image is a vertical segment — or, when it spans columns, a partial column,
  // some whole ones, and a partial column. Filling it as two or three rects
  // beats touching every pixel: a typical mask is a few thousand runs against
  // twelve million pixels.
  const fillRun = (ctx, from, to, height) => {
    const firstColumn = Math.floor(from / height);
    const lastColumn = Math.floor(to / height);
    const firstRow = from % height;
    const lastRow = to % height;

    if (firstColumn === lastColumn) {
      ctx.fillRect(firstColumn, firstRow, 1, lastRow - firstRow + 1);
      return;
    }
    ctx.fillRect(firstColumn, firstRow, 1, height - firstRow);
    if (lastColumn - firstColumn > 1) {
      ctx.fillRect(firstColumn + 1, 0, lastColumn - firstColumn - 1, height);
    }
    ctx.fillRect(lastColumn, 0, 1, lastRow + 1);
  };

  const fillMask = (ctx, segmentation, height) => {
    const runs = decodeCounts(segmentation.counts);
    let at = 0;
    for (let i = 0; i < runs.length; i += 1) {
      // Odd runs are foreground, the background-first alternation.
      if (i % 2 === 1 && runs[i] > 0) fillRun(ctx, at, at + runs[i] - 1, height);
      at += runs[i];
    }
  };

  // Painted opaque first and made translucent on the way out, so two
  // instances of the same category overlapping read as one region rather
  // than a darker patch where they meet.
  const paint = (annotations) => {
    const size = annotations[0].segmentation.size || [];
    const height = size[0];
    const width = size[1];
    if (!height || !width) return null;

    const solid = document.createElement("canvas");
    solid.width = width;
    solid.height = height;
    const ctx = solid.getContext("2d");
    ctx.fillStyle = MASK_COLOUR;
    annotations.forEach((a) => {
      const s = a.segmentation || {};
      // Mixed frame sizes in one file would land in the wrong place; skip
      // rather than misplace. Has not been seen, but it is one comparison.
      if ((s.size || [])[0] === height && (s.size || [])[1] === width) {
        fillMask(ctx, s, height);
      }
    });

    const scale = Math.min(1, MAX_OVERLAY_WIDTH / width);
    const out = document.createElement("canvas");
    out.width = Math.round(width * scale);
    out.height = Math.round(height * scale);
    const outCtx = out.getContext("2d");
    outCtx.globalAlpha = MASK_ALPHA;
    outCtx.drawImage(solid, 0, 0, out.width, out.height);
    return out;
  };

  // The annotation path mirrors the image path — same camera, folder and
  // number, .json instead of .jpg — under a different source. Taking the last
  // three segments of whatever the viewer is actually displaying means we do
  // not have to reconstruct the folder-bucketing rule, and we cannot address a
  // frame other than the one on screen.
  const maskUrl = (base, imageUrl) => {
    const tail = new URL(imageUrl, window.location.href).pathname
      .split("/")
      .filter(Boolean)
      .slice(-3)
      .join("/")
      .replace(/\.[^.]+$/, "");
    return new URL(`${base.replace(/\/+$/, "")}/${tail}.json`, v2Base).href;
  };

  // A 404 is ordinary: the summary covers the capture, but this particular
  // frame had nothing worth writing, or segmentation skipped it.
  const fetchMask = async (base, imageUrl) => {
    try {
      const response = await fetch(maskUrl(base, imageUrl), {
        credentials: "same-origin",
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn("detection-tags: could not read masks", base, e);
      return null;
    }
  };

  const clearMasks = () => {
    maskStamp += 1;
    if (!overlaysSupported()) return;
    painted.forEach((camera) => viewer.imageOverlay(camera, null));
    painted.clear();
  };

  // Every summary that recorded masks for this capture. Per capture because
  // a mask base is a segmentation *service*, which belongs to one capture's
  // run. Collected across every category rather than one, because the panel
  // describes the whole image and two categories can come from two runs.
  const maskBasesFor = (capture) => {
    const bases = new Set();
    categories.forEach((c) =>
      (c.summaries || []).forEach((s) => {
        const base = s.masks && s.masks[capture];
        if (base) bases.add(base);
      })
    );
    return [...bases];
  };

  // Walk a run as whole-column segments. A run is a contiguous span of
  // column-major indices, so it is one partial column, some full ones, and
  // another partial column — the same decomposition fillRun draws with, but
  // yielded rather than filled so the geometry can be measured in run time
  // instead of pixel time. A full-frame mask is ~3000 runs against 12 million
  // pixels, and the panel measures every mask of every category on the shot.
  const eachSegment = (from, to, height, fn) => {
    const firstColumn = Math.floor(from / height);
    const lastColumn = Math.floor(to / height);
    const firstRow = from % height;
    const lastRow = to % height;
    if (firstColumn === lastColumn) return fn(firstColumn, firstRow, lastRow);
    fn(firstColumn, firstRow, height - 1);
    for (let c = firstColumn + 1; c < lastColumn; c++) fn(c, 0, height - 1);
    fn(lastColumn, 0, lastRow);
  };

  // Keeps the candidate list bounded however large the mask is, by halving it
  // and sampling half as often whenever it fills. Which candidates survive
  // does not matter — they only have to be spread over the mask.
  const CANDIDATE_LIMIT = 512;

  // Area, centroid, and a bounded set of points known to be *on* the mask.
  const measureMask = (segmentation) => {
    const size = segmentation.size || [];
    const height = size[0];
    const width = size[1];
    if (!height || !width) return null;

    const runs = decodeCounts(segmentation.counts);
    let pixels = 0;
    let sumX = 0;
    let sumY = 0;
    const candidates = [];
    let seen = 0;
    let stride = 1;
    let at = 0;

    for (let i = 0; i < runs.length; i++) {
      if (i % 2 === 1 && runs[i] > 0) {
        eachSegment(at, at + runs[i] - 1, height, (column, from, to) => {
          const n = to - from + 1;
          pixels += n;
          sumX += column * n;
          sumY += ((from + to) / 2) * n;
          if (seen++ % stride === 0) {
            candidates.push([column, (from + to) >> 1]);
            if (candidates.length >= CANDIDATE_LIMIT) {
              let keep = 0;
              for (let k = 1; k < candidates.length; k += 2)
                candidates[keep++] = candidates[k];
              candidates.length = keep;
              stride *= 2;
            }
          }
        });
      }
      at += runs[i];
    }

    if (!pixels) return null;
    return { width, height, pixels, cx: sumX / pixels, cy: sumY / pixels, candidates };
  };

  // Where to point to see this instance.
  //
  // The centroid is NOT it: an L-shaped, crescent or split mask puts its
  // centroid off the object, which on real data is 4 detections in 12. So
  // this takes the candidate nearest the centroid instead — all candidates
  // are on the mask by construction.
  //
  // It then has to keep looking, because a point can be on the mask and still
  // have no direction: outside the fisheye circle there is no geometry, and
  // the models label that black border perfectly happily. Roughly half the
  // frame is outside the circle, and 3 detections in 12 chose a point there.
  // Returns null when nothing on the mask is reachable, so the caller can say
  // so rather than appear to ignore a click.
  const ATTEMPTS = 64;

  // Separate from aimFor returning null, which means "nothing on this mask is
  // reachable". A viewer without the call cannot answer for *any* detection,
  // and reporting that as "outside the lens circle" would send someone
  // looking at the segmentation data for a fault in the viewer build.
  const canNavigate = () => typeof viewer.directionForImagePoint === "function";

  const aimFor = (camera, measured) => {
    if (!measured || !canNavigate()) return null;
    const { width, height, cx, cy, candidates } = measured;
    const byDistance = candidates
      .map(([x, y]) => ({ u: x / width, v: y / height, d: (x - cx) ** 2 + (y - cy) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, ATTEMPTS);

    for (const c of byDistance) {
      if (viewer.directionForImagePoint(camera, c.u, c.v)) return { u: c.u, v: c.v };
    }
    return null;
  };

  // --- what is in this shot ------------------------------------------------

  let detections = []; // [{ category, instances: [{ camera, segmentation, measured, aim }] }]
  let detectionsStamp = 0;
  let loadingDetections = false;

  const clearDetections = () => {
    detectionsStamp += 1;
    detections = [];
    loadingDetections = false;
  };

  // Fetched when the panel opens, and again on a shot change while it is
  // open — never merely because a category is selected somewhere. Nothing is
  // read from object storage for a user who is not looking at the image.
  const loadDetections = async () => {
    clearDetections();
    const stamp = detectionsStamp;
    if (!viewer.visible()) return renderViewerPanel();

    const capture = (viewer.shotInfo() || {}).capture;
    const urls = viewer.urls() || [];
    const bases = maskBasesFor(capture);
    if (!bases.length || !urls.length) {
      console.info(
        `detection-tags: nothing to read for this shot — ` +
          (urls.length
            ? `no summary records masks for capture ${capture}`
            : "no images on screen")
      );
      return renderViewerPanel();
    }

    loadingDetections = true;
    renderViewerPanel();

    const fetched = await Promise.all(
      urls.flatMap((url, camera) =>
        bases.map((base) =>
          fetchMask(base, url).then((doc) => ({ camera, doc }))
        )
      )
    );
    if (stamp !== detectionsStamp) return; // a later shot owns this now

    const byCategory = new Map();
    fetched.forEach(({ camera, doc }) => {
      if (!doc) return;
      (doc.annotations || []).forEach((a) => {
        if (!a || !a.category_name || !a.segmentation) return;
        const measured = measureMask(a.segmentation);
        if (!measured) return;
        const entry = byCategory.get(a.category_name) || {
          category: a.category_name,
          colour: a.category_color,
          instances: [],
        };
        entry.instances.push({ camera, segmentation: a.segmentation, measured, aim: undefined });
        byCategory.set(a.category_name, entry);
      });
    });

    // Stable, or the number beside a detection means something different
    // after every redraw. Camera first, then biggest first within it.
    detections = [...byCategory.values()]
      .map((e) => {
        e.instances.sort(
          (a, b) => a.camera - b.camera || b.measured.pixels - a.measured.pixels
        );
        return e;
      })
      .sort((a, b) => a.category.localeCompare(b.category));

    loadingDetections = false;
    renderViewerPanel();
    drawMasks();
  };

  // --- drawing -------------------------------------------------------------

  // Every caller fires this and walks away — a selection, a shot change, the
  // panorama opening. Without this the whole thing is an unhandled rejection
  // that Chrome reports under no stack anyone will connect to this plugin.
  const drawMasks = () => {
    try {
      paintMasks();
    } catch (e) {
      console.warn("detection-tags: could not draw masks", e);
    }
  };

  // Synchronous: everything it needs was fetched and decoded by
  // loadDetections. That is what lets the show-masks toggle be a real A/B
  // against the image rather than a refetch with a pause in the middle.
  const paintMasks = () => {
    clearMasks();
    if (!overlaysSupported() || !viewer.visible()) return;
    if (!showMasks || !imageSelected) return;

    const entry = detections.find((d) => d.category === imageSelected);
    if (!entry) return;

    const byCamera = new Map();
    entry.instances.forEach((i) => {
      const list = byCamera.get(i.camera) || [];
      list.push({ segmentation: i.segmentation });
      byCamera.set(i.camera, list);
    });

    byCamera.forEach((instances, camera) => {
      const canvas = paint(instances);
      if (!canvas) return;
      viewer.imageOverlay(camera, canvas);
      painted.add(camera);
    });
  };

  // --- the viewer panel ----------------------------------------------------
  //
  // Styled after the viewer's own enhancement panel rather than the map
  // panel: it lives over the imagery, where a white card would be wrong.

  const goTo = (entry, instance, chip) => {
    // Resolved here rather than at load, because the masks can arrive before
    // the hemisphere geometry does and a point has no direction until the
    // mesh it lands on exists. Cached after the first success.
    if (instance.aim === undefined) instance.aim = aimFor(instance.camera, instance.measured);

    if (!instance.aim) {
      // On the mask but outside the fisheye circle — nothing to turn towards.
      // Say so on the chip; a click that silently does nothing reads as a bug.
      chip.classList.add("gdt-chip-dead");
      chip.title = `This ${entry.category} is outside the lens circle, so there is nowhere to turn`;
      return;
    }

    if (imageSelected !== entry.category) {
      imageSelected = entry.category;
      drawMasks();
    }
    viewer.lookAtImagePoint(instance.camera, instance.aim.u, instance.aim.v);
    renderViewerPanel();
  };

  const selectForImage = (category) => {
    imageSelected = imageSelected === category ? null : category;
    drawMasks();
    renderViewerPanel();
  };

  // Past this many, reading a list is slower than panning the image — the
  // question this answers is "where is the one traffic light", not
  // "enumerate forty pedestrians".
  const MAX_CHIPS = 9;

  const renderViewerPanel = () => {
    if (!viewerListEl) return;
    viewerListEl.innerHTML = "";
    viewerPanelEl.classList.toggle("is-hidden", !panelOpen);
    if (maskToggle) maskToggle.checked = showMasks;
    if (!panelOpen) return;

    if (loadingDetections) {
      viewerListEl.appendChild(node("DIV", { class: "gdt-v-note" }, "reading detections&hellip;"));
      return;
    }
    if (!detections.length) {
      viewerListEl.appendChild(
        node("DIV", { class: "gdt-v-note" }, "No detections in this shot.")
      );
      return;
    }
    if (!canNavigate()) {
      viewerListEl.appendChild(
        node("DIV", { class: "gdt-v-note" }, "Viewer too old to centre on a detection.")
      );
    }

    detections.forEach((entry) => {
      const row = node("DIV", { class: "gdt-v-row" });

      const name = node("BUTTON", {
        class: `gdt-v-name${imageSelected === entry.category ? " active" : ""}`,
        type: "button",
        title: `Draw every ${entry.category} in this shot`,
      });
      name.appendChild(node("SPAN", { class: "gdt-v-label" }, entry.category));
      name.appendChild(node("SPAN", { class: "gdt-v-count" }, String(entry.instances.length)));
      name.addEventListener("click", () => selectForImage(entry.category));
      row.appendChild(name);

      // No go-to at all on a viewer that cannot turn to a point; the counts
      // and the masks are still worth having.
      if (canNavigate()) {
        const chips = node("DIV", { class: "gdt-v-chips" });
        entry.instances.slice(0, MAX_CHIPS).forEach((instance, i) => {
          const chip = node("BUTTON", {
            class: `gdt-v-chip${instance.aim === null ? " gdt-chip-dead" : ""}`,
            type: "button",
            title: `Centre on ${entry.category} ${i + 1} (camera ${instance.camera})`,
          }, String(i + 1));
          chip.addEventListener("click", () => goTo(entry, instance, chip));
          chips.appendChild(chip);
        });
        if (entry.instances.length > MAX_CHIPS) {
          chips.appendChild(
            node("SPAN", { class: "gdt-v-more" }, `+${entry.instances.length - MAX_CHIPS}`)
          );
        }
        row.appendChild(chips);
      }
      viewerListEl.appendChild(row);
    });
  };

  const setPanelOpen = (open) => {
    panelOpen = open;
    viewerButton.classList.toggle("is-open", open);
    if (open && !detections.length && !loadingDetections) {
      loadDetections();
    } else {
      renderViewerPanel();
    }
  };

  const buildViewerPanel = () => {
    viewerButton = node("DIV", {
      class: "geocam-viewer-control-button gdt-v-toggle",
      role: "button",
      title: "Detections in this image",
    });
    viewerButton.appendChild(
      node("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" })
    );
    viewerButton.addEventListener("click", () => setPanelOpen(!panelOpen));

    viewerPanelEl = node("DIV", { class: "gdt-v-panel is-hidden" });
    const head = node("DIV", { class: "gdt-v-head" }, "Detections in this image");
    viewerPanelEl.appendChild(head);

    viewerListEl = node("DIV", { class: "gdt-v-list" });
    viewerPanelEl.appendChild(viewerListEl);

    const foot = node("LABEL", { class: "gdt-v-foot" });
    maskToggle = node("INPUT", { type: "checkbox" });
    maskToggle.checked = showMasks;
    maskToggle.addEventListener("change", () => {
      showMasks = maskToggle.checked;
      // Only adds or removes the overlay — the masks are already decoded, so
      // flicking this is an A/B against the image rather than a refetch.
      drawMasks();
    });
    foot.appendChild(maskToggle);
    foot.appendChild(node("SPAN", {}, "show masks"));
    viewerPanelEl.appendChild(foot);

    return viewerButton;
  };

  // --- UI ------------------------------------------------------------------

  // Recolours shots on the map and nothing else. It used to paint the
  // imagery too, which tied "which shots contain a person" — a question
  // asked with the panorama closed — to a panel that only exists when it is
  // open. The image is the viewer panel's business now.
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
      await applyEffect(category.field);
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
    // No `hidden` attribute: the Expand owns showing and hiding this.
    panel = node("DIV", { class: "gdt-panel" });

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
    fadeInput.addEventListener("change", () => {
      fadeOthers = fadeInput.checked;
      // Only the base layer's opacity changes; the hit layer is untouched, so
      // there is nothing to re-fetch and no need to rebuild it.
      const base = findShotsLayer();
      if (base) base.opacity = selected && fadeOthers ? 0.15 : 1;
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
      // Could not reach or resolve the service. NOT the same as "no
      // detections" — we have learned nothing about whether segmentation ran,
      // so say nothing rather than claim it did not. Covers a Manager too old
      // to advertise its v2 service and an embedded viewer with no credential.
      return quiet(`${v2Base || config.connectorSrc} — ${e.message}`);
    }

    // The service answered and declared no categories: segmentation, or the
    // summary step, has not run for this cell. That is worth showing as a
    // disabled control rather than an absent one — an operator looking for the
    // button learns why it is empty instead of wondering where it went.
    const disabled = categories.length === 0;
    if (disabled) {
      console.info(`detection-tags: no tag_* fields on ${v2Base}${SHOT_LAYER_SUFFIX} — showing disabled`);
    }

    // Everything goes in the *map's* UI, not viewer.addControl: the viewer's
    // control strip lives inside .geocam-viewer, which the page hides whenever
    // the panorama is collapsed — i.e. in map mode, exactly when you want to
    // recolour shots. What this widget drives is a map layer.
    if (disabled) {
      // A plain button, since there is no panel to expand. Collapsed Expands
      // render as an esri-widget--button with an icon span, so matching that
      // markup keeps it indistinguishable from its neighbours.
      //
      // Deliberately not the `disabled` attribute: disabled controls swallow
      // mouse events in some browsers, and the tooltip is the only thing
      // explaining the state.
      button = node("DIV", {
        class: "esri-widget--button gdt-off",
        role: "button",
        title: "Segmentations or summary not completed",
      });
      button.appendChild(node("SPAN", { class: "geocam-detection-tags-icon", "aria-hidden": "true" }));
      mapView.ui.add(button, "top-right");
    } else {
      // A real Esri Expand rather than a hand-rolled button and panel. Hand
      // rolling stacked the panel *under* the button, which pushed the widgets
      // below it down the UI column; Expand positions its panel beside the
      // stack and gives the collapse affordance the other widgets have.
      //
      // Same group as the map's own widgets so only one panel is open at a
      // time, and autoCollapse off for the reason map.js sets it off: this map
      // moves itself to follow the current shot.
      const [Expand] = await loadEsri(["esri/widgets/Expand"]);
      expandWidget = new Expand({
        view: mapView,
        content: buildPanel(),
        expandIconClass: "geocam-detection-tags-icon",
        expandTooltip: "Detections found in this cell",
        group: "expands",
        autoCollapse: false,
      });
      mapView.ui.add(expandWidget, "top-right");
      render();

      // The second control, in the viewer rather than the map. The viewer's
      // control strip lives inside .geocam-viewer, which the page hides
      // whenever the panorama is collapsed — for the category list above that
      // was an obstacle, but here it is exactly right: a panel about the open
      // image should not exist when no image is open.
      if (overlaysSupported()) {
        // left-bottom is the image-tools column, beside the enhancement
        // toggle, which is the control this one most resembles.
        viewer.addControl(buildViewerPanel(), "left-bottom");
        // The panel is a sibling of the whole control strip, not of the
        // button: its `left: 56px` is measured from the strip, which is how
        // the viewer's own enhancement panel is positioned.
        const strip =
          viewerButton.closest(".geocam-viewer-controls") ||
          (viewer.element && viewer.element.querySelector(".geocam-viewer-controls"));
        if (strip) strip.appendChild(viewerPanelEl);
        else console.warn("detection-tags: no control strip to hang the panel on");

        // `urls` changes once per shot and carries exactly the three images
        // the detections belong to; `visible` covers opening and closing the
        // panorama. Both fire on registration.
        unsubscribe.push(
          viewer.urls(() => {
            // S4: only re-read if someone is looking. A shot change with the
            // panel shut should cost nothing.
            clearDetections();
            clearMasks();
            if (panelOpen) loadDetections();
          })
        );
        unsubscribe.push(
          viewer.visible((v) => {
            if (!v) {
              clearDetections();
              clearMasks();
              setPanelOpen(false);
            }
          })
        );
      } else {
        console.info(
          "detection-tags: viewer has no imageOverlay — categories only, no masks"
        );
      }
    }

    console.info(
      `detection-tags: ${categories.length} categories, shot total ${
        shotCount === null ? "unknown" : shotCount
      } — added to the map UI${disabled ? " (disabled)" : ""}`
    );
  };

  this.destroy = function () {
    applyEffect(null);
    unsubscribe.splice(0).forEach((off) => off());
    clearMasks();
    clearDetections();
    if (expandWidget) {
      if (mapView && mapView.ui) mapView.ui.remove(expandWidget);
      expandWidget.destroy();
    }
    if (button) {
      if (mapView && mapView.ui) mapView.ui.remove(button);
      if (button.parentNode) button.parentNode.removeChild(button);
    }
    // Added to the viewer's own DOM rather than a widget registry, so these
    // come out by hand.
    [viewerButton, viewerPanelEl].forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    expandWidget = button = panel = listEl = clearBtn = fadeInput = null;
    viewerButton = viewerPanelEl = viewerListEl = maskToggle = null;
  };
};
