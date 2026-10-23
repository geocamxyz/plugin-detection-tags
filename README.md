# detection-tags

Lists the segmentation categories found in a cell and recolours the shots
carrying the selected one, so you can see the hits **and their neighbours** and
judge whether the model missed a frame.

```html
<geocam-viewer>
  <geocam-viewer-arcgis-map
    src="https://host/arcgis/rest/services/cell+{slug}/FeatureServer"></geocam-viewer-arcgis-map>

  <geocam-viewer-detection-tags></geocam-viewer-detection-tags>
</geocam-viewer>
```

Normally needs no attributes.

| Attribute | |
|---|---|
| `src` | The v2 FeatureServer root. Optional — normally discovered, see below. |
| `token` | A PAT. Only needed when the viewer is not same-origin with the Manager. |
| `hide-full-coverage` | Hide categories every shot carries, instead of showing them disabled. |

## Why it talks to a second service

The categories live on the consolidated `{public_id}`-keyed FeatureServer, but
the map is normally pointed at legacy `cell+{slug}` — and it has to be, because
the connector depends on fields (`filenames`, `prev`/`next`, `rotation_matrix`,
`exposure_us`) that only the legacy service exposes.

So the plugin reads tags from one service and recolours a layer drawn from the
other. That works because **both expose `shots.id` as the object id**, so ids
fetched from v2 address features on a layer built from legacy.

It finds the v2 service rather than being told it: the legacy service root
advertises `geocam.v2Path`. Pass `src` only to override that.

## Where it mounts

The map's own UI (`mapView.ui.add(…, "top-right")`), not `viewer.addControl`.

The viewer's control strip lives inside `.geocam-viewer`, which the page sets to
`display: none` whenever the panorama is collapsed — i.e. in map mode, which is
exactly when you want to recolour shots on the map. What this widget drives is a
map layer, so it belongs with the map's controls.

## Behaviour

- **One category at a time.** Selecting another replaces the first; clicking the
  active one, or *clear*, removes the effect.
- **Sorted least-covered first.** A category on 1 of 18 shots is the one worth
  looking at; one on all 18 is the one worth ignoring.
- **Categories on every shot are shown but disabled**, with a tooltip saying
  why. Highlighting one would recolour every shot, which tells you nothing.
  They are listed rather than hidden because hiding them reads as a bug —
  in the first test cell `person` is on 18 of 18, so hiding would drop the most
  interesting-sounding category with no explanation. `hide-full-coverage`
  switches to hiding them.
- **Counts may be unknown.** A cell tagged before Manager recorded counts shows
  `–` instead of `n / N`, and nothing is treated as full coverage. Unknown is
  not zero. Re-running the segmentation summary ingest fills them in.
- **No detections — disabled button.** When the service answers and declares no
  categories, the button still appears, greyed and inert, titled *"Segmentations
  or summary not completed"*. Someone looking for it learns why it is empty
  instead of wondering where it went.
- **Service unreachable — no widget.** A Manager too old to advertise its v2
  path, an embedded viewer with no credential, a failed request: these render
  nothing and log why. Deliberately *not* the disabled state — we have learned
  nothing about whether segmentation ran, so claiming it did not would be a
  guess.

## How the recolouring works

The hits get **their own FeatureLayer**, drawn from the v2 service and filtered
server-side with `tags=`, in a magenta marker. Selecting swaps that layer;
clearing removes it. "Fade the rest" just drops the base layer's `opacity`.

### Why a separate layer, and not marking the base one

Because the base layer frequently **is not drawing the hit**. The connector
thins it by zoom:

```js
layer.definitionExpression = `mod(id,${mod}) = 0 AND extent = ...`;
```

At zoom 18 over the test cell that is `mod(id,5)` — 3 of 18 shots fetched. A
sparse category like `book` (1 of 18) is then usually not on screen at all, so
anything that marks existing features (`featureEffect`, `layerView.highlight`)
has nothing to mark and the selection looks broken. A layer of our own is not
subject to that expression.

Three earlier approaches, and why each was dropped:

| Approach | Why not |
|---|---|
| `includedEffect` CSS filter | The service uses a **unique-value** renderer, so shots already differ in colour; `saturate()`/`hue-rotate()` move each one somewhere different instead of onto one obvious colour. Nearly invisible against unfaded neighbours. |
| `layerView.highlight(ids)` | Visible, but only marks features the base layer actually drew — the thinning problem above. Also needed `highlightOptions`, which is **view-global** in 4.25 and would have recoloured `user-layers`' own highlights. |
| `featureEffect` with `objectIds` | Same thinning problem, plus it shipped every hit id to the client, capping how large a category could be. |

The current approach has none of those: the filtering is server-side so there
is no id list and no size ceiling, and nothing global is mutated.

## Masks over the imagery

With a category selected and the panorama open, the plugin also paints that
category's **actual detection masks** onto the three images, following the shot.
It needs a viewer with `imageOverlay()` (2.4.13+); on an older one the category
list works exactly as before and a line is logged saying masks are off.

Why this is simpler than it sounds: the annotations are written **in the source
image's own pixel coordinates** — the worker calls `undo_preprocess` before
saving, so whatever resizing the model needed is already taken back out — and
the fisheye-to-sphere mapping is baked into the viewer's OBJ UVs. So painting a
mask in the right pixels of the source image is the entire job. There is no
camera model here and no projection maths.

Finding the files is two lookups:

| From | Gives |
|---|---|
| `tag_*` field's `summaries[].masks[capture]` | the mask service base for the segmentation run that found this category |
| last three segments of `viewer.urls()[camera]` | `camera/folder/number`, the same path under that base with `.json` |

Deriving the path from the URL the viewer is *actually displaying*, rather than
reconstructing the folder-bucketing rule, means we cannot address a frame other
than the one on screen.

Masks are COCO RLE: column-major runs, background first, `counts` either a list
or pycocotools' LEB128 string. Each run is a contiguous range of column-major
indices, so it draws as two or three `fillRect`s rather than a pass over twelve
million pixels — a typical mask is a few thousand runs. Instances are painted
opaque and the whole layer is made translucent on the way out, so two
overlapping instances of one category read as one region rather than a darker
patch where they meet.

A 404 on a mask file is ordinary and silent: the run covered the capture, but
this frame had nothing worth writing.

### Authentication of the hit layer

The PAT is registered with Esri's `IdentityManager`, not passed in
`customParameters`. Esri **strips `token`** from custom parameters because it
manages credentials itself, which silently 403s the layer's own metadata
request while leaving other custom parameters (`tags`) intact. Same-origin,
no token is needed and none is registered.

Requires ArcGIS JS **4.22+**; the connector loads 4.26.

## Known limits

- Single selection only. Two categories at once would need the per-tag `tag_*`
  fields and a three-field `UniqueValueRenderer`.
- The hit layer is **not** zoom-thinned, so a category covering most of a very
  large capture draws every one of its shots. That is the right default for
  sparse categories, which are the ones worth looking at, and the dense ones are
  disabled at full coverage — but it has not been measured on a 50k capture.
- Masks are drawn for the **selected** category only, in one colour. Showing
  every category at once, in each one's own `category_color`, is the obvious
  next step and the annotations already carry the colour.
- A summary ingested before Manager recorded `masks` has nothing to point at,
  so the category still selects on the map but draws no masks. Re-running the
  summary ingest fills it in.

## Build

```sh
npm run build        # or: ../../node_modules/.bin/vite build
```

Released as a subtree — see `release-subtrees.sh` in the repo root.
