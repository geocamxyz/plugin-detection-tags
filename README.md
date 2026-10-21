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

It sets `featureEffect` on the shots layer rather than replacing the renderer:

```js
layer.featureEffect = {
  filter: { objectIds: ids },
  includedEffect: "drop-shadow(0 0 6px #ff00ff) saturate(300%)",
  excludedEffect: "opacity(12%) grayscale(100%)",   // "fade the rest"
};
```

Three reasons over a `uniqueValue` renderer:

- it leaves the service's own symbology alone (assigning a renderer overrides
  it — see the note in `user-layers`);
- it composes with the connector's zoom-thinning `definitionExpression` rather
  than competing for the same property;
- `excludedEffect` gives show-only-the-hits without a second query or a filter.

Requires ArcGIS JS **4.22+** for `featureEffect`; the connector loads 4.25.

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
