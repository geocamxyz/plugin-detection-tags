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
- **No categories, no widget.** A cell that was never segmented, a Manager too
  old to advertise its v2 service, and an embedded viewer with no credential for
  it all render nothing rather than erroring.

## How the recolouring works

Two mechanisms, doing two different jobs.

**`layerView.highlight(ids)`** marks the hits — a magenta halo, in a colour
independent of whatever the renderer gave the shot. A CSS filter cannot do this
job: the service renders shots with a **unique-value** renderer, so their base
colours already differ and `saturate()` / `hue-rotate()` shift each one
somewhere different rather than landing them all on one obvious colour. That is
why `includedEffect` was dropped — against unfaded neighbours it was nearly
invisible.

**`featureEffect`** fades everything else, and only when "fade the rest" is on:

```js
layer.featureEffect = { filter: { objectIds: ids }, excludedEffect: "opacity(12%) grayscale(100%)" };
```

The fade stays a `featureEffect` rather than a renderer swap because it leaves
the service's symbology alone (assigning a renderer overrides it — see the note
in `user-layers`) and composes with the connector's zoom-thinning
`definitionExpression` instead of competing for the same property.

### A caveat on `highlightOptions`

`highlightOptions` is **view-global** in ArcGIS 4.25 (per-layer arrived later),
and `user-layers` highlights its own features relying on the default colour. So
this plugin installs its magenta options only while a category is selected and
restores the previous value on clear — bounding the overlap to a selection the
operator deliberately switched on. If both are active at once, a user-layer
feature highlight will also be magenta until the category is cleared.

Requires ArcGIS JS **4.22+** for `featureEffect`; the connector loads 4.25/4.26.

## Known limits

- The highlight is an `objectIds` filter, so the id list is fetched to the
  client. Fine for a cell of a few thousand shots; a capture-sized hit list has
  not been measured. If it bites, the fix is a second FeatureLayer pointed at v2
  with `customParameters: { tags: … }`, which filters server-side.
- Single selection only. Two categories at once would need the per-tag `tag_*`
  fields and a three-field `UniqueValueRenderer`.

## Build

```sh
npm run build        # or: ../../node_modules/.bin/vite build
```

Released as a subtree — see `release-subtrees.sh` in the repo root.
