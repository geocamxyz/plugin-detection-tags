import { detectionTags } from "./lib/detection-tags.js";

// <geocam-viewer-detection-tags>
//
// Lists the segmentation categories found in this cell and recolours the shots
// carrying the selected one, so you can see the hits *and their neighbours* and
// judge whether the model missed a frame.
//
// Normally needs no attributes. The categories live on the consolidated
// public_id-keyed FeatureServer, while the map is usually pointed at the legacy
// cell+{slug} service; the legacy service root advertises its v2 equivalent as
// `geocam.v2Path`, so the plugin discovers it from the connector's own src.
//
//   src    optional. The v2 FeatureServer root, if you would rather name it
//          than have it discovered.
//   token  optional. A PAT, for when the viewer is not same-origin with the
//          Manager and so has no session cookie to send.
//
// Follows the established plugin contract: lives inside <geocam-viewer>, waits
// for the host viewer and for the arcgis connector to publish `.mapView`, then
// registers via viewer.plugin().
export class GeocamViewerDetectionTags extends HTMLElement {
  constructor() {
    super();
    this.plugin = null;
    this.viewer = null;
  }

  connectedCallback() {
    const host = this.closest("geocam-viewer");
    if (!host) {
      console.error("GeocamViewerDetectionTags must be a child of GeocamViewer");
      return;
    }

    // The connector publishes `.mapView` only once geocam-map has built the
    // Esri view and called connector.link(). Until then there is nothing to
    // attach to. Warn once if that never happens rather than poll in silence.
    let waited = 0;
    const warnAfterMs = 8000;

    const attach = () => {
      const viewer = host.viewer;
      const connector = host.querySelector(
        "geocam-viewer-arcgis-map, geocam-viewer-arcgis-scene"
      );
      const mapView = connector && connector.mapView;

      if (waited === warnAfterMs) {
        console.warn(
          "detection-tags: still waiting to attach after 8s —",
          `viewer: ${!!viewer}, connector: ${!!connector}, mapView: ${!!mapView}`
        );
      }

      if (viewer && typeof viewer.plugin === "function" && mapView) {
        if (this.plugin) return;
        this.viewer = viewer;
        this.plugin = new detectionTags({
          mapView,
          src: this.getAttribute("src"),
          // What the map is drawing. Only used to discover the v2 service when
          // `src` was not given.
          connectorSrc: connector.getAttribute("src"),
          token: this.getAttribute("token"),
          // Default is to list every category and disable the ones at full
          // coverage rather than hide them — see the README.
          hideFullCoverage: this.hasAttribute("hide-full-coverage"),
        });
        this.viewer.plugin(this.plugin);
      } else {
        waited += 100;
        setTimeout(attach, 100);
      }
    };

    attach();
  }

  disconnectedCallback() {
    if (this.plugin && typeof this.plugin.destroy === "function") {
      this.plugin.destroy();
    }
    this.plugin = null;
    this.viewer = null;
  }
}

window.customElements.define(
  "geocam-viewer-detection-tags",
  GeocamViewerDetectionTags
);
