# sim-parity

Golden check for `docs/sim`. It replays the whole simulator timeline with a fixed clock and compares a git ref with the working tree.

```sh
cd tools/sim-parity && npm install
node check.mjs          # against the commit in GOLDEN_REF
node check.mjs <ref>    # against another ref
```

Each scenario in `scenarios.mjs` runs 1360 frames of 100 ms. The check fails when any of these differ:

- **Scene state, every frame.** Per object: type, visibility, world matrix, material colour and opacity, geometry and instance buffers. Also the camera matrices.
- **Rendered DOM, every frame.** `outerHTML` of the body without `<script>` elements, plus `innerText`.
- **3D pixels, every 20 frames.** PNG read back from the WebGL canvas right after the draw (SwiftShader, deterministic).

Full-page screenshots (`f####-screen.png`, every 40 frames) are saved for review. Headless Chrome's compositor can show part of the page a frame late, so they are reported as info, not as a gate.

The page runs with `Math.random`, `performance.now`, `requestAnimationFrame` and timers replaced by deterministic versions. The sim code is not modified. Chrome comes from `/Applications/Google Chrome.app` unless `CHROME` is set. `ONLY=medium` and `FRAMES=200` narrow a capture.

`check.mjs` then runs `editor-check.mjs`. It renders every editor tab (with no draft and with the custom draft) on both versions, compares each tab's DOM, and replays both exported standalone simulators through the same frame capture.

`pxdiff.mjs a.png b.png [mask.png]` prints the pixel count, bounding box and largest channel delta between two images.
