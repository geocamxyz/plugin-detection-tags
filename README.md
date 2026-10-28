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
- **Sorted alphabetically**, the same as the viewer panel. It was least-covered
  first, which suits browsing but not arriving with a name in mind; once
  open-vocabulary prompting pushed the list from a dozen entries to dozens, a
  predictable order mattered more. The `n / N` coverage is still on every row.
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

## Two panels, two questions

The plugin mounts **two** controls, because there are two different questions and one of them
is asked with the panorama shut:

| | Map panel | Viewer panel |
|---|---|---|
| Answers | which **shots** in this cell contain X | what was detected in **this image** |
| Lives in | `mapView.ui`, top-right | the viewer's own control strip, beside image enhance |
| Selection | its own | its own, independent |
| Does | recolours shots | draws masks, counts, centres on each detection |

They share no selection state. "Which shot has a person in it" has to work with the viewer
closed — which is exactly when the viewer panel does not exist — so tying the two together would
break the map's main use. The map panel does **not** touch the imagery at all.

The viewer panel is hidden in map mode for free, because `.geocam-viewer` is. For the map panel
that hiding was an obstacle; here it is the correct behaviour.

### What it does

- Lists every category found in the current shot, with an instance count and a **colour
  swatch** matching how it is drawn.
- **Draws every category at once**, each in its own colour. Clicking a category isolates it;
  clicking it again brings the rest back. No selection means *everything*, not nothing — the
  panel is a legend for the image, so the whole picture is the useful resting state.
- **Numbered chips** per instance — click to centre the view on it. Capped at 9: past that,
  panning finds them faster than a list does. The question this answers is *"where is the one
  traffic light"*, not "enumerate forty pedestrians".
- **show masks** and **opacity** both only change how the already-decoded masks are composited,
  so they are instant. That is the point of having them: comparing mask against image has to be
  a flick, not a refetch.

### The palette: position in the cell's vocabulary

Colours are **not** the annotation's `category_color`. That was the first attempt and it does
not work:

- **SAM3 numbers its categories 1, 2, 3…** and indexes a table of 256 hues spread round the
  whole circle, so consecutive categories land **1.4° of hue apart**. `animal` and `curb` differ
  by six units of green. They are also stored BGR, while evaseg's ADE20K palette is RGB — which
  only decides *which* colour they are all a shade of, near-red if read correctly and near-blue
  if not.
- **Hashing the category name does not fix it.** A hash gives uniformly random hues, and for
  ~20 categories the expected smallest gap is tiny. Measured on this cell it put `sidewalk` and
  `sky` 3 apart — worse than the palette it replaced.

So the colour is a category's **position in the cell's vocabulary, sorted**. That list comes
from the service and is fixed for the cell, which buys both properties at once: hues as far
apart as the category count allows, and stability across every shot and camera in the cell —
the property that ruled out choosing our own colours per frame.

Measured on the test cell: **59 minimum pairwise separation** across 17 categories, against 6
for SAM3's own palette and 3 for name-hashing. Stepping between shots whose category sets
differ (17 then 15, 14 in common) changed **no** colour.

Lightness and saturation alternate between neighbours, so the closest pair by construction —
adjacent hues — differ on a second axis too. A category in the masks but absent from the
vocabulary falls back to a hashed hue; that should not happen, since both come from the same
summaries.

The cost is that colours carry no meaning: `sky` is not cyan. For SAM3 there was never any
meaning to carry, its categories being whatever the prompt asked for.

Drawing order is largest mask first. `sky`, `building` and `road` cover most of a frame between
them, so in file order they bury every small detection — which are exactly the ones worth
finding. Masks are painted opaque and made translucent once, at the end, so a car on a road is
the car's colour rather than a blend of the two, and two instances of one category overlapping
do not show a darker seam.

Chips are ordered by camera, then by descending mask area, so the number beside a detection
means the same thing after a redraw.

### Reading is lazy

Nothing is fetched until the panel is opened, and a shot change with it shut costs nothing.
Open it, and the masks for the frame on screen are read; change shot while open and they are
re-read. Previously, selecting a category on the *map* fetched three files per shot whether or
not anyone was looking at the image.

### Centring, and when a chip is dead

Go-to uses `viewer.lookAtImagePoint`, so there is no camera model here either — see below.

Two things make the obvious implementation wrong, both confirmed on real data:

- **The centroid of a mask is often not on it** (4 of 12 detections sampled). So the target is
  the point nearest the centroid that is *on* the mask.
- **A point on the mask may still have no direction.** Roughly half the frame lies outside the
  fisheye circle, where there is no geometry, and the models label that black border quite
  happily — 3 of those same 12 chose a point there. So the target is the nearest on-mask point
  **that resolves to a direction**, and a detection where none does gets a struck-through chip
  that says why. A click that silently does nothing reads as a bug.
- **Some calibrations have unusable UVs on the rim.** Where the fisheye projection diverges,
  a few rigs emit UVs of ~1e27; one triangle like that spans the whole texture and swallows
  every lookup, so go-to turned to the same rim point whatever you clicked. The viewer skips
  them (UVs outside `[-1, 2]`), so this needs viewer 2.4.15+. Masks were never affected —
  those triangles are a sliver outside the lens circle on screen.
- **Every candidate is tried, not the nearest few.** A large mask can straddle the circle's edge
  with its *centroid outside it* — a shopfront sign running off the top of the frame does this —
  and then every point near the centroid fails while plenty further out would work. An earlier
  cap at the nearest 64 made two of five struck-through chips on one shot false negatives.

A viewer too old to centre is a different failure and says so separately, rather than blaming
the lens circle for a missing API.

## Masks over the imagery

With a category selected and the panorama open, the plugin also paints that
category's **actual detection masks** onto the three images, following the shot.
It needs a viewer build with `imageOverlay()`; on an older one the category list
works exactly as before and a line is logged saying masks are off.

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
- Colours carry no meaning — `sky` is not cyan — because they are positions in the cell's
  vocabulary. See the palette section for why the model's own colours could not be used.
- An object straddling two of the rig's overlapping cameras is detected twice and counted
  twice. Deduplicating needs a rule for "the same object", which is guesswork.
- A summary ingested before Manager recorded `masks` has nothing to point at,
  so the category still selects on the map but draws no masks. Re-running the
  summary ingest fills it in.

## Build

```sh
npm run build        # or: ../../node_modules/.bin/vite build
```

Released as a subtree — see `release-subtrees.sh` in the repo root.
